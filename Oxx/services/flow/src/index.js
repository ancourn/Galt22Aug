const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const { Pool } = require('pg');
const { createClient } = require('redis');
const WebSocket = require('ws');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Redis connection
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ noServer: true });

// Middleware
app.use(express.json());

// Validation schemas
const automationSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  enabled: Joi.boolean().default(true),
  trigger: Joi.object({
    type: Joi.string().required(),
    condition: Joi.object().required(),
  }).required(),
  actions: Joi.array().items(
    Joi.object({
      type: Joi.string().required(),
      config: Joi.object().required(),
    })
  ).min(1).required(),
});

// Action executors
const actionExecutors = {
  // Formbricks actions
  'formbricks_create_survey': async (config) => {
    // Mock implementation - would call Formbricks API
    console.log('Creating Formbricks survey:', config);
    return { success: true, surveyId: `survey_${Date.now()}` };
  },

  'formbricks_get_responses': async (config) => {
    // Mock implementation - would query Formbricks API
    console.log('Getting Formbricks responses for survey:', config.surveyId);
    return { 
      success: true, 
      responses: [
        { id: 1, score: 4, comment: 'Great service!' },
        { id: 2, score: 2, comment: 'Needs improvement' },
      ]
    };
  },

  // Zammad actions
  'zammad_create_ticket': async (config) => {
    // Mock implementation - would call Zammad API
    console.log('Creating Zammad ticket:', config);
    return { success: true, ticketId: `ticket_${Date.now()}` };
  },

  'zammad_update_ticket': async (config) => {
    // Mock implementation - would call Zammad API
    console.log('Updating Zammad ticket:', config);
    return { success: true };
  },

  // Matrix/Chat actions
  'matrix_send_message': async (config) => {
    // Mock implementation - would call Matrix API
    console.log('Sending Matrix message:', config);
    return { success: true, messageId: `msg_${Date.now()}` };
  },

  // Planka actions
  'planka_create_project': async (config) => {
    // Mock implementation - would call Planka API
    console.log('Creating Planka project:', config);
    return { success: true, projectId: `project_${Date.now()}` };
  },

  'planka_create_task': async (config) => {
    // Mock implementation - would call Planka API
    console.log('Creating Planka task:', config);
    return { success: true, taskId: `task_${Date.now()}` };
  },

  // Outline actions
  'outline_create_page': async (config) => {
    // Mock implementation - would call Outline API
    console.log('Creating Outline page:', config);
    return { success: true, pageId: `page_${Date.now()}` };
  },

  // Joplin actions
  'joplin_create_note': async (config) => {
    // Mock implementation - would call Joplin API
    console.log('Creating Joplin note:', config);
    return { success: true, noteId: `note_${Date.now()}` };
  },

  // Generic HTTP actions
  'http_request': async (config) => {
    try {
      const response = await axios({
        method: config.method || 'POST',
        url: config.url,
        headers: config.headers || {},
        data: config.data || {},
      });
      return { success: true, response: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// Trigger handlers
const triggerHandlers = {
  // Formbricks triggers
  'formbricks_score': async (condition) => {
    // Mock implementation - would check Formbricks survey scores
    console.log('Checking Formbricks score condition:', condition);
    
    // Simulate getting survey responses
    const responses = await actionExecutors.formbricks_get_responses({ surveyId: condition.surveyId });
    
    const lowScores = responses.responses.filter(r => r.score < condition.threshold);
    
    return {
      matches: lowScores.length > 0,
      data: { lowScores, total: responses.responses.length }
    };
  },

  // Schedule triggers
  'schedule': async (condition) => {
    // This is handled by the cron scheduler
    return { matches: true, data: { scheduled: true } };
  },

  // Webhook triggers
  'webhook': async (condition, payload) => {
    // Validate webhook payload against condition
    console.log('Processing webhook trigger:', condition, payload);
    
    // Simple condition matching - in production, this would be more sophisticated
    let matches = true;
    
    if (condition.headers) {
      for (const [key, expectedValue] of Object.entries(condition.headers)) {
        if (payload.headers[key] !== expectedValue) {
          matches = false;
          break;
        }
      }
    }
    
    if (matches && condition.body) {
      for (const [key, expectedValue] of Object.entries(condition.body)) {
        if (payload.body[key] !== expectedValue) {
          matches = false;
          break;
        }
      }
    }
    
    return { matches, data: payload };
  },

  // Interval triggers
  'interval': async (condition) => {
    // This is handled by the setInterval scheduler
    return { matches: true, data: { interval: condition.interval } };
  },
};

// Execute automation
async function executeAutomation(automation, triggerData = null) {
  console.log(`Executing automation: ${automation.name}`);
  
  const execution = {
    automationId: automation.id,
    triggerData,
    actionResults: [],
    status: 'running',
    startTime: new Date(),
  };

  try {
    // Check trigger condition
    const triggerResult = await triggerHandlers[automation.trigger.type](
      automation.trigger.condition,
      triggerData
    );

    if (!triggerResult.matches) {
      execution.status = 'skipped';
      execution.message = 'Trigger condition not met';
      return execution;
    }

    // Execute actions
    for (const action of automation.actions) {
      try {
        const result = await actionExecutors[action.type](action.config);
        execution.actionResults.push({
          actionType: action.type,
          success: result.success,
          result: result,
        });

        if (!result.success) {
          throw new Error(`Action ${action.type} failed: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        execution.actionResults.push({
          actionType: action.type,
          success: false,
          error: error.message,
        });
        throw error;
      }
    }

    execution.status = 'success';
    execution.message = 'Automation completed successfully';
  } catch (error) {
    execution.status = 'failed';
    execution.error = error.message;
    execution.message = `Automation failed: ${error.message}`;
  }

  execution.endTime = new Date();
  
  // Store execution result
  await storeExecution(execution);
  
  // Notify WebSocket clients
  notifyClients(execution);
  
  return execution;
}

// Store execution in database
async function storeExecution(execution) {
  try {
    await pool.query(
      `INSERT INTO automation_executions 
       (automation_id, trigger_data, action_results, status, error, executed_at) 
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        execution.automationId,
        JSON.stringify(execution.triggerData),
        JSON.stringify(execution.actionResults),
        execution.status,
        execution.error || null,
      ]
    );
  } catch (error) {
    console.error('Failed to store execution:', error);
  }
}

// Notify WebSocket clients
function notifyClients(execution) {
  const message = JSON.stringify({
    type: 'execution',
    data: execution,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Load automations from database
async function loadAutomations() {
  try {
    const result = await pool.query(
      'SELECT * FROM automations WHERE enabled = true'
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to load automations:', error);
    return [];
  }
}

// Setup scheduled tasks
function setupScheduledTasks() {
  // Check for scheduled automations every minute
  cron.schedule('* * * * *', async () => {
    console.log('Checking scheduled automations...');
    
    const automations = await loadAutomations();
    
    for (const automation of automations) {
      if (automation.trigger.type === 'schedule') {
        const cronExpression = automation.trigger.condition.cron;
        if (cron.validate(cronExpression)) {
          // Check if it's time to run
          // In a real implementation, you'd use a more sophisticated scheduler
          console.log(`Would run scheduled automation: ${automation.name}`);
        }
      } else if (automation.trigger.type === 'interval') {
        // Handle interval-based triggers
        console.log(`Would run interval automation: ${automation.name}`);
      }
    }
  });
}

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/automations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM automations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/automations', async (req, res) => {
  try {
    const { error, value } = automationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await pool.query(
      `INSERT INTO automations (name, description, enabled, trigger, actions, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING *`,
      [
        value.name,
        value.description,
        value.enabled,
        JSON.stringify(value.trigger),
        JSON.stringify(value.actions),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/automations/:id/executions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM automation_executions WHERE automation_id = $1 ORDER BY executed_at DESC LIMIT 50',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/automations/:id/execute', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM automations WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    const automation = result.rows[0];
    const execution = await executeAutomation(automation, req.body.triggerData);

    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/webhook/:triggerId', async (req, res) => {
  try {
    const { triggerId } = req.params;
    
    // Find automations that match this webhook trigger
    const result = await pool.query(
      `SELECT * FROM automations 
       WHERE enabled = true 
       AND trigger->>'type' = 'webhook' 
       AND trigger->'condition'->>'id' = $1`,
      [triggerId]
    );

    for (const automation of result.rows) {
      executeAutomation(automation, {
        headers: req.headers,
        body: req.body,
      });
    }

    res.json({ received: true, processed: result.rows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket upgrade handler
app.server = app.listen(PORT, () => {
  console.log(`Oxlas Flow server running on port ${PORT}`);
});

app.server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Initialize
async function initialize() {
  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('Connected to Redis');

    // Setup scheduled tasks
    setupScheduledTasks();
    console.log('Scheduled tasks configured');

    // Load initial automations
    const automations = await loadAutomations();
    console.log(`Loaded ${automations.length} automations`);

    console.log('Oxlas Flow initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Oxlas Flow:', error);
    process.exit(1);
  }
}

initialize();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down Oxlas Flow...');
  await redisClient.disconnect();
  app.server.close(() => {
    console.log('Oxlas Flow stopped');
    process.exit(0);
  });
});