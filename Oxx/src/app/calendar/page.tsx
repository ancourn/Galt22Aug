'use client';

import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Video, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPage() {
  const events = [
    {
      id: 1,
      title: 'Team Standup',
      date: '2024-01-15',
      time: '09:00',
      duration: '30m',
      type: 'meeting',
      participants: 8,
      location: 'Conference Room A',
      description: 'Daily team standup meeting',
    },
    {
      id: 2,
      title: 'Product Demo',
      date: '2024-01-15',
      time: '14:00',
      duration: '1h',
      type: 'presentation',
      participants: 12,
      location: 'Zoom Meeting',
      description: 'Product demonstration for potential clients',
    },
    {
      id: 3,
      title: 'Q4 Review',
      date: '2024-01-16',
      time: '10:00',
      duration: '2h',
      type: 'review',
      participants: 15,
      location: 'Main Conference Room',
      description: 'Quarterly review and planning session',
    },
    {
      id: 4,
      title: 'Client Meeting',
      date: '2024-01-16',
      time: '15:30',
      duration: '1h',
      type: 'client',
      participants: 4,
      location: 'Client Office',
      description: 'Follow-up meeting with key client',
    },
    {
      id: 5,
      title: 'Team Building',
      date: '2024-01-17',
      time: '16:00',
      duration: '2h',
      type: 'social',
      participants: 20,
      location: 'Off-site',
      description: 'Monthly team building activity',
    },
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'presentation': return 'bg-green-100 text-green-800 border-green-200';
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'client': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'social': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting': return Users;
      case 'presentation': return Video;
      case 'review': return Calendar;
      case 'client': return MapPin;
      case 'social': return Users;
      default: return Calendar;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Calendar" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                <p className="text-muted-foreground">
                  Manage your schedule and events
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Button>
              </div>
            </div>

            {/* Calendar Navigation */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">January 2024</h2>
                    <Button variant="outline" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">Today</Button>
                    <Button variant="outline">Week</Button>
                    <Button variant="outline">Month</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  Your scheduled events for the coming days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => {
                    const EventIcon = getEventIcon(event.type);
                    return (
                      <div
                        key={event.id}
                        className={`p-4 rounded-lg border ${getEventColor(event.type)}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-white">
                            <EventIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{event.title}</h3>
                              <Badge variant="outline">{event.type}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{event.time} ({event.duration})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{event.participants} participants</span>
                              </div>
                            </div>
                            <p className="text-sm mt-2 text-muted-foreground">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">events scheduled</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">events total</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Meetings</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">scheduled</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Free Time</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18h</div>
                  <p className="text-xs text-muted-foreground">available</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}