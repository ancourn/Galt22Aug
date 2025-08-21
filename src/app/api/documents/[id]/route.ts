import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const document = await db.document.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          { visibility: 'public' },
          { visibility: 'team' },
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        team: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, title: true },
        },
        task: {
          select: { id: true, title: true },
        },
        analyses: {
          orderBy: { createdAt: 'desc' },
        },
        versions: {
          orderBy: { version: 'desc' },
        },
        shares: {
          include: {
            sharedByUser: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check team visibility permissions
    if (document.visibility === 'team' && document.teamId) {
      const teamMember = await db.teamMember.findFirst({
        where: {
          teamId: document.teamId,
          userId: session.user.id,
        },
      });

      if (!teamMember && document.userId !== session.user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, visibility, tags } = body;

    // Check if user owns the document
    const existingDocument = await db.document.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    const document = await db.document.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(visibility && { visibility }),
        ...(tags !== undefined && { tags }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        team: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, title: true },
        },
        task: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns the document
    const document = await db.document.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    // Delete file from disk
    try {
      await unlink(document.filePath);
    } catch (error) {
      console.warn('Failed to delete file from disk:', error);
    }

    // Delete document and related records from database
    await db.document.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    // Check if user owns the document
    const existingDocument = await db.document.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    switch (action) {
      case 'share':
        const { sharedWith, permission, message, expiresAt } = data;
        
        // Check if user exists
        const sharedUser = await db.user.findUnique({
          where: { email: sharedWith },
        });

        if (!sharedUser) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const share = await db.documentShare.create({
          data: {
            documentId: params.id,
            sharedWith: sharedUser.id,
            sharedBy: session.user.id,
            permission: permission || 'view',
            message,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
          },
          include: {
            sharedByUser: {
              select: { id: true, name: true, email: true },
            },
            sharedWithUser: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        // Emit real-time notification
        const { getIO } = await import('@/lib/socket');
        const io = getIO();
        io.to(`user:${sharedUser.id}`).emit('document_shared', {
          documentId: params.id,
          sharedBy: session.user.name,
          permission,
          message,
        });

        return NextResponse.json(share);

      case 'reprocess':
        // Trigger document reprocessing
        await db.document.update({
          where: { id: params.id },
          data: { 
            status: 'processing',
            processingLog: JSON.stringify({
              steps: [
                { step: 'reprocessing', status: 'started', timestamp: new Date().toISOString() }
              ]
            })
          },
        });

        // Simulate reprocessing
        setTimeout(async () => {
          await processDocument(params.id);
        }, 1000);

        return NextResponse.json({ message: 'Document reprocessing started' });

      case 'archive':
        await db.document.update({
          where: { id: params.id },
          data: { status: 'archived' },
        });

        return NextResponse.json({ message: 'Document archived successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing document action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processDocument(documentId: string) {
  try {
    const document = await db.document.findUnique({
      where: { id: documentId },
      include: { user: true },
    });

    if (!document) return;

    // Simulate AI analysis
    const analyses = [
      {
        type: 'entity_extraction',
        analysis: {
          entities: [
            { type: 'PERSON', text: 'John Doe', confidence: 0.95 },
            { type: 'ORGANIZATION', text: 'Acme Corp', confidence: 0.88 },
          ],
        },
        confidence: 0.92,
        processingTime: 150,
      },
      {
        type: 'sentiment_analysis',
        analysis: {
          sentiment: 'neutral',
          confidence: 0.85,
          emotions: {
            joy: 0.3,
            sadness: 0.2,
            anger: 0.1,
            fear: 0.1,
            surprise: 0.3,
          },
        },
        confidence: 0.85,
        processingTime: 200,
      },
      {
        type: 'summary',
        analysis: {
          summary: `This document discusses various topics related to ${document.title}. Key points include important information that has been extracted and analyzed.`,
          keyPoints: [
            'Important point 1',
            'Important point 2',
            'Important point 3',
          ],
        },
        confidence: 0.78,
        processingTime: 300,
      },
    ];

    // Clear existing analyses
    await db.documentAnalysis.deleteMany({
      where: { documentId },
    });

    // Create new analysis records
    for (const analysis of analyses) {
      await db.documentAnalysis.create({
        data: {
          documentId,
          type: analysis.type,
          analysis: analysis.analysis,
          confidence: analysis.confidence,
          processingTime: analysis.processingTime,
        },
      });
    }

    // Update document status
    await db.document.update({
      where: { id: documentId },
      data: {
        status: 'ready',
        processingLog: JSON.stringify({
          steps: [
            { step: 'reprocessing', status: 'completed', timestamp: new Date().toISOString() },
            { step: 'analysis', status: 'completed', timestamp: new Date().toISOString() },
          ]
        })
      },
    });

    // Emit real-time notification
    const { getIO } = await import('@/lib/socket');
    const io = getIO();
    io.to(`user:${document.userId}`).emit('document_processed', {
      documentId,
      status: 'ready',
      message: 'Document reprocessing completed',
    });

  } catch (error) {
    console.error('Error processing document:', error);
    
    await db.document.update({
      where: { id: documentId },
      data: { 
        status: 'failed',
        processingLog: JSON.stringify({
          steps: [
            { step: 'reprocessing', status: 'failed', timestamp: new Date().toISOString(), error: error.message },
          ]
        })
      },
    });
  }
}