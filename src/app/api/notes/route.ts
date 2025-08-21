import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/notes - Get all notes for authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    const where: any = { userId: session.user.id };
    
    if (tag) {
      where.tags = {
        contains: tag
      };
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const notes = await db.note.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, tags, metadata } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const note = await db.note.create({
      data: {
        title,
        content,
        tags: tags ? JSON.stringify(tags) : null,
        userId: session.user.id,
        metadata,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create knowledge graph node
    await db.knowledgeNode.create({
      data: {
        moduleId: 'notes',
        title: note.title,
        type: 'document',
        content: note.content || '',
        url: `/notes/${note.id}`,
        metadata: {
          noteId: note.id,
          tags: tags || [],
          category: metadata?.type || 'general',
        },
      },
    });

    // Create search document
    await db.searchDocument.create({
      data: {
        moduleId: 'notes',
        title: note.title,
        content: note.content || '',
        url: `/notes/${note.id}`,
        metadata: {
          type: 'note',
          tags: tags || [],
          category: metadata?.type || 'general',
        },
      },
    });

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}