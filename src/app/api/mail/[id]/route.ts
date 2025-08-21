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

// GET /api/mail/[id] - Get a specific mail
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mail = await db.mail.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        mailAttachments: true,
      },
    });

    if (!mail) {
      return NextResponse.json({ error: 'Mail not found' }, { status: 404 });
    }

    // Mark as read when viewed
    if (!mail.read) {
      await db.mail.update({
        where: { id: params.id },
        data: { read: true },
      });

      // Emit socket event for real-time update
      emitMailEvent(session.user.id, 'mail:updated', { 
        mailId: params.id, 
        updates: { read: true } 
      });
    }

    return NextResponse.json(mail);
  } catch (error) {
    console.error('Error fetching mail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mail' },
      { status: 500 }
    );
  }
}

// PUT /api/mail/[id] - Update a specific mail
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateMailSchema.parse(body);

    // Check if mail exists and belongs to user
    const existingMail = await db.mail.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingMail) {
      return NextResponse.json({ error: 'Mail not found' }, { status: 404 });
    }

    // Update the mail
    const updatedMail = await db.mail.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        mailAttachments: true,
      },
    });

    // Emit socket event for real-time update
    emitMailEvent(session.user.id, 'mail:updated', { 
      mailId: params.id, 
      updates: validatedData 
    });

    return NextResponse.json(updatedMail);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating mail:', error);
    return NextResponse.json(
      { error: 'Failed to update mail' },
      { status: 500 }
    );
  }
}

// DELETE /api/mail/[id] - Delete a specific mail
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if mail exists and belongs to user
    const existingMail = await db.mail.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingMail) {
      return NextResponse.json({ error: 'Mail not found' }, { status: 404 });
    }

    // Delete the mail (soft delete by moving to trash or hard delete)
    await db.mail.delete({
      where: { id: params.id },
    });

    // Emit socket event for real-time update
    emitMailEvent(session.user.id, 'mail:deleted', { mailId: params.id });

    return NextResponse.json({ message: 'Mail deleted successfully' });
  } catch (error) {
    console.error('Error deleting mail:', error);
    return NextResponse.json(
      { error: 'Failed to delete mail' },
      { status: 500 }
    );
  }
}