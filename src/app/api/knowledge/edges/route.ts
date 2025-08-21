import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/knowledge/edges - Get knowledge edges with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fromNodeId = searchParams.get('fromNodeId');
    const toNodeId = searchParams.get('toNodeId');
    const relation = searchParams.get('relation');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    
    if (fromNodeId) where.fromNodeId = fromNodeId;
    if (toNodeId) where.toNodeId = toNodeId;
    if (relation) where.relation = relation;

    const edges = await db.knowledgeEdge.findMany({
      where,
      include: {
        fromNode: true,
        toNode: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, edges });
  } catch (error) {
    console.error('Error fetching knowledge edges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge edges' },
      { status: 500 }
    );
  }
}

// POST /api/knowledge/edges - Create new knowledge edge
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fromNodeId, toNodeId, relation, weight, metadata } = await request.json();

    if (!fromNodeId || !toNodeId || !relation) {
      return NextResponse.json({ 
        error: 'From node ID, to node ID, and relation are required' 
      }, { status: 400 });
    }

    // Check if nodes exist
    const fromNode = await db.knowledgeNode.findUnique({
      where: { id: fromNodeId },
    });

    const toNode = await db.knowledgeNode.findUnique({
      where: { id: toNodeId },
    });

    if (!fromNode || !toNode) {
      return NextResponse.json({ 
        error: 'One or both nodes not found' 
      }, { status: 404 });
    }

    const edge = await db.knowledgeEdge.create({
      data: {
        fromNodeId,
        toNodeId,
        relation,
        weight: weight || 1.0,
        metadata,
      },
      include: {
        fromNode: true,
        toNode: true,
      },
    });

    return NextResponse.json({
      success: true,
      edge,
    });
  } catch (error) {
    console.error('Error creating knowledge edge:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge edge' },
      { status: 500 }
    );
  }
}