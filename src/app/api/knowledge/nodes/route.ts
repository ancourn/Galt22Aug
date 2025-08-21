import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/knowledge/nodes - Get knowledge nodes with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    
    if (moduleId) where.moduleId = moduleId;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const nodes = await db.knowledgeNode.findMany({
      where,
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
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, nodes });
  } catch (error) {
    console.error('Error fetching knowledge nodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge nodes' },
      { status: 500 }
    );
  }
}

// POST /api/knowledge/nodes - Create new knowledge node
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleId, title, type, content, url, metadata } = await request.json();

    if (!moduleId || !title || !type) {
      return NextResponse.json({ 
        error: 'Module ID, title, and type are required' 
      }, { status: 400 });
    }

    const node = await db.knowledgeNode.create({
      data: {
        moduleId,
        title,
        type,
        content,
        url,
        metadata,
      },
    });

    return NextResponse.json({
      success: true,
      node,
    });
  } catch (error) {
    console.error('Error creating knowledge node:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge node' },
      { status: 500 }
    );
  }
}