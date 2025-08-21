import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/notes/[id] - Get note by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const note = await db.note.findUnique({
      where: { id: params.id },
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

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Users can only access their own notes unless they're admin
    if (note.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, tags, metadata } = await request.json();

    // Check if note exists and user has access
    const existingNote = await db.note.findUnique({
      where: { id: params.id },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (existingNote.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null;
    if (metadata !== undefined) updateData.metadata = metadata;

    const note = await db.note.update({
      where: { id: params.id },
      data: updateData,
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

    // Update knowledge graph node
    await db.knowledgeNode.updateMany({
      where: {
        moduleId: 'notes',
        metadata: {
          path: ['noteId'],
          equals: params.id,
        },
      },
      data: {
        title: note.title,
        content: note.content || '',
        metadata: {
          noteId: note.id,
          tags: tags ? JSON.parse(tags) : [],
          category: metadata?.type || 'general',
        },
      },
    });

    // Update search document
    await db.searchDocument.updateMany({
      where: {
        moduleId: 'notes',
        metadata: {
          path: ['noteId'],
          equals: params.id,
        },
      },
      data: {
        title: note.title,
        content: note.content || '',
        metadata: {
          type: 'note',
          tags: tags ? JSON.parse(tags) : [],
          category: metadata?.type || 'general',
        },
      },
    });

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if note exists and user has access
    const existingNote = await db.note.findUnique({
      where: { id: params.id },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (existingNote.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.note.delete({
      where: { id: params.id },
    });

    // Delete related knowledge graph nodes
    await db.knowledgeNode.deleteMany({
      where: {
        moduleId: 'notes',
        metadata: {
          path: ['noteId'],
          equals: params.id,
        },
      },
    });

    // Delete related search documents
    await db.searchDocument.deleteMany({
      where: {
        moduleId: 'notes',
        metadata: {
          path: ['noteId'],
          equals: params.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}