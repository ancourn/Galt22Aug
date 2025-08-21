import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/search - Global search across all modules
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const moduleId = searchParams.get('moduleId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim() === '') {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const results = {
      projects: [],
      notes: [],
      documents: [],
      total: 0,
    };

    // Search in projects
    if (!moduleId || moduleId === 'projects') {
      const projects = await db.project.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
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
        take: limit,
      });

      results.projects = projects.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        type: 'project',
        moduleId: 'projects',
        url: `/projects/${project.id}`,
        metadata: {
          status: project.status,
          priority: project.priority,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      }));
    }

    // Search in notes
    if (!moduleId || moduleId === 'notes') {
      const notes = await db.note.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { tags: { contains: query, mode: 'insensitive' } },
          ],
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
        take: limit,
      });

      results.notes = notes.map(note => ({
        id: note.id,
        title: note.title,
        description: note.content ? note.content.substring(0, 200) + '...' : '',
        type: 'note',
        moduleId: 'notes',
        url: `/notes/${note.id}`,
        metadata: {
          tags: note.tags ? JSON.parse(note.tags) : [],
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        },
      }));
    }

    // Search in knowledge graph
    if (!moduleId || moduleId === 'knowledge') {
      const knowledgeNodes = await db.knowledgeNode.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
          ...(type && { type }),
        },
        take: limit,
      });

      results.documents = knowledgeNodes.map(node => ({
        id: node.id,
        title: node.title,
        description: node.content ? node.content.substring(0, 200) + '...' : '',
        type: node.type,
        moduleId: node.moduleId,
        url: node.url,
        metadata: {
          ...node.metadata,
          createdAt: node.createdAt,
          updatedAt: node.updatedAt,
        },
      }));
    }

    // Search in search documents (fallback)
    const searchDocuments = await db.searchDocument.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
        ...(moduleId && { moduleId }),
      },
      take: limit,
    });

    // Add fallback results if no results found
    if (results.projects.length === 0 && results.notes.length === 0 && results.documents.length === 0) {
      results.documents = searchDocuments.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.content.substring(0, 200) + '...',
        type: 'document',
        moduleId: doc.moduleId,
        url: doc.url,
        metadata: {
          ...doc.metadata,
          indexedAt: doc.indexedAt,
        },
      }));
    }

    results.total = results.projects.length + results.notes.length + results.documents.length;

    return NextResponse.json({
      success: true,
      query,
      results,
      total: results.total,
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

// POST /api/search/index - Index content for search
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleId, title, content, url, metadata } = await request.json();

    if (!moduleId || !title || !content || !url) {
      return NextResponse.json(
        { error: 'ModuleId, title, content, and url are required' },
        { status: 400 }
      );
    }

    // Check if document already exists
    const existingDocument = await db.searchDocument.findFirst({
      where: {
        moduleId,
        url,
      },
    });

    if (existingDocument) {
      // Update existing document
      const document = await db.searchDocument.update({
        where: { id: existingDocument.id },
        data: {
          title,
          content,
          metadata,
          indexedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        document,
        message: 'Document updated in search index',
      });
    } else {
      // Create new document
      const document = await db.searchDocument.create({
        data: {
          moduleId,
          title,
          content,
          url,
          metadata,
        },
      });

      return NextResponse.json({
        success: true,
        document,
        message: 'Document added to search index',
      });
    }
  } catch (error) {
    console.error('Error indexing document:', error);
    return NextResponse.json(
      { error: 'Failed to index document' },
      { status: 500 }
    );
  }
}