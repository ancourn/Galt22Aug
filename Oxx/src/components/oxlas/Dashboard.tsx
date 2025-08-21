'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Mail,
  Calendar,
  HardDrive,
  Video,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { AIAssistant } from '@/components/ai/ai-assistant';

export default function Dashboard() {
  const stats = [
    {
      title: 'Unread Emails',
      value: '12',
      change: '+2',
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Upcoming Events',
      value: '5',
      change: '+1',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Storage Used',
      value: '7.2GB',
      change: '48%',
      icon: HardDrive,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Meetings',
      value: '2',
      change: '0',
      icon: Video,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const recentActivities = [
    {
      type: 'email',
      title: 'New email from Sarah Johnson',
      description: 'Project update and next steps',
      time: '2 minutes ago',
      status: 'unread',
    },
    {
      type: 'calendar',
      title: 'Team meeting scheduled',
      description: 'Weekly sync with development team',
      time: '15 minutes ago',
      status: 'confirmed',
    },
    {
      type: 'file',
      title: 'Document shared with you',
      description: 'Q4 Financial Report.xlsx',
      time: '1 hour ago',
      status: 'shared',
    },
    {
      type: 'meet',
      title: 'Meeting recording available',
      description: 'Client presentation - 45 minutes',
      time: '2 hours ago',
      status: 'recorded',
    },
  ];

  const quickActions = [
    {
      title: 'Compose Email',
      description: 'Write and send a new email',
      icon: Mail,
      color: 'bg-blue-600',
      href: '/inbox?compose=true',
    },
    {
      title: 'Schedule Meeting',
      description: 'Create a new calendar event',
      icon: Calendar,
      color: 'bg-green-600',
      href: '/calendar?new=true',
    },
    {
      title: 'Upload File',
      description: 'Add files to your drive',
      icon: HardDrive,
      color: 'bg-purple-600',
      href: '/drive?upload=true',
    },
    {
      title: 'Start Meeting',
      description: 'Begin a video conference',
      icon: Video,
      color: 'bg-red-600',
      href: '/meet?start=true',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, John!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your Oxlas workspace today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>{stat.change} from last hour</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-muted/50"
                  asChild
                >
                  <a href={action.href}>
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Your latest workspace activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1">
                    {activity.type === 'email' && (
                      <Mail className="h-4 w-4 text-blue-600" />
                    )}
                    {activity.type === 'calendar' && (
                      <Calendar className="h-4 w-4 text-green-600" />
                    )}
                    {activity.type === 'file' && (
                      <HardDrive className="h-4 w-4 text-purple-600" />
                    )}
                    {activity.type === 'meet' && (
                      <Video className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {activity.title}
                      </p>
                      {activity.status === 'unread' && (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Section */}
      <AIAssistant />

      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Overview</CardTitle>
          <CardDescription>
            Your storage usage across different services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Storage</span>
                <span className="font-medium">7.2 GB / 15 GB</span>
              </div>
              <Progress value={48} className="h-2" />
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Emails</span>
                  <span className="font-medium">2.1 GB</span>
                </div>
                <Progress value={30} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Files</span>
                  <span className="font-medium">3.8 GB</span>
                </div>
                <Progress value={53} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Media</span>
                  <span className="font-medium">1.3 GB</span>
                </div>
                <Progress value={18} className="h-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}