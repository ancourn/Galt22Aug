import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/automations - Get all automations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const enabled = searchParams.get('enabled');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (enabled !== null) {
      where.enabled = enabled === 'true';
    }

    const automations = await db.automation.findMany({
      where,
      include: {
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, automations });
  } catch (error) {
    console.error('Error fetching automations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automations' },
      { status: 500 }
    );
  }
}

// POST /api/automations - Create new automation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, enabled = true, trigger, actions } = await request.json();

    if (!name || !trigger || !actions) {
      return NextResponse.json({ 
        error: 'Name, trigger, and actions are required' 
      }, { status: 400 });
    }

    // Validate trigger structure
    if (!trigger.type || !trigger.condition) {
      return NextResponse.json({ 
        error: 'Trigger must include type and condition' 
      }, { status: 400 });
    }

    // Validate actions structure
    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json({ 
        error: 'Actions must be a non-empty array' 
      }, { status: 400 });
    }

    for (const action of actions) {
      if (!action.type) {
        return NextResponse.json({ 
          error: 'Each action must have a type' 
        }, { status: 400 });
      }
    }

    const automation = await db.automation.create({
      data: {
        name,
        description,
        enabled,
        trigger,
        actions,
      },
      include: {
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      success: true,
      automation,
    });
  } catch (error) {
    console.error('Error creating automation:', error);
    return NextResponse.json(
      { error: 'Failed to create automation' },
      { status: 500 }
    );
  }
}