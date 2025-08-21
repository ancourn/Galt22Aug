import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/knowledge/nodes/[id] - Get knowledge node by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const node = await db.knowledgeNode.findUnique({
      where: { id: params.id },
      include: {
        edgesAsFrom: {
          include: {
            toNode: true
          }
        },
        edgesAsTo: {
          include: {
            fromNode: true
          }
        }
      },
    });

    if (!node) {
      return NextResponse.json({ error: 'Knowledge node not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, node });
  } catch (error) {
    console.error('Error fetching knowledge node:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge node' },
      { status: 500 }
    );
  }
}

// PUT /api/knowledge/nodes/[id] - Update knowledge node
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, type, content, url, metadata } = await request.json();

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (content !== undefined) updateData.content = content;
    if (url !== undefined) updateData.url = url;
    if (metadata !== undefined) updateData.metadata = metadata;

    const node = await db.knowledgeNode.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      node,
    });
  } catch (error) {
    console.error('Error updating knowledge node:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge node' },
      { status: 500 }
    );
  }
}

// DELETE /api/knowledge/nodes/[id] - Delete knowledge node
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete related edges first
    await db.knowledgeEdge.deleteMany({
      where: {
        OR: [
          { fromNodeId: params.id },
          { toNodeId: params.id }
        ]
      },
    });

    await db.knowledgeNode.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Knowledge node deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting knowledge node:', error);
    return NextResponse.json(
      { error: 'Failed to delete knowledge node' },
      { status: 500 }
    );
  }
}