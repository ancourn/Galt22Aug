'use client';

import { useState } from 'react';
import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Users, 
  MessageSquare,
  FileText,
  Star,
  Clock,
  Headset,
  Ticket,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react';

export default function CarePage() {
  const tickets = [
    {
      id: 1,
      title: 'Login Issue - Cannot Access Account',
      description: 'User is unable to log in to their account. Getting authentication error.',
      status: 'open',
      priority: 'high',
      category: 'technical',
      assignee: 'Sarah Johnson',
      requester: 'John Doe',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T11:00:00Z',
      tags: ['login', 'authentication', 'urgent']
    },
    {
      id: 2,
      title: 'Feature Request - Dark Mode',
      description: 'User would like to see a dark mode option added to the application.',
      status: 'in-progress',
      priority: 'medium',
      category: 'feature',
      assignee: 'Michael Chen',
      requester: 'Jane Smith',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-15T09:30:00Z',
      tags: ['ui', 'feature-request', 'enhancement']
    },
    {
      id: 3,
      title: 'Billing Question - Invoice Discrepancy',
      description: 'Customer has a question about their latest invoice and charges.',
      status: 'resolved',
      priority: 'low',
      category: 'billing',
      assignee: 'Emily Rodriguez',
      requester: 'Bob Wilson',
      createdAt: '2024-01-13T16:45:00Z',
      updatedAt: '2024-01-15T08:15:00Z',
      tags: ['billing', 'invoice', 'payment']
    },
    {
      id: 4,
      title: 'Performance Issue - Slow Loading',
      description: 'Application is loading slowly, especially on mobile devices.',
      status: 'open',
      priority: 'high',
      category: 'technical',
      assignee: 'David Kim',
      requester: 'Alice Brown',
      createdAt: '2024-01-15T09:15:00Z',
      updatedAt: '2024-01-15T10:45:00Z',
      tags: ['performance', 'mobile', 'optimization']
    },
    {
      id: 5,
      title: 'Account Deletion Request',
      description: 'User wants to permanently delete their account and all associated data.',
      status: 'pending',
      priority: 'medium',
      category: 'account',
      assignee: null,
      requester: 'Charlie Davis',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
      tags: ['account', 'privacy', 'deletion']
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return AlertTriangle;
      case 'feature': return Star;
      case 'billing': return FileText;
      case 'account': return Users;
      default: return Ticket;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Care" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Care</h1>
                <p className="text-muted-foreground">
                  Customer support and ticket management
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tickets.length}</div>
                  <p className="text-xs text-muted-foreground">total tickets</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {tickets.filter(t => t.status === 'open').length}
                  </div>
                  <p className="text-xs text-muted-foreground">need attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {tickets.filter(t => t.status === 'in-progress').length}
                  </div>
                  <p className="text-xs text-muted-foreground">being worked on</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {tickets.filter(t => t.status === 'resolved').length}
                  </div>
                  <p className="text-xs text-muted-foreground">completed</p>
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
                      placeholder="Search tickets..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={statusFilter === 'all' ? 'default' : 'outline'}
                      onClick={() => setStatusFilter('all')}
                    >
                      All
                    </Button>
                    <Button 
                      variant={statusFilter === 'open' ? 'default' : 'outline'}
                      onClick={() => setStatusFilter('open')}
                    >
                      Open
                    </Button>
                    <Button 
                      variant={statusFilter === 'in-progress' ? 'default' : 'outline'}
                      onClick={() => setStatusFilter('in-progress')}
                    >
                      In Progress
                    </Button>
                    <Button 
                      variant={statusFilter === 'resolved' ? 'default' : 'outline'}
                      onClick={() => setStatusFilter('resolved')}
                    >
                      Resolved
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets List */}
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>
                  Manage and track customer support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => {
                    const CategoryIcon = getCategoryIcon(ticket.category);
                    return (
                      <div
                        key={ticket.id}
                        className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                              <h3 className="font-medium">{ticket.title}</h3>
                              <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {ticket.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{ticket.requester}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Created {formatDate(ticket.createdAt)}</span>
                              </div>
                              {ticket.assignee && (
                                <div className="flex items-center gap-1">
                                  <Headset className="h-3 w-3" />
                                  <span>Assigned to {ticket.assignee}</span>
                                </div>
                              )}
                            </div>
                            
                            {ticket.tags && ticket.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {ticket.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}