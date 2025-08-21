'use client';

import { useState, useEffect } from 'react';
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
  Plus,
  FileText,
  User,
  Star,
  Paperclip,
} from 'lucide-react';
import { AIAssistant } from '@/components/ai/ai-assistant';
import { useProjects, useNotes } from '@/hooks/use-api';
import { useRealTimeProjects, useRealTimeNotes } from '@/hooks/use-socket';
import { useMail, useMailStats } from '@/hooks/use-mail';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session } = useSession();
  const { data: projects, loading: projectsLoading } = useProjects();
  const { data: notes, loading: notesLoading } = useNotes();
  const { projectUpdates } = useRealTimeProjects();
  const { noteUpdates } = useRealTimeNotes();
  const { mails, loading: mailsLoading } = useMail({ folder: 'inbox', limit: 5 });
  const { stats: mailStats, loading: mailStatsLoading } = useMailStats();

  // Calculate stats from real data
  const stats = [
    {
      title: 'Inbox',
      value: mailStats?.counts?.unread || 0,
      change: `+${mailStats?.counts?.recent || 0}`,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Projects',
      value: projects?.projects?.filter(p => p.status === 'active').length || 0,
      change: '+1',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Notes',
      value: notes?.notes?.length || 0,
      change: '+3',
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Storage Used',
      value: '7.2GB',
      change: '48%',
      icon: HardDrive,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  // Generate recent activities from real data
  const recentActivities = [
    ...(mails?.slice(0, 2).map(mail => ({
      type: 'mail',
      title: `Email: ${mail.subject}`,
      description: `From ${mail.fromName || mail.from}`,
      time: 'Just now',
      status: mail.read ? 'read' : 'unread',
    })) || []),
    ...(projects?.projects?.slice(0, 2).map(project => ({
      type: 'project',
      title: `Project: ${project.title}`,
      description: project.description || 'No description',
      time: 'Just now',
      status: project.status,
    })) || []),
    ...(notes?.notes?.slice(0, 2).map(note => ({
      type: 'note',
      title: `Note: ${note.title}`,
      description: note.content ? note.content.substring(0, 100) + '...' : 'No content',
      time: 'Just now',
      status: 'created',
    })) || []),
    ...projectUpdates.slice(0, 1).map(update => ({
      type: 'project_update',
      title: 'Project updated',
      description: `Project ${update.projectId} was modified`,
      time: 'Just now',
      status: 'updated',
    })),
    ...noteUpdates.slice(0, 1).map(update => ({
      type: 'note_update',
      title: 'Note updated',
      description: `Note ${update.noteId} was modified`,
      time: 'Just now',
      status: 'updated',
    })),
  ];

  const quickActions = [
    {
      title: 'Compose Email',
      description: 'Write a new email',
      icon: Mail,
      color: 'bg-blue-600',
      href: '/inbox?compose=true',
    },
    {
      title: 'Create Project',
      description: 'Start a new project',
      icon: Plus,
      color: 'bg-green-600',
      href: '/projects?create=true',
    },
    {
      title: 'Create Note',
      description: 'Write a new note',
      icon: FileText,
      color: 'bg-purple-600',
      href: '/notes?create=true',
    },
    {
      title: 'Check Inbox',
      description: 'View your emails',
      icon: MessageSquare,
      color: 'bg-red-600',
      href: '/inbox',
    },
  ];

  const userProjects = projects?.projects || [];
  const userNotes = notes?.notes || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your Oxx workspace today.
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
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      {activity.type === 'mail' && (
                        <Mail className="h-4 w-4 text-blue-600" />
                      )}
                      {activity.type === 'project' && (
                        <FileText className="h-4 w-4 text-green-600" />
                      )}
                      {activity.type === 'note' && (
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      )}
                      {activity.type === 'project_update' && (
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                      )}
                      {activity.type === 'note_update' && (
                        <CheckCircle className="h-4 w-4 text-red-600" />
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
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects, Notes, and Emails */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Your latest projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading projects...</p>
                </div>
              ) : userProjects.length > 0 ? (
                userProjects.slice(0, 3).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{project.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {project.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                        <Badge variant="outline">{project.priority}</Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No projects yet</p>
                  <Button size="sm" className="mt-2" href="/projects?create=true">
                    Create Project
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
            <CardDescription>
              Your latest notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading notes...</p>
                </div>
              ) : userNotes.length > 0 ? (
                userNotes.slice(0, 3).map((note) => (
                  <div key={note.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{note.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {note.content ? note.content.substring(0, 100) + '...' : 'No content'}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {note.tags && JSON.parse(note.tags).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notes yet</p>
                  <Button size="sm" className="mt-2" href="/notes?create=true">
                    Create Note
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Emails */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Emails</CardTitle>
            <CardDescription>
              Your latest emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mailsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading emails...</p>
                </div>
              ) : mails && mails.length > 0 ? (
                mails.slice(0, 3).map((mail) => (
                  <div key={mail.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{mail.subject}</h4>
                      <p className="text-xs text-muted-foreground">
                        From: {mail.fromName || mail.from}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {!mail.read && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                        {mail.starred && (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        )}
                        {mail.hasAttachments && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No emails yet</p>
                  <Button size="sm" className="mt-2" href="/inbox?compose=true">
                    Compose Email
                  </Button>
                </div>
              )}
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
            
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projects</span>
                  <span className="font-medium">{userProjects.length} items</span>
                </div>
                <Progress value={Math.min((userProjects.length / 50) * 100, 100)} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Notes</span>
                  <span className="font-medium">{userNotes.length} items</span>
                </div>
                <Progress value={Math.min((userNotes.length / 100) * 100, 100)} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Emails</span>
                  <span className="font-medium">{mailStats?.storage?.estimatedMails || 0}</span>
                </div>
                <Progress value={Math.min(((mailStats?.storage?.estimatedMails || 0) / 1000) * 100, 100)} className="h-1" />
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