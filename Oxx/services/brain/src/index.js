const express = require('express');
const natural = require('natural');
const nlp = require('compromise');
const { Pool } = require('pg');
const { createClient } = require('redis');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Redis connection
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Natural Language Processing setup
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const tfidf = new natural.TfIdf();
const sentiment = new natural.SentimentAnalyzer('English', 
  natural.PorterStemmer, ['negation']);

// Middleware
app.use(express.json());

// Knowledge Graph Service
class KnowledgeGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.embeddings = new Map();
  }

  // Add a node to the knowledge graph
  async addNode(node) {
    try {
      const result = await pool.query(
        `INSERT INTO knowledge_nodes 
         (id, moduleId, title, type, content, url, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         content = EXCLUDED.content,
         metadata = EXCLUDED.metadata,
         updated_at = NOW()
         RETURNING *`,
        [node.id, node.moduleId, node.title, node.type, node.content, node.url, JSON.stringify(node.metadata)]
      );

      const savedNode = result.rows[0];
      this.nodes.set(node.id, savedNode);

      // Process content for relationships
      await this.processContent(savedNode);

      return savedNode;
    } catch (error) {
      console.error('Failed to add node:', error);
      throw error;
    }
  }

  // Process content to extract relationships
  async processContent(node) {
    try {
      const text = `${node.title} ${node.content || ''}`;
      
      // Extract entities using compromise
      const doc = nlp(text);
      
      // Extract keywords
      const keywords = this.extractKeywords(text);
      
      // Extract named entities
      const entities = {
        people: doc.people().out('array'),
        places: doc.places().out('array'),
        organizations: doc.organizations().out('array'),
        dates: doc.dates().out('array'),
        topics: doc.topics().out('array')
      };

      // Find relationships with existing nodes
      await this.findRelationships(node, keywords, entities);

      // Update node metadata with extracted info
      const metadata = {
        ...node.metadata,
        keywords,
        entities,
        sentiment: this.analyzeSentiment(text),
        processedAt: new Date().toISOString()
      };

      await pool.query(
        'UPDATE knowledge_nodes SET metadata = $1 WHERE id = $2',
        [JSON.stringify(metadata), node.id]
      );

    } catch (error) {
      console.error('Failed to process content:', error);
    }
  }

  // Extract keywords from text
  extractKeywords(text) {
    const tokens = tokenizer.tokenize(text.toLowerCase());
    const filteredTokens = tokens.filter(token => 
      token.length > 2 && 
      !natural.stopwords.includes(token) &&
      !/^\d+$/.test(token)
    );
    
    // Apply stemming
    const stemmedTokens = filteredTokens.map(token => stemmer.stem(token));
    
    // Calculate TF-IDF scores
    tfidf.addDocument(stemmedTokens);
    
    // Get top keywords
    const keywords = [];
    tfidf.listTerms(0).forEach(term => {
      if (term.tfidf > 0.1) {
        keywords.push({
          term: term.term,
          score: term.tfidf,
          original: this.findOriginalTerm(term.term, tokens)
        });
      }
    });

    return keywords.slice(0, 10); // Top 10 keywords
  }

  // Find original term from stemmed version
  findOriginalTerm(stemmed, tokens) {
    for (const token of tokens) {
      if (stemmer.stem(token) === stemmed) {
        return token;
      }
    }
    return stemmed;
  }

  // Analyze sentiment of text
  analyzeSentiment(text) {
    const tokens = tokenizer.tokenize(text.toLowerCase());
    const filteredTokens = tokens.filter(token => 
      !natural.stopwords.includes(token)
    );
    
    const score = sentiment.getSentiment(filteredTokens);
    
    return {
      score,
      magnitude: Math.abs(score),
      classification: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
    };
  }

  // Find relationships between nodes
  async findRelationships(node, keywords, entities) {
    try {
      // Get all existing nodes
      const result = await pool.query(
        'SELECT * FROM knowledge_nodes WHERE id != $1',
        [node.id]
      );
      
      const existingNodes = result.rows;

      for (const existingNode of existingNodes) {
        const relationshipScore = this.calculateRelationshipScore(
          node, 
          existingNode, 
          keywords, 
          entities
        );

        if (relationshipScore > 0.3) {
          await this.createEdge(node.id, existingNode.id, 'related_to', relationshipScore);
        }
      }

      // Check for specific relationships
      await this.checkSpecificRelationships(node, keywords, entities);

    } catch (error) {
      console.error('Failed to find relationships:', error);
    }
  }

  // Calculate relationship score between two nodes
  calculateRelationshipScore(node1, node2, keywords1, entities1) {
    let score = 0;

    // Keyword overlap
    const keywords2 = this.extractKeywords(`${node2.title} ${node2.content || ''}`);
    const keywordOverlap = keywords1.filter(k1 => 
      keywords2.some(k2 => k1.term === k2.term)
    );
    
    score += (keywordOverlap.length / Math.max(keywords1.length, keywords2.length)) * 0.4;

    // Entity overlap
    const entities2 = node2.metadata?.entities || {};
    let entityOverlap = 0;
    
    Object.keys(entities1).forEach(type => {
      if (entities2[type]) {
        const overlap = entities1[type].filter(e => entities2[type].includes(e));
        entityOverlap += overlap.length;
      }
    });
    
    score += (entityOverlap / 10) * 0.3;

    // Module relationship bonus
    if (node1.moduleId === node2.moduleId) {
      score += 0.1;
    }

    // Time proximity (if both have timestamps)
    if (node1.metadata?.createdAt && node2.metadata?.createdAt) {
      const timeDiff = Math.abs(
        new Date(node1.metadata.createdAt) - new Date(node2.metadata.createdAt)
      );
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      
      if (daysDiff < 7) score += 0.1;
      else if (daysDiff < 30) score += 0.05;
    }

    return Math.min(score, 1.0);
  }

  // Check for specific relationship types
  async checkSpecificRelationships(node, keywords, entities) {
    // Check for mentions of projects in other content
    if (node.moduleId !== 'projects') {
      const projectKeywords = ['project', 'task', 'board', 'planka'];
      const hasProjectMention = keywords.some(k => 
        projectKeywords.includes(k.original) || 
        k.original.toLowerCase().includes('project')
      );

      if (hasProjectMention) {
        // Find related projects
        const projects = await pool.query(
          "SELECT * FROM knowledge_nodes WHERE moduleId = 'projects'"
        );

        for (const project of projects.rows) {
          const projectTitle = project.title.toLowerCase();
          const hasMention = keywords.some(k => 
            projectTitle.includes(k.original) || 
            k.original.includes(projectTitle)
          );

          if (hasMention) {
            await this.createEdge(node.id, project.id, 'mentions', 0.8);
          }
        }
      }
    }

    // Check for ticket references
    if (node.moduleId !== 'care') {
      const ticketKeywords = ['ticket', 'issue', 'bug', 'support', 'zammad'];
      const hasTicketMention = keywords.some(k => 
        ticketKeywords.includes(k.original) || 
        k.original.toLowerCase().includes('ticket')
      );

      if (hasTicketMention) {
        const tickets = await pool.query(
          "SELECT * FROM knowledge_nodes WHERE moduleId = 'care'"
        );

        for (const ticket of tickets.rows) {
          const ticketTitle = ticket.title.toLowerCase();
          const hasMention = keywords.some(k => 
            ticketTitle.includes(k.original) || 
            k.original.includes(ticketTitle)
          );

          if (hasMention) {
            await this.createEdge(node.id, ticket.id, 'references', 0.7);
          }
        }
      }
    }
  }

  // Create an edge between two nodes
  async createEdge(fromNodeId, toNodeId, relation, weight) {
    try {
      // Check if edge already exists
      const existing = await pool.query(
        'SELECT * FROM knowledge_edges WHERE from_node_id = $1 AND to_node_id = $2 AND relation = $3',
        [fromNodeId, toNodeId, relation]
      );

      if (existing.rows.length > 0) {
        // Update existing edge
        await pool.query(
          'UPDATE knowledge_edges SET weight = $1, metadata = $2 WHERE id = $3',
          [weight, JSON.stringify({ updatedAt: new Date().toISOString() }), existing.rows[0].id]
        );
      } else {
        // Create new edge
        await pool.query(
          `INSERT INTO knowledge_edges (from_node_id, to_node_id, relation, weight, metadata)
           VALUES ($1, $2, $3, $4, $5)`,
          [fromNodeId, toNodeId, relation, weight, JSON.stringify({ createdAt: new Date().toISOString() })]
        );
      }
    } catch (error) {
      console.error('Failed to create edge:', error);
    }
  }

  // Get related nodes
  async getRelatedNodes(nodeId, limit = 10) {
    try {
      const result = await pool.query(
        `SELECT kn.*, ke.relation, ke.weight as edge_weight
         FROM knowledge_nodes kn
         JOIN knowledge_edges ke ON kn.id = ke.to_node_id
         WHERE ke.from_node_id = $1
         ORDER BY ke.weight DESC
         LIMIT $2`,
        [nodeId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Failed to get related nodes:', error);
      return [];
    }
  }

  // Search nodes
  async searchNodes(query, limit = 20) {
    try {
      const searchQuery = `%${query.toLowerCase()}%`;
      
      const result = await pool.query(
        `SELECT *, 
                ts_rank_cd(textsearchable_index_col, to_tsquery('english', $1)) as rank
         FROM knowledge_nodes
         WHERE textsearchable_index_col @@ to_tsquery('english', $1)
         ORDER BY rank DESC
         LIMIT $2`,
        [query, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Failed to search nodes:', error);
      return [];
    }
  }

  // Get graph statistics
  async getStats() {
    try {
      const nodeCount = await pool.query('SELECT COUNT(*) FROM knowledge_nodes');
      const edgeCount = await pool.query('SELECT COUNT(*) FROM knowledge_edges');
      
      const moduleStats = await pool.query(
        `SELECT moduleId, COUNT(*) as count
         FROM knowledge_nodes
         GROUP BY moduleId`
      );

      const relationStats = await pool.query(
        `SELECT relation, COUNT(*) as count
         FROM knowledge_edges
         GROUP BY relation`
      );

      return {
        nodes: parseInt(nodeCount.rows[0].count),
        edges: parseInt(edgeCount.rows[0].count),
        modules: moduleStats.rows,
        relations: relationStats.rows
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }
}

// Initialize Knowledge Graph
const knowledgeGraph = new KnowledgeGraph();

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/index', async (req, res) => {
  try {
    const { moduleId, title, type, content, url, metadata } = req.body;

    if (!moduleId || !title || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const nodeId = `${moduleId}_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const node = {
      id: nodeId,
      moduleId,
      title,
      type,
      content,
      url,
      metadata: metadata || {}
    };

    const savedNode = await knowledgeGraph.addNode(node);
    
    res.json({ success: true, node: savedNode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/nodes/:nodeId/related', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { limit = 10 } = req.query;

    const relatedNodes = await knowledgeGraph.getRelatedNodes(nodeId, parseInt(limit));
    
    res.json(relatedNodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await knowledgeGraph.searchNodes(q, parseInt(limit));
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/stats', async (req, res) => {
  try {
    const stats = await knowledgeGraph.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/sync/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    // Mock implementation - would fetch data from actual services
    console.log(`Syncing data for module: ${moduleId}`);
    
    // Simulate syncing process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({ 
      success: true, 
      message: `Synced data for ${moduleId}`,
      synced: Math.floor(Math.random() * 50) + 10
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Oxlas Brain server running on port ${PORT}`);
});

// Initialize
async function initialize() {
  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('Connected to Redis');

    // Create text search index if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS knowledge_nodes (
        id VARCHAR(255) PRIMARY KEY,
        moduleId VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT,
        url VARCHAR(500),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS knowledge_edges (
        id VARCHAR(255) PRIMARY KEY,
        from_node_id VARCHAR(255) NOT NULL,
        to_node_id VARCHAR(255) NOT NULL,
        relation VARCHAR(50) NOT NULL,
        weight FLOAT DEFAULT 1.0,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add text search index
    await pool.query(`
      ALTER TABLE knowledge_nodes 
      ADD COLUMN IF NOT EXISTS textsearchable_index_col tsvector
    `);

    await pool.query(`
      UPDATE knowledge_nodes 
      SET textsearchable_index_col = to_tsvector('english', title || ' ' || COALESCE(content, ''))
      WHERE textsearchable_index_col IS NULL
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_search 
      ON knowledge_nodes USING GIN(textsearchable_index_col)
    `);

    console.log('Oxlas Brain initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Oxlas Brain:', error);
    process.exit(1);
  }
}

initialize();