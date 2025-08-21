import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createReportSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  description: z.string().optional(),
  type: z.enum(['team_performance', 'project_summary', 'productivity', 'custom']),
  config: z.object({}).optional(),
  schedule: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).optional(),
  format: z.enum(['pdf', 'csv', 'json']).default('pdf'),
  recipients: z.array(z.string().email()).optional(),
  isActive: z.boolean().default(true),
});

const updateReportSchema = z.object({
  name: z.string().min(1, 'Report name is required').optional(),
  description: z.string().optional(),
  type: z.enum(['team_performance', 'project_summary', 'productivity', 'custom']).optional(),
  config: z.object({}).optional(),
  schedule: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).optional(),
  format: z.enum(['pdf', 'csv', 'json']).optional(),
  recipients: z.array(z.string().email()).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/reports - Get user's reports
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

    const reports = await db.report.findMany({
      where: { userId: user.id },
      include: {
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 5, // Last 5 executions
        },
        _count: {
          select: {
            executions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reports - Create a new report
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
    const validatedData = createReportSchema.parse(body);

    // Calculate next run date if schedule is provided
    let nextRunAt = null;
    if (validatedData.schedule) {
      const now = new Date();
      switch (validatedData.schedule) {
        case 'daily':
          nextRunAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          nextRunAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          nextRunAt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case 'quarterly':
          nextRunAt = new Date(now.getFullYear(), now.getMonth() + 3, 1);
          break;
      }
    }

    const report = await db.report.create({
      data: {
        ...validatedData,
        userId: user.id,
        recipients: validatedData.recipients || [],
        nextRunAt,
      },
      include: {
        executions: true,
        _count: {
          select: {
            executions: true,
          },
        },
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}