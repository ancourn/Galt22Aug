'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Users, 
  Search, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Bot,
  Lock
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  type: 'user' | 'system' | 'ai';
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  participants: number;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  isPrivate: boolean;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [activeRoom, setActiveRoom] = useState<string>('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    isPrivate: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock chat rooms
  const chatRooms: ChatRoom[] = [
    {
      id: 'general',
      name: 'General',
      description: 'General team discussions and announcements',
      participants: 5,
      lastMessage: 'Looking forward to the project kickoff meeting!',
      lastMessageTime: '2 minutes ago',
      unread: 0,
      isPrivate: false
    },
    {
      id: 'development',
      name: 'Development',
      description: 'Technical discussions and code reviews',
      participants: 3,
      lastMessage: 'The API integration is complete',
      lastMessageTime: '15 minutes ago',
      unread: 2,
      isPrivate: false
    },
    {
      id: 'design',
      name: 'Design',
      description: 'UI/UX design discussions and feedback',
      participants: 2,
      lastMessage: 'New mockups are ready for review',
      lastMessageTime: '1 hour ago',
      unread: 1,
      isPrivate: false
    },
    {
      id: 'ai-help',
      name: 'AI Help',
      description: 'Get help from AI assistant',
      participants: 1,
      lastMessage: 'How can I assist you today?',
      lastMessageTime: 'Just now',
      unread: 0,
      isPrivate: false
    }
  ];

  // Mock messages for each room
  const roomMessages: Record<string, ChatMessage[]> = {
    general: [
      {
        id: '1',
        content: 'Welcome to the team chat! 🎉',
        sender: { id: 'system', name: 'System' },
        timestamp: '10:00 AM',
        type: 'system'
      },
      {
        id: '2',
        content: 'Thanks! Excited to be part of the team',
        sender: { id: 'user1', name: 'Alice Johnson' },
        timestamp: '10:05 AM',
        type: 'user'
      },
      {
        id: '3',
        content: 'Looking forward to the project kickoff meeting!',
        sender: { id: 'user2', name: 'Bob Smith' },
        timestamp: '10:15 AM',
        type: 'user'
      }
    ],
    development: [
      {
        id: '1',
        content: 'The API integration is complete',
        sender: { id: 'dev1', name: 'Charlie Dev' },
        timestamp: '9:45 AM',
        type: 'user'
      },
      {
        id: '2',
        content: 'Great work! Let me review the code',
        sender: { id: 'dev2', name: 'Dana Code' },
        timestamp: '9:50 AM',
        type: 'user'
      }
    ],
    design: [
      {
        id: '1',
        content: 'New mockups are ready for review',
        sender: { id: 'design1', name: 'Eve Designer' },
        timestamp: '9:00 AM',
        type: 'user'
      }
    ],
    'ai-help': [
      {
        id: '1',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        sender: { id: 'ai', name: 'AI Assistant' },
        timestamp: 'Just now',
        type: 'ai'
      }
    ]
  };

  useEffect(() => {
    // Load messages for active room
    setMessages(roomMessages[activeRoom] || []);
  }, [activeRoom]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        sender: { 
          id: session?.user?.id || 'current-user', 
          name: session?.user?.name || 'You' 
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'user'
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      // Simulate AI response in AI help room
      if (activeRoom === 'ai-help') {
        setTimeout(() => {
          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: 'I understand your question. Let me help you with that...',
            sender: { id: 'ai', name: 'AI Assistant' },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'ai'
          };
          setMessages(prev => [...prev, aiResponse]);
        }, 1000);
      }
    }
  };

  const handleCreateRoom = () => {
    if (newRoom.name) {
      // In a real app, this would call an API to create the room
      console.log('Creating chat room:', newRoom);
      setIsCreateRoomOpen(false);
      setNewRoom({ name: '', description: '', isPrivate: false });
    }
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar */}
      <div className="w-80 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Chat Rooms</h2>
          <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
                <DialogDescription>
                  Create a new chat room for team discussions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Room Name</label>
                  <Input
                    placeholder="Enter room name..."
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Enter room description..."
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateRoom} disabled={!newRoom.name}>
                    Create Room
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateRoomOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search rooms..." className="pl-10" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {chatRooms.map((room) => (
            <Card
              key={room.id}
              className={`cursor-pointer transition-colors ${
                activeRoom === room.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
              }`}
              onClick={() => setActiveRoom(room.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium flex items-center gap-2">
                      {room.name}
                      {room.isPrivate && <Lock className="h-3 w-3" />}
                    </h3>
                    <p className="text-sm text-muted-foreground">{room.description}</p>
                  </div>
                  {room.unread > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {room.unread}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{room.participants}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{room.lastMessageTime}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 truncate">
                  {room.lastMessage}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {chatRooms.find(r => r.id === activeRoom)?.name}
                  {activeRoom === 'ai-help' && <Bot className="h-4 w-4 text-blue-600" />}
                </CardTitle>
                <CardDescription>
                  {chatRooms.find(r => r.id === activeRoom)?.description}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{chatRooms.find(r => r.id === activeRoom)?.participants} online</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-2">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.sender.id === session?.user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender.id !== session?.user?.id && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {msg.type === 'ai' ? (
                            <Bot className="h-4 w-4 text-blue-600" />
                          ) : (
                            <span className="text-xs font-medium">
                              {msg.sender.name.charAt(0)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        msg.sender.id === session?.user?.id
                          ? 'bg-primary text-primary-foreground'
                          : msg.type === 'ai'
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                          : msg.type === 'system'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.sender.id !== session?.user?.id && msg.type !== 'system' && (
                        <div className="text-xs font-medium mb-1">
                          {msg.sender.name}
                        </div>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <div className="text-xs opacity-70 mt-1">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                    {msg.sender.id === session?.user?.id && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-foreground">
                            {msg.sender.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}