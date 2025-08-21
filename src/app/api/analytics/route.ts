import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const analyticsQuerySchema = z.object({
  type: z.enum(['task_completion', 'team_productivity', 'project_progress', 'user_activity']),
  entityType: z.enum(['task', 'team', 'project', 'user']).optional(),
  entityId: z.string().optional(),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  metrics: z.array(z.string()).optional(),
});

// GET /api/analytics - Get analytics data with aggregation
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
    const query = Object.fromEntries(searchParams);
    const validatedQuery = analyticsQuerySchema.parse(query);

    // Build date range filter
    const startDate = validatedQuery.startDate 
      ? new Date(validatedQuery.startDate) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    
    const endDate = validatedQuery.endDate 
      ? new Date(validatedQuery.endDate) 
      : new Date();

    let analyticsData;

    switch (validatedQuery.type) {
      case 'task_completion':
        analyticsData = await getTaskCompletionAnalytics(user, validatedQuery, startDate, endDate);
        break;
      case 'team_productivity':
        analyticsData = await getTeamProductivityAnalytics(user, validatedQuery, startDate, endDate);
        break;
      case 'project_progress':
        analyticsData = await getProjectProgressAnalytics(user, validatedQuery, startDate, endDate);
        break;
      case 'user_activity':
        analyticsData = await getUserActivityAnalytics(user, validatedQuery, startDate, endDate);
        break;
      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
    }

    return NextResponse.json(analyticsData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getTaskCompletionAnalytics(user: any, query: any, startDate: Date, endDate: Date) {
  // Get tasks the user has access to
  const whereClause: any = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
    OR: [
      { reporterId: user.id },
      { assigneeId: user.id },
      { team: { members: { some: { userId: user.id } } } },
      { project: { userId: user.id } },
    ],
  };

  if (query.entityType === 'team' && query.entityId) {
    whereClause.teamId = query.entityId;
  } else if (query.entityType === 'project' && query.entityId) {
    whereClause.projectId = query.entityId;
  }

  const [totalTasks, completedTasks, tasksByStatus, tasksByPriority, completionTrend] = await Promise.all([
    // Total tasks
    db.task.count({ where: whereClause }),

    // Completed tasks
    db.task.count({
      where: {
        ...whereClause,
        status: 'done',
      },
    }),

    // Tasks by status
    db.task.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { status: true },
    }),

    // Tasks by priority
    db.task.groupBy({
      by: ['priority'],
      where: whereClause,
      _count: { priority: true },
    }),

    // Completion trend (daily)
    db.task.findMany({
      where: {
        ...whereClause,
        status: 'done',
        completedAt: { not: null },
      },
      select: {
        completedAt: true,
      },
      orderBy: { completedAt: 'asc' },
    }),
  ]);

  // Calculate completion rate
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Group completion trend by day
  const completionByDay = completionTrend.reduce((acc: any, task) => {
    const date = task.completedAt?.toISOString().split('T')[0];
    if (date) {
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    type: 'task_completion',
    summary: {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      completionRate: Math.round(completionRate * 100) / 100,
    },
    breakdown: {
      byStatus: tasksByStatus,
      byPriority: tasksByPriority,
    },
    trends: {
      completionByDay,
    },
    period: query.period,
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
  };
}

async function getTeamProductivityAnalytics(user: any, query: any, startDate: Date, endDate: Date) {
  // Get teams the user belongs to
  const teams = await db.team.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      tasks: {
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      _count: {
        select: {
          tasks: true,
          members: true,
          projects: true,
        },
      },
    },
  });

  const teamAnalytics = await Promise.all(teams.map(async (team) => {
    const teamTasks = team.tasks;
    const completedTasks = teamTasks.filter(task => task.status === 'done').length;
    const totalEstimatedHours = teamTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const totalActualHours = teamTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

    // Calculate productivity metrics
    const completionRate = teamTasks.length > 0 ? (completedTasks / teamTasks.length) * 100 : 0;
    const efficiency = totalEstimatedHours > 0 ? (totalEstimatedHours / totalActualHours) * 100 : 100;

    return {
      teamId: team.id,
      teamName: team.name,
      metrics: {
        totalTasks: teamTasks.length,
        completedTasks,
        completionRate: Math.round(completionRate * 100) / 100,
        totalMembers: team._count.members,
        totalEstimatedHours,
        totalActualHours,
        efficiency: Math.round(efficiency * 100) / 100,
      },
      members: team.members.map(member => ({
        userId: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
      })),
    };
  }));

  // Overall productivity metrics
  const overallMetrics = {
    totalTeams: teams.length,
    totalTasks: teams.reduce((sum, team) => sum + team.tasks.length, 0),
    totalCompletedTasks: teams.reduce((sum, team) => sum + team.tasks.filter(t => t.status === 'done').length, 0),
    totalMembers: teams.reduce((sum, team) => sum + team._count.members, 0),
    averageCompletionRate: teamAnalytics.length > 0 
      ? teamAnalytics.reduce((sum, team) => sum + team.metrics.completionRate, 0) / teamAnalytics.length 
      : 0,
  };

  return {
    type: 'team_productivity',
    summary: overallMetrics,
    teams: teamAnalytics,
    period: query.period,
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
  };
}

async function getProjectProgressAnalytics(user: any, query: any, startDate: Date, endDate: Date) {
  // Get projects the user has access to
  const whereClause: any = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
    OR: [
      { userId: user.id },
      { team: { members: { some: { userId: user.id } } } },
    ],
  };

  if (query.entityId) {
    whereClause.id = query.entityId;
  }

  const projects = await db.project.findMany({
    where: whereClause,
    include: {
      tasks: {
        select: {
          id: true,
          status: true,
          priority: true,
          estimatedHours: true,
          actualHours: true,
          dueDate: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  const projectAnalytics = projects.map(project => {
    const tasks = project.tasks;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
    const overdueTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
    ).length;

    const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    const progressScore = tasks.length > 0 
      ? ((completedTasks * 2 + inProgressTasks) / tasks.length) * 100 
      : 0;

    return {
      projectId: project.id,
      projectName: project.title,
      status: project.status,
      priority: project.priority,
      metrics: {
        totalTasks: tasks.length,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        completionRate: Math.round(completionRate * 100) / 100,
        progressScore: Math.round(progressScore * 100) / 100,
        totalEstimatedHours,
        totalActualHours,
      },
      team: project.team,
      owner: project.user,
    };
  });

  // Overall project metrics
  const overallMetrics = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalTasks: projects.reduce((sum, project) => sum + project.tasks.length, 0),
    averageCompletionRate: projectAnalytics.length > 0 
      ? projectAnalytics.reduce((sum, project) => sum + project.metrics.completionRate, 0) / projectAnalytics.length 
      : 0,
    totalOverdueTasks: projectAnalytics.reduce((sum, project) => sum + project.metrics.overdueTasks, 0),
  };

  return {
    type: 'project_progress',
    summary: overallMetrics,
    projects: projectAnalytics,
    period: query.period,
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
  };
}

async function getUserActivityAnalytics(user: any, query: any, startDate: Date, endDate: Date) {
  // Get user activities
  const whereClause: any = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (query.entityId) {
    whereClause.userId = query.entityId;
  } else {
    // Only show activities for user's teams and projects
    const userTeams = await db.teamMember.findMany({
      where: { userId: user.id },
      select: { teamId: true },
    });

    const userProjects = await db.project.findMany({
      where: {
        OR: [
          { userId: user.id },
          { teamId: { in: userTeams.map(tm => tm.teamId) } },
        ],
      },
      select: { id: true },
    });

    whereClause.OR = [
      { userId: user.id },
      { 
        AND: [
          { entityType: 'team' },
          { entityId: { in: userTeams.map(tm => tm.teamId) } },
        ],
      },
      { 
        AND: [
          { entityType: 'project' },
          { entityId: { in: userProjects.map(p => p.id) } },
        ],
      },
    ];
  }

  const [activities, activityByAction, activityByType, dailyActivity] = await Promise.all([
    // Get activities
    db.userActivity.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit for performance
    }),

    // Activities by action type
    db.userActivity.groupBy({
      by: ['action'],
      where: whereClause,
      _count: { action: true },
    }),

    // Activities by entity type
    db.userActivity.groupBy({
      by: ['entityType'],
      where: whereClause,
      _count: { entityType: true },
    }),

    // Daily activity counts
    db.userActivity.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        action: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Group daily activity by date
  const dailyActivityCounts = dailyActivity.reduce((acc: any, activity) => {
    const date = activity.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { total: 0, actions: {} };
    }
    acc[date].total += 1;
    acc[date].actions[activity.action] = (acc[date].actions[activity.action] || 0) + 1;
    return acc;
  }, {});

  // Calculate activity metrics
  const totalActivities = activities.length;
  const uniqueUsers = new Set(activities.map(a => a.userId)).size;
  const avgActivitiesPerDay = totalActivities / Math.max(1, Object.keys(dailyActivityCounts).length);

  return {
    type: 'user_activity',
    summary: {
      totalActivities,
      uniqueUsers,
      avgActivitiesPerDay: Math.round(avgActivitiesPerDay * 100) / 100,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    },
    breakdown: {
      byAction: activityByAction,
      byEntityType: activityByType,
    },
    trends: {
      dailyActivity: dailyActivityCounts,
    },
    recentActivities: activities.slice(0, 20), // Show recent 20 activities
    period: query.period,
  };
}