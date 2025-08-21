import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

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

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT /api/dashboard/widgets/[id] - Update a dashboard widget
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

    // Check if widget exists and belongs to user
    const existingWidget = await db.dashboardWidget.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingWidget) {
      return NextResponse.json({ error: 'Widget not found or access denied' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateWidgetSchema.parse(body);

    const updatedWidget = await db.dashboardWidget.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(updatedWidget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error updating dashboard widget:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/dashboard/widgets/[id] - Delete a dashboard widget
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

    // Check if widget exists and belongs to user
    const widget = await db.dashboardWidget.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!widget) {
      return NextResponse.json({ error: 'Widget not found or access denied' }, { status: 404 });
    }

    await db.dashboardWidget.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Widget deleted successfully' });
  } catch (error) {
    console.error('Error deleting dashboard widget:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}