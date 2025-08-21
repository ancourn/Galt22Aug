'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/oxlas/Header';
import Sidebar from '@/components/oxlas/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Search, Star, Clock, Reply, ReplyAll, Forward, Paperclip, MoreVertical, Trash, Archive, Eye } from 'lucide-react';
import { useMail, useMailStats } from '@/hooks/use-mail';
import { useSession } from 'next-auth/react';
import ComposeMail from '@/components/mail/compose-mail';

export default function InboxPage() {
  const { data: session } = useSession();
  const { mails, loading, error, updateMail, deleteMail } = useMail({ folder: 'inbox' });
  const { stats } = useMailStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMails, setSelectedMails] = useState<Set<string>>(new Set());
  const [showCompose, setShowCompose] = useState(false);

  // Filter mails based on search
  const filteredMails = mails?.filter(mail => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      mail.subject.toLowerCase().includes(searchLower) ||
      mail.from.toLowerCase().includes(searchLower) ||
      mail.fromName?.toLowerCase().includes(searchLower) ||
      mail.content.toLowerCase().includes(searchLower)
    );
  }) || [];

  const handleMailAction = async (mailId: string, action: 'read' | 'starred' | 'trash') => {
    try {
      if (action === 'trash') {
        await deleteMail(mailId);
      } else {
        await updateMail(mailId, { [action]: action === 'read' ? true : !mails?.find(m => m.id === mailId)?.[action] });
      }
    } catch (error) {
      console.error('Error performing mail action:', error);
    }
  };

  const handleSelectMail = (mailId: string) => {
    const newSelected = new Set(selectedMails);
    if (newSelected.has(mailId)) {
      newSelected.delete(mailId);
    } else {
      newSelected.add(mailId);
    }
    setSelectedMails(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMails.size === filteredMails.length) {
      setSelectedMails(new Set());
    } else {
      setSelectedMails(new Set(filteredMails.map(m => m.id)));
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSendMail = () => {
    // Refresh the mail list after sending
    // This will be handled by the compose component
  };

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
                  {stats?.counts?.unread || 0} unread of {stats?.counts?.inbox || 0} total emails
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setShowCompose(true)}>
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    Starred ({stats?.counts?.starred || 0})
                  </Button>
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Recent ({stats?.counts?.recent || 0})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>
                      {filteredMails.filter(e => !e.read).length} unread of {filteredMails.length} total
                    </CardDescription>
                  </div>
                  {selectedMails.size > 0 && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading emails...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">Error loading emails: {error}</p>
                    </div>
                  ) : filteredMails.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No emails found</p>
                      <Button size="sm" className="mt-2" onClick={() => setShowCompose(true)}>
                        Compose Email
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Header row */}
                      <div className="flex items-center gap-4 p-4 border-b bg-muted/50">
                        <input
                          type="checkbox"
                          checked={selectedMails.size === filteredMails.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                        <div className="flex-1 text-sm font-medium">From</div>
                        <div className="flex-2 text-sm font-medium">Subject</div>
                        <div className="flex-1 text-sm font-medium">Preview</div>
                        <div className="w-20 text-sm font-medium">Time</div>
                        <div className="w-20"></div>
                      </div>
                      
                      {/* Email rows */}
                      {filteredMails.map((email) => (
                        <div
                          key={email.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                            !email.read ? 'bg-blue-50/30 border-blue-200' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedMails.has(email.id)}
                            onChange={() => handleSelectMail(email.id)}
                            className="rounded border-gray-300"
                            onClick={(e) => e.stopPropagation()}
                          />

                          {/* Avatar */}
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`/avatars/${email.from.toLowerCase().replace(' ', '-')}.png`} alt={email.fromName || email.from} />
                            <AvatarFallback>
                              {(email.fromName || email.from).split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* Email Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`text-sm font-medium truncate ${!email.read ? 'font-semibold' : ''}`}>
                                {email.fromName || email.from}
                              </p>
                              {email.hasAttachments && (
                                <Paperclip className="h-3 w-3 text-muted-foreground" />
                              )}
                              {email.starred && (
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              )}
                            </div>
                            <p className={`text-sm truncate ${!email.read ? 'font-medium' : 'text-muted-foreground'}`}>
                              {email.subject}
                            </p>
                          </div>

                          {/* Preview */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground truncate">
                              {email.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                            </p>
                          </div>

                          {/* Time */}
                          <div className="w-20">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTime(email.createdAt)}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMailAction(email.id, 'read');
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMailAction(email.id, 'starred');
                              }}
                            >
                              <Star className={`h-3 w-3 ${email.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMailAction(email.id, 'trash');
                              }}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Compose Mail Modal */}
      {showCompose && (
        <ComposeMail
          onClose={() => setShowCompose(false)}
          onSend={handleSendMail}
        />
      )}
    </div>
  );
}