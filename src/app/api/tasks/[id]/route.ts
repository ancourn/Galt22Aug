import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  type: z.enum(['task', 'bug', 'feature', 'epic']).optional(),
  projectId: z.string().optional(),
  teamId: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
});

const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
});

const addTimeEntrySchema = z.object({
  description: z.string().optional(),
  hours: z.number().min(0, 'Hours must be positive'),
  date: z.string(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/tasks/[id] - Get a specific task
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const task = await db.task.findFirst({
      where: {
        id: params.id,
        OR: [
          { reporterId: user.id },
          { assigneeId: user.id },
          { team: { members: { some: { userId: user.id } } } },
          { project: { userId: user.id } },
        ],
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        reporter: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        project: {
          select: { id: true, title: true },
        },
        team: {
          select: { id: true, name: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        timeEntries: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
          orderBy: { date: 'desc' },
        },
        attachments: true,
        _count: {
          select: {
            comments: true,
            timeEntries: true,
            attachments: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    // Check if user has access to the task
    const existingTask = await db.task.findFirst({
      where: {
        id: params.id,
        OR: [
          { reporterId: user.id },
          { assigneeId: user.id },
          { team: { members: { some: { userId: user.id } } } },
          { project: { userId: user.id } },
        ],
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    // Convert date strings to Date objects and handle status changes
    const updateData: any = { ...validatedData };
    
    if (validatedData.dueDate) {
      updateData.dueDate = new Date(validatedData.dueDate);
    }
    
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    }

    // Auto-set completedAt when status changes to done
    if (validatedData.status === 'done' && existingTask.status !== 'done') {
      updateData.completedAt = new Date();
    } else if (validatedData.status && validatedData.status !== 'done') {
      updateData.completedAt = null;
    }

    const updatedTask = await db.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        reporter: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        project: {
          select: { id: true, title: true },
        },
        team: {
          select: { id: true, name: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        timeEntries: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            timeEntries: true,
            attachments: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check if user is the reporter or has admin privileges
    const task = await db.task.findFirst({
      where: {
        id: params.id,
        OR: [
          { reporterId: user.id },
          { project: { userId: user.id } },
          { team: { ownerId: user.id } },
          { 
            team: { 
              members: { 
                some: { 
                  userId: user.id, 
                  role: { in: ['owner', 'admin'] } 
                } 
              } 
            } 
          },
        ],
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 });
    }

    await db.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tasks/[id]/comments - Add a comment to a task
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Check if user has access to the task
    const task = await db.task.findFirst({
      where: {
        id: params.id,
        OR: [
          { reporterId: user.id },
          { assigneeId: user.id },
          { team: { members: { some: { userId: user.id } } } },
          { project: { userId: user.id } },
        ],
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 });
    }

    const body = await request.json();
    const { content } = addCommentSchema.parse(body);

    const comment = await db.taskComment.create({
      data: {
        taskId: params.id,
        userId: user.id,
        content,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}