'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Clock, Settings, Database, Zap } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface ModuleAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  module: string;
}

export default function AI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const moduleActions: ModuleAction[] = [
    {
      id: 'create-project',
      name: 'Create Project',
      description: 'Create a new project in Planka',
      icon: '📋',
      module: 'projects'
    },
    {
      id: 'create-ticket',
      name: 'Create Support Ticket',
      description: 'Create a ticket in Zammad',
      icon: '🎫',
      module: 'care'
    },
    {
      id: 'create-wiki-page',
      name: 'Create Wiki Page',
      description: 'Create a new page in Outline',
      icon: '📚',
      module: 'wiki'
    },
    {
      id: 'send-chat-message',
      name: 'Send Chat Message',
      description: 'Send message to Matrix chat',
      icon: '💬',
      module: 'chat'
    },
    {
      id: 'create-form',
      name: 'Create Form',
      description: 'Create a new form in Formbricks',
      icon: '📝',
      module: 'forms'
    },
    {
      id: 'create-note',
      name: 'Create Note',
      description: 'Create a new note in Joplin',
      icon: '📓',
      module: 'notes'
    }
  ];

  useEffect(() => {
    // Generate session ID on first load
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    // Load conversation history from localStorage
    const savedMessages = localStorage.getItem(`ai_conversation_${newSessionId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Add welcome message
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your Oxlas AI Co-Pilot. I can help you across all your modules - Projects, Care, Wiki, Chat, Forms, and Notes. What would you like to do?',
        timestamp: new Date(),
        metadata: { type: 'welcome' }
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    // Save conversation to localStorage
    if (sessionId && messages.length > 0) {
      localStorage.setItem(`ai_conversation_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get conversation context
      const context = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          context,
          sessionId,
          availableActions: moduleActions
        }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: data.metadata || {}
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If there are actions to execute, show them
      if (data.actions && data.actions.length > 0) {
        setTimeout(() => {
          const actionMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: `I'll help you with that. I can perform the following actions:`,
            timestamp: new Date(),
            metadata: { 
              type: 'actions',
              actions: data.actions 
            }
          };
          setMessages(prev => [...prev, actionMessage]);
        }, 1000);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        metadata: { error: true }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async (actionId: string) => {
    try {
      const response = await fetch('/api/ai/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionId,
          sessionId,
          context: messages.slice(-5)
        }),
      });

      const data = await response.json();
      
      const executionMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message || `Action ${actionId} executed successfully.`,
        timestamp: new Date(),
        metadata: { 
          type: 'action_result',
          actionId,
          result: data 
        }
      };

      setMessages(prev => [...prev, executionMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Failed to execute action ${actionId}. Please try again.`,
        timestamp: new Date(),
        metadata: { error: true, actionId }
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    if (sessionId) {
      localStorage.removeItem(`ai_conversation_${sessionId}`);
    }
    // Generate new session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Oxlas AI Co-Pilot. I can help you across all your modules - Projects, Care, Wiki, Chat, Forms, and Notes. What would you like to do?',
      timestamp: new Date(),
      metadata: { type: 'welcome' }
    };
    setMessages([welcomeMessage]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Oxlas AI Co-Pilot</h1>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Database className="h-3 w-3" />
                <span>Memory: {messages.length} messages</span>
              </div>
              <button
                onClick={clearConversation}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                
                {/* Actions */}
                {message.metadata?.type === 'actions' && message.metadata?.actions && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Available Actions:
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {message.metadata.actions.map((action: any) => (
                        <button
                          key={action.id}
                          onClick={() => executeAction(action.id)}
                          className="flex items-center justify-between p-2 bg-background border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{action.icon}</span>
                            <div className="text-left">
                              <div className="text-sm font-medium">{action.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {action.description}
                              </div>
                            </div>
                          </div>
                          <Zap className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Results */}
                {message.metadata?.type === 'action_result' && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-xs text-green-800">
                      ✓ Action completed successfully
                    </div>
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-1">
                  {formatTime(message.timestamp)}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your workspace..."
                className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              💡 Try: "Create a project for the new feature request" or "Summarize recent chat messages"
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}