import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/knowledge/edges/[id] - Get knowledge edge by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const edge = await db.knowledgeEdge.findUnique({
      where: { id: params.id },
      include: {
        fromNode: true,
        toNode: true,
      },
    });

    if (!edge) {
      return NextResponse.json({ error: 'Knowledge edge not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, edge });
  } catch (error) {
    console.error('Error fetching knowledge edge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge edge' },
      { status: 500 }
    );
  }
}

// PUT /api/knowledge/edges/[id] - Update knowledge edge
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { relation, weight, metadata } = await request.json();

    const updateData: any = {};
    if (relation !== undefined) updateData.relation = relation;
    if (weight !== undefined) updateData.weight = weight;
    if (metadata !== undefined) updateData.metadata = metadata;

    const edge = await db.knowledgeEdge.update({
      where: { id: params.id },
      data: updateData,
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
    console.error('Error updating knowledge edge:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge edge' },
      { status: 500 }
    );
  }
}

// DELETE /api/knowledge/edges/[id] - Delete knowledge edge
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.knowledgeEdge.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Knowledge edge deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting knowledge edge:', error);
    return NextResponse.json(
      { error: 'Failed to delete knowledge edge' },
      { status: 500 }
    );
  }
}