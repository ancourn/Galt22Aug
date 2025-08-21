'use client';

import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, Mail, Phone, MessageSquare, Calendar, Star, Clock, MoreVertical, Search, Input } from 'lucide-react';

export default function TeamPage() {
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Project Manager',
      email: 'sarah@oxlas.com',
      phone: '+1 (555) 123-4567',
      status: 'online',
      lastSeen: 'just now',
      avatar: '/avatars/sarah-johnson.png',
      projects: 5,
      tasks: 12,
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Lead Developer',
      email: 'michael@oxlas.com',
      phone: '+1 (555) 234-5678',
      status: 'online',
      lastSeen: '2 minutes ago',
      avatar: '/avatars/michael-chen.png',
      projects: 3,
      tasks: 18,
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'UI/UX Designer',
      email: 'emily@oxlas.com',
      phone: '+1 (555) 345-6789',
      status: 'away',
      lastSeen: '15 minutes ago',
      avatar: '/avatars/emily-rodriguez.png',
      projects: 4,
      tasks: 8,
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Backend Developer',
      email: 'david@oxlas.com',
      phone: '+1 (555) 456-7890',
      status: 'offline',
      lastSeen: '2 hours ago',
      avatar: '/avatars/david-kim.png',
      projects: 2,
      tasks: 15,
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      role: 'Marketing Specialist',
      email: 'lisa@oxlas.com',
      phone: '+1 (555) 567-8901',
      status: 'online',
      lastSeen: '5 minutes ago',
      avatar: '/avatars/lisa-thompson.png',
      projects: 6,
      tasks: 10,
    },
    {
      id: 6,
      name: 'James Wilson',
      role: 'DevOps Engineer',
      email: 'james@oxlas.com',
      phone: '+1 (555) 678-9012',
      status: 'online',
      lastSeen: '1 minute ago',
      avatar: '/avatars/james-wilson.png',
      projects: 4,
      tasks: 20,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Offline';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Team" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Team</h1>
                <p className="text-muted-foreground">
                  Manage your team members and collaborations
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </div>

            {/* Team Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
                  <p className="text-xs text-muted-foreground">total members</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Online Now</CardTitle>
                  <Star className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {teamMembers.filter(m => m.status === 'online').length}
                  </div>
                  <p className="text-xs text-muted-foreground">available</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {teamMembers.reduce((sum, m) => sum + m.projects, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">total projects</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {teamMembers.reduce((sum, m) => sum + m.tasks, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">active tasks</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search team members..."
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">All</Button>
                    <Button variant="outline">Online</Button>
                    <Button variant="outline">Away</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Your team members and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      {/* Avatar and Status */}
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                      </div>

                      {/* Member Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{member.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{member.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{member.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                            <span>{getStatusText(member.status)}</span>
                          </div>
                          <span>{member.lastSeen}</span>
                        </div>
                      </div>

                      {/* Stats and Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{member.projects} projects</div>
                          <div className="text-xs text-muted-foreground">{member.tasks} tasks</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Calendar className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}