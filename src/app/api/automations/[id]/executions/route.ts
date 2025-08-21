import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/automations/[id]/executions - Get execution history for automation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = { automationId: params.id };
    if (status) where.status = status;

    const [executions, total] = await Promise.all([
      db.automationExecution.findMany({
        where,
        orderBy: { executedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.automationExecution.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      executions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching automation executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation executions' },
      { status: 500 }
    );
  }
}