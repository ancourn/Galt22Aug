import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  type: z.enum(['task', 'bug', 'feature', 'epic']).optional().default('task'),
  projectId: z.string().optional(),
  teamId: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  estimatedHours: z.number().optional(),
});

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

// GET /api/tasks - Get all tasks for the current user
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assigneeId = searchParams.get('assigneeId');
    const teamId = searchParams.get('teamId');
    const projectId = searchParams.get('projectId');

    const whereClause: any = {
      OR: [
        { reporterId: user.id },
        { assigneeId: user.id },
        { team: { members: { some: { userId: user.id } } } },
        { project: { userId: user.id } },
      ],
    };

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (assigneeId) whereClause.assigneeId = assigneeId;
    if (teamId) whereClause.teamId = teamId;
    if (projectId) whereClause.projectId = projectId;

    const tasks = await db.task.findMany({
      where: whereClause,
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
          orderBy: { date: 'desc' },
        },
        _count: {
          select: {
            comments: true,
            timeEntries: true,
            attachments: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
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

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Convert date strings to Date objects
    const taskData = {
      ...validatedData,
      reporterId: user.id,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
    };

    const task = await db.task.create({
      data: taskData,
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
        timeEntries: true,
        _count: {
          select: {
            comments: true,
            timeEntries: true,
            attachments: true,
          },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}