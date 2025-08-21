'use client';

import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Search, Star, Clock, Reply, ReplyAll, Forward, Paperclip, MoreVertical } from 'lucide-react';

export default function InboxPage() {
  const emails = [
    {
      id: 1,
      from: 'Sarah Johnson',
      fromEmail: 'sarah@company.com',
      subject: 'Project Update - Q4 Review',
      preview: 'Hi team, I wanted to share the latest project updates and discuss our Q4 review meeting...',
      time: '2 minutes ago',
      read: false,
      starred: false,
      hasAttachment: true,
    },
    {
      id: 2,
      from: 'Michael Chen',
      fromEmail: 'michael@techcorp.io',
      subject: 'Meeting Request: Product Demo',
      preview: 'Would you be available next week for a product demo? We have some exciting new features...',
      time: '15 minutes ago',
      read: true,
      starred: true,
      hasAttachment: false,
    },
    {
      id: 3,
      from: 'Emily Rodriguez',
      fromEmail: 'emily@designstudio.com',
      subject: 'Design Assets Ready for Review',
      preview: 'The design assets are ready for your review. Please check the attached files and let me know...',
      time: '1 hour ago',
      read: false,
      starred: false,
      hasAttachment: true,
    },
    {
      id: 4,
      from: 'David Kim',
      fromEmail: 'david@partners.com',
      subject: 'Partnership Opportunity',
      preview: 'I wanted to discuss a potential partnership opportunity between our companies...',
      time: '2 hours ago',
      read: true,
      starred: false,
      hasAttachment: false,
    },
    {
      id: 5,
      from: 'Lisa Thompson',
      fromEmail: 'lisa@marketing.com',
      subject: 'Campaign Performance Report',
      preview: 'Here is the monthly campaign performance report with detailed analytics and insights...',
      time: '3 hours ago',
      read: true,
      starred: true,
      hasAttachment: true,
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Inbox" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
                <p className="text-muted-foreground">
                  Manage your emails and messages
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Compose
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search emails..."
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    Starred
                  </Button>
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Recent
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email List */}
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  {emails.filter(e => !e.read).length} unread of {emails.length} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        !email.read ? 'bg-blue-50/30 border-blue-200' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`/avatars/${email.from.toLowerCase().replace(' ', '-')}.png`} alt={email.from} />
                        <AvatarFallback>
                          {email.from.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      {/* Email Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-sm font-medium truncate ${!email.read ? 'font-semibold' : ''}`}>
                            {email.from}
                          </p>
                          {email.hasAttachment && (
                            <Paperclip className="h-3 w-3 text-muted-foreground" />
                          )}
                          {email.starred && (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>
                        <p className={`text-sm truncate ${!email.read ? 'font-medium' : 'text-muted-foreground'}`}>
                          {email.subject}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {email.preview}
                        </p>
                      </div>

                      {/* Time and Actions */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {email.time}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Reply className="h-3 w-3" />
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