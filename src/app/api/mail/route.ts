import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { Server } from 'socket.io';
import { setupSocket } from '@/lib/socket';

// Initialize Socket.IO server
const io = new Server({
  path: '/api/socketio',
});

// Setup socket handlers
setupSocket(io);

// Validation schemas
const createMailSchema = z.object({
  to: z.string().min(1, 'Recipient is required'),
  toNames: z.string().optional(),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  textContent: z.string().optional(),
  status: z.enum(['inbox', 'sent', 'draft', 'trash', 'archived']).optional().default('sent'),
  folder: z.enum(['inbox', 'sent', 'draft', 'trash', 'archived', 'starred']).optional().default('sent'),
  hasAttachments: z.boolean().optional().default(false),
  attachments: z.array(z.object({
    filename: z.string(),
    originalName: z.string(),
    fileSize: z.number(),
    mimeType: z.string(),
    filePath: z.string(),
  })).optional(),
});

const updateMailSchema = z.object({
  read: z.boolean().optional(),
  starred: z.boolean().optional(),
  important: z.boolean().optional(),
  folder: z.enum(['inbox', 'sent', 'draft', 'trash', 'archived', 'starred']).optional(),
  status: z.enum(['inbox', 'sent', 'draft', 'trash', 'archived']).optional(),
});

// Helper function to emit socket events
const emitMailEvent = (userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, {
    userId,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// GET /api/mail - Get all mails for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'inbox';
    const status = searchParams.get('status') || 'inbox';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const starred = searchParams.get('starred') === 'true';
    const unread = searchParams.get('unread') === 'true';

    const skip = (page - 1) * limit;

    const where: any = {
      userId: session.user.id,
    };

    // Filter by folder
    if (folder !== 'all') {
      where.folder = folder;
    }

    // Filter by status
    if (status !== 'all') {
      where.status = status;
    }

    // Filter by starred
    if (starred) {
      where.starred = true;
    }

    // Filter by unread
    if (unread) {
      where.read = false;
    }

    // Search functionality
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { from: { contains: search, mode: 'insensitive' } },
        { fromName: { contains: search, mode: 'insensitive' } },
        { to: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [mails, total] = await Promise.all([
      db.mail.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          mailAttachments: true,
        },
      }),
      db.mail.count({ where }),
    ]);

    return NextResponse.json({
      mails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching mails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mails' },
      { status: 500 }
    );
  }
}

// POST /api/mail - Create a new mail
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createMailSchema.parse(body);

    // Create the mail
    const mail = await db.mail.create({
      data: {
        userId: session.user.id,
        from: session.user.email || '',
        fromName: session.user.name || '',
        to: validatedData.to,
        toNames: validatedData.toNames,
        cc: validatedData.cc,
        bcc: validatedData.bcc,
        subject: validatedData.subject,
        content: validatedData.content,
        textContent: validatedData.textContent,
        status: validatedData.status,
        folder: validatedData.folder,
        hasAttachments: validatedData.hasAttachments,
        attachments: validatedData.attachments,
        messageId: `<${Date.now()}@${process.env.NEXT_PUBLIC_APP_URL || 'localhost'}>`,
      },
      include: {
        mailAttachments: true,
      },
    });

    // Emit socket event for real-time update
    emitMailEvent(session.user.id, 'mail:sent', { mail });

    return NextResponse.json(mail, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating mail:', error);
    return NextResponse.json(
      { error: 'Failed to create mail' },
      { status: 500 }
    );
  }
}