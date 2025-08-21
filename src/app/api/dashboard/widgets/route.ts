import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createWidgetSchema = z.object({
  name: z.string().min(1, 'Widget name is required'),
  type: z.enum(['chart', 'metric', 'table', 'list']),
  widgetType: z.enum(['line_chart', 'bar_chart', 'pie_chart', 'metric_card', 'data_table', 'activity_list']),
  title: z.string().min(1, 'Widget title is required'),
  description: z.string().optional(),
  config: z.object({}).optional(),
  position: z.number().min(0).optional(),
  isVisible: z.boolean().default(true),
});

const updateWidgetSchema = z.object({
  name: z.string().min(1, 'Widget name is required').optional(),
  type: z.enum(['chart', 'metric', 'table', 'list']).optional(),
  widgetType: z.enum(['line_chart', 'bar_chart', 'pie_chart', 'metric_card', 'data_table', 'activity_list']).optional(),
  title: z.string().min(1, 'Widget title is required').optional(),
  description: z.string().optional(),
  config: z.object({}).optional(),
  position: z.number().min(0).optional(),
  isVisible: z.boolean().optional(),
});

// GET /api/dashboard/widgets - Get user's dashboard widgets
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

    const widgets = await db.dashboardWidget.findMany({
      where: { userId: user.id },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json(widgets);
  } catch (error) {
    console.error('Error fetching dashboard widgets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/dashboard/widgets - Create a new dashboard widget
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
    const validatedData = createWidgetSchema.parse(body);

    // Get the next position
    const lastWidget = await db.dashboardWidget.findFirst({
      where: { userId: user.id },
      orderBy: { position: 'desc' },
    });

    const position = lastWidget ? lastWidget.position + 1 : 0;

    const widget = await db.dashboardWidget.create({
      data: {
        ...validatedData,
        userId: user.id,
        position: validatedData.position ?? position,
      },
    });

    return NextResponse.json(widget, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error creating dashboard widget:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}