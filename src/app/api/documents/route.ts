import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const visibility = searchParams.get('visibility') || '';
    const teamId = searchParams.get('teamId') || '';
    const projectId = searchParams.get('projectId') || '';
    const taskId = searchParams.get('taskId') || '';

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { extractedText: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (visibility) {
      where.visibility = visibility;
    }

    if (teamId) {
      where.teamId = teamId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (taskId) {
      where.taskId = taskId;
    }

    const [documents, total] = await Promise.all([
      db.document.findMany({
        where,
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
            select: { id: true, type: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          },
          versions: {
            select: { id: true, version: true, createdAt: true },
            orderBy: { version: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.document.count({ where }),
    ]);

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const visibility = formData.get('visibility') as string || 'private';
    const teamId = formData.get('teamId') as string || null;
    const projectId = formData.get('projectId') as string || null;
    const taskId = formData.get('taskId') as string || null;
    const tags = formData.get('tags') as string || null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(process.cwd(), 'uploads', 'documents', fileName);

    // Ensure upload directory exists
    const uploadDir = path.dirname(filePath);
    await import('fs').then(fs => {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create document record
    const document = await db.document.create({
      data: {
        title: title || file.name,
        description,
        fileName,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        filePath,
        status: 'uploading',
        visibility,
        userId: user.id,
        teamId,
        projectId,
        taskId,
        tags,
        processingLog: JSON.stringify({
          steps: [
            { step: 'upload', status: 'completed', timestamp: new Date().toISOString() }
          ]
        }),
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

    // Trigger document processing (this would be done in a background job in production)
    // For now, we'll simulate it
    setTimeout(async () => {
      await processDocument(document.id);
    }, 1000);

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processDocument(documentId: string) {
  try {
    // Update document status to processing
    await db.document.update({
      where: { id: documentId },
      data: { 
        status: 'processing',
        processingLog: JSON.stringify({
          steps: [
            { step: 'upload', status: 'completed', timestamp: new Date().toISOString() },
            { step: 'processing', status: 'started', timestamp: new Date().toISOString() }
          ]
        })
      },
    });

    const document = await db.document.findUnique({
      where: { id: documentId },
      include: { user: true },
    });

    if (!document) return;

    // Simulate text extraction (in production, use OCR or document parsing libraries)
    const extractedText = `Document content for ${document.title}. This is a simulated text extraction for demonstration purposes.`;

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

    // Create analysis records
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

    // Update document with extracted data
    await db.document.update({
      where: { id: documentId },
      data: {
        status: 'ready',
        extractedText,
        metadata: {
          pageCount: Math.floor(Math.random() * 50) + 1,
          wordCount: extractedText.split(' ').length,
          language: 'en',
          author: document.user.name,
          created: new Date().toISOString(),
        },
        processingLog: JSON.stringify({
          steps: [
            { step: 'upload', status: 'completed', timestamp: new Date().toISOString() },
            { step: 'processing', status: 'completed', timestamp: new Date().toISOString() },
            { step: 'analysis', status: 'completed', timestamp: new Date().toISOString() },
          ]
        })
      },
    });

    // Emit real-time notification via Socket.IO
    const { getIO } = await import('@/lib/socket');
    const io = getIO();
    io.to(`user:${document.userId}`).emit('document_processed', {
      documentId,
      status: 'ready',
      message: 'Document processing completed',
    });

  } catch (error) {
    console.error('Error processing document:', error);
    
    // Update document status to failed
    await db.document.update({
      where: { id: documentId },
      data: { 
        status: 'failed',
        processingLog: JSON.stringify({
          steps: [
            { step: 'upload', status: 'completed', timestamp: new Date().toISOString() },
            { step: 'processing', status: 'failed', timestamp: new Date().toISOString(), error: error.message },
          ]
        })
      },
    });
  }
}