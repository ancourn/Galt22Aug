import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiAnalyzeKnowledgeGraph } from '@/lib/ai';

// GET /api/knowledge/recommendations - Get AI-powered recommendations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');
    const moduleId = searchParams.get('moduleId');
    const limit = parseInt(searchParams.get('limit') || '10');

    let recommendations = [];

    if (nodeId) {
      // Get recommendations for a specific node
      recommendations = await getNodeRecommendations(nodeId, limit);
    } else if (moduleId) {
      // Get recommendations for a specific module
      recommendations = await getModuleRecommendations(moduleId, limit);
    } else {
      // Get general recommendations
      recommendations = await getGeneralRecommendations(limit);
    }

    return NextResponse.json({ success: true, recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

// POST /api/knowledge/recommendations - Generate new recommendations using AI
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, nodeId, moduleId } = await request.json();

    let recommendations = [];

    switch (action) {
      case 'analyze-graph':
        // Use AI to analyze the knowledge graph and provide insights
        const nodes = await db.knowledgeNode.findMany({
          take: 50, // Limit to prevent overwhelming the AI
          include: {
            edgesAsFrom: true,
            edgesAsTo: true,
          },
        });

        const edges = await db.knowledgeEdge.findMany({
          take: 100, // Limit to prevent overwhelming the AI
        });

        const aiAnalysis = await aiAnalyzeKnowledgeGraph(nodes, edges);
        
        recommendations = {
          type: 'ai-analysis',
          insights: aiAnalysis.patterns || [],
          keyNodes: aiAnalysis.keyNodes || [],
          suggestions: aiAnalysis.recommendations || [],
          missingConnections: aiAnalysis.missingConnections || [],
          timestamp: new Date().toISOString(),
        };
        break;

      case 'generate-connections':
        // Generate potential new connections using AI
        if (nodeId) {
          recommendations = await generateConnectionRecommendations(nodeId);
        } else {
          return NextResponse.json({ 
            error: 'Node ID is required for connection generation' 
          }, { status: 400 });
        }
        break;

      case 'suggest-content':
        // Suggest new content based on existing knowledge graph
        recommendations = await suggestNewContent(moduleId);
        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid action specified' 
        }, { status: 400 });
    }

    return NextResponse.json({ success: true, recommendations });
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getNodeRecommendations(nodeId: string, limit: number) {
  // Get related nodes through edges
  const connectedNodes = await db.knowledgeEdge.findMany({
    where: {
      OR: [
        { fromNodeId: nodeId },
        { toNodeId: nodeId }
      ]
    },
    include: {
      fromNode: true,
      toNode: true,
    },
    orderBy: { weight: 'desc' },
    take: limit,
  });

  const recommendations = connectedNodes.map(edge => ({
    type: 'connection',
    node: edge.fromNodeId === nodeId ? edge.toNode : edge.fromNode,
    relation: edge.relation,
    weight: edge.weight,
    reason: `Connected via "${edge.relation}" relationship`,
  }));

  return recommendations;
}

async function getModuleRecommendations(moduleId: string, limit: number) {
  // Get nodes in the same module with high connectivity
  const nodes = await db.knowledgeNode.findMany({
    where: { moduleId },
    include: {
      edgesAsFrom: true,
      edgesAsTo: true,
    },
  });

  // Sort by connectivity (number of edges)
  const sortedNodes = nodes.sort((a, b) => {
    const aConnections = a.edgesAsFrom.length + a.edgesAsTo.length;
    const bConnections = b.edgesAsFrom.length + b.edgesAsTo.length;
    return bConnections - aConnections;
  });

  const recommendations = sortedNodes.slice(0, limit).map(node => ({
    type: 'popular-node',
    node,
    connections: node.edgesAsFrom.length + node.edgesAsTo.length,
    reason: `Highly connected node with ${node.edgesAsFrom.length + node.edgesAsTo.length} connections`,
  }));

  return recommendations;
}

async function getGeneralRecommendations(limit: number) {
  // Get recently created nodes across all modules
  const recentNodes = await db.knowledgeNode.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const recommendations = recentNodes.map(node => ({
    type: 'recent',
    node,
    reason: 'Recently added to knowledge graph',
  }));

  return recommendations;
}

async function generateConnectionRecommendations(nodeId: string) {
  // Get the source node
  const sourceNode = await db.knowledgeNode.findUnique({
    where: { id: nodeId },
  });

  if (!sourceNode) {
    throw new Error('Source node not found');
  }

  // Get nodes in the same module that are not already connected
  const existingConnections = await db.knowledgeEdge.findMany({
    where: {
      OR: [
        { fromNodeId: nodeId },
        { toNodeId: nodeId }
      ]
    },
  });

  const connectedNodeIds = new Set(
    existingConnections.flatMap(edge => [edge.fromNodeId, edge.toNodeId])
  );

  const potentialNodes = await db.knowledgeNode.findMany({
    where: {
      moduleId: sourceNode.moduleId,
      id: {
        notIn: Array.from(connectedNodeIds),
      },
    },
    take: 10,
  });

  const recommendations = potentialNodes.map(node => ({
    type: 'potential-connection',
    sourceNode,
    targetNode: node,
    reason: `Nodes in the same module (${sourceNode.moduleId}) that could be related`,
    suggestedRelation: 'related_to',
  }));

  return recommendations;
}

async function suggestNewContent(moduleId: string) {
  // Analyze existing content to suggest gaps
  const nodes = await db.knowledgeNode.findMany({
    where: { moduleId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Simple heuristic: suggest content based on existing patterns
  const types = nodes.map(n => n.type);
  const typeCounts = types.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const suggestions = Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type, count]) => ({
      type: 'content-suggestion',
      suggestedType: type,
      reason: `You have ${count} ${type} items, consider creating more`,
      moduleId,
    }));

  return suggestions;
}