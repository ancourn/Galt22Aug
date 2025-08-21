import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/automations/[id] - Get automation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const automation = await db.automation.findUnique({
      where: { id: params.id },
      include: {
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, automation });
  } catch (error) {
    console.error('Error fetching automation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation' },
      { status: 500 }
    );
  }
}

// PUT /api/automations/[id] - Update automation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, enabled, trigger, actions } = await request.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (trigger !== undefined) updateData.trigger = trigger;
    if (actions !== undefined) updateData.actions = actions;

    const automation = await db.automation.update({
      where: { id: params.id },
      data: updateData,
      include: {
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      success: true,
      automation,
    });
  } catch (error) {
    console.error('Error updating automation:', error);
    return NextResponse.json(
      { error: 'Failed to update automation' },
      { status: 500 }
    );
  }
}

// DELETE /api/automations/[id] - Delete automation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete execution history first
    await db.automationExecution.deleteMany({
      where: { automationId: params.id },
    });

    await db.automation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Automation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting automation:', error);
    return NextResponse.json(
      { error: 'Failed to delete automation' },
      { status: 500 }
    );
  }
}

// POST /api/automations/[id]/execute - Manually trigger automation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const automation = await db.automation.findUnique({
      where: { id: params.id },
    });

    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    if (!automation.enabled) {
      return NextResponse.json({ error: 'Automation is disabled' }, { status: 400 });
    }

    // Execute automation
    const execution = await executeAutomation(automation);

    return NextResponse.json({
      success: true,
      execution,
    });
  } catch (error) {
    console.error('Error executing automation:', error);
    return NextResponse.json(
      { error: 'Failed to execute automation' },
      { status: 500 }
    );
  }
}

// Helper function to execute automation
async function executeAutomation(automation: any) {
  const execution = await db.automationExecution.create({
    data: {
      automationId: automation.id,
      triggerData: { manual: true, triggeredBy: 'admin' },
      status: 'running',
    },
  });

  try {
    const actionResults = [];

    for (const action of automation.actions) {
      try {
        const result = await executeAction(action);
        actionResults.push({ action: action.type, result: 'success', data: result });
      } catch (error) {
        actionResults.push({ 
          action: action.type, 
          result: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    await db.automationExecution.update({
      where: { id: execution.id },
      data: {
        status: 'success',
        actionResults,
      },
    });

    return execution;
  } catch (error) {
    await db.automationExecution.update({
      where: { id: execution.id },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

// Helper function to execute individual actions
async function executeAction(action: any) {
  switch (action.type) {
    case 'send_notification':
      return await sendNotification(action);
    case 'update_knowledge_graph':
      return await updateKnowledgeGraph(action);
    case 'create_project':
      return await createProject(action);
    case 'create_note':
      return await createNote(action);
    case 'webhook':
      return await callWebhook(action);
    case 'email':
      return await sendEmail(action);
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

// Action implementations
async function sendNotification(action: any) {
  // This would integrate with your notification system
  console.log('Sending notification:', action.message);
  return { sent: true, message: action.message };
}

async function updateKnowledgeGraph(action: any) {
  // This would update the knowledge graph
  console.log('Updating knowledge graph:', action.action);
  return { updated: true, action: action.action };
}

async function createProject(action: any) {
  // This would create a new project
  console.log('Creating project:', action.title);
  return { created: true, title: action.title };
}

async function createNote(action: any) {
  // This would create a new note
  console.log('Creating note:', action.title);
  return { created: true, title: action.title };
}

async function callWebhook(action: any) {
  // This would call an external webhook
  console.log('Calling webhook:', action.url);
  const response = await fetch(action.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(action.data || {}),
  });
  
  return { 
    called: true, 
    url: action.url, 
    status: response.status 
  };
}

async function sendEmail(action: any) {
  // This would send an email
  console.log('Sending email to:', action.to);
  return { sent: true, to: action.to, subject: action.subject };
}