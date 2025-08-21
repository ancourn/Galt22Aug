'use client';

import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Phone, Mic, MicOff, VideoOff, PhoneOff, Users, Clock, Calendar, Plus, Settings } from 'lucide-react';

export default function MeetPage() {
  const meetings = [
    {
      id: 1,
      title: 'Daily Standup',
      time: '09:00',
      duration: '30m',
      participants: 8,
      status: 'scheduled',
      room: 'standup-daily',
    },
    {
      id: 2,
      title: 'Product Demo',
      time: '14:00',
      duration: '1h',
      participants: 12,
      status: 'live',
      room: 'demo-product',
    },
    {
      id: 3,
      title: 'Client Meeting',
      time: '15:30',
      duration: '1h',
      participants: 4,
      status: 'scheduled',
      room: 'client-meeting',
    },
    {
      id: 4,
      title: 'Team Review',
      time: '16:00',
      duration: '2h',
      participants: 15,
      status: 'scheduled',
      room: 'team-review',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ended': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Meet" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Meet</h1>
                <p className="text-muted-foreground">
                  Video conferencing and meetings
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Meeting
                </Button>
              </div>
            </div>

            {/* Active Meeting */}
            {meetings.find(m => m.status === 'live') && (
              <Card className="border-green-200 bg-green-50/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-green-600" />
                        Live Meeting: {meetings.find(m => m.status === 'live')?.title}
                      </CardTitle>
                      <CardDescription>
                        Meeting is in progress - {meetings.find(m => m.status === 'live')?.participants} participants
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-600 text-white">LIVE</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Video className="h-4 w-4 mr-2" />
                      Join Meeting
                    </Button>
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Join Audio Only
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Start Meeting</CardTitle>
                  <CardDescription>
                    Create a new video conference instantly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Video className="h-4 w-4 mr-2" />
                    Start Now
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Schedule Meeting</CardTitle>
                  <CardDescription>
                    Plan a meeting for later
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Join Meeting</CardTitle>
                  <CardDescription>
                    Enter meeting room code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Join with Code
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Meetings */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Meetings</CardTitle>
                <CardDescription>
                  Your scheduled video conferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meetings.filter(m => m.status === 'scheduled').map((meeting) => (
                    <div
                      key={meeting.id}
                      className={`p-4 rounded-lg border ${getStatusColor(meeting.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-white">
                            <Video className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{meeting.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{meeting.time} ({meeting.duration})</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{meeting.participants} participants</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm">
                            <Video className="h-3 w-3 mr-1" />
                            Join
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Meeting Controls Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Meeting Controls</CardTitle>
                <CardDescription>
                  Available controls during video conferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4 p-8 bg-muted/30 rounded-lg">
                  <Button variant="outline" size="icon" className="h-12 w-12">
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-12 w-12">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-12 w-12">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-12 w-12">
                    <Settings className="h-5 w-5" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-12 w-12">
                    <PhoneOff className="h-5 w-5" />
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Control your microphone, camera, screen sharing, and meeting settings
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">meetings scheduled</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Live Now</CardTitle>
                  <Phone className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">1</div>
                  <p className="text-xs text-muted-foreground">meeting in progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Participants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">39</div>
                  <p className="text-xs text-muted-foreground">total today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.5h</div>
                  <p className="text-xs text-muted-foreground">meeting time today</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}