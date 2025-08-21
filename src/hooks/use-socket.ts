'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  autoConnect?: boolean;
}

interface UseSocketResult {
  socket: Socket | null;
  isConnected: boolean;
  connectedUsers: Map<string, any>;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  sendMessage: (room: string, message: string, sender: any) => void;
  sendProjectUpdate: (projectId: string, update: any) => void;
  sendNoteUpdate: (noteId: string, update: any) => void;
  sendAIInteraction: (sessionId: string, prompt: string, response: string) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
}

export function useSocket(options: UseSocketOptions = {}): UseSocketResult {
  const { autoConnect = true } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<Map<string, any>>(new Map());
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const eventListeners = useRef<Map<string, ((data: any) => void)[]>>(new Map());

  useEffect(() => {
    if (session && autoConnect) {
      const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
        path: '/api/socketio',
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);

        // Authenticate with user data
        newSocket.emit('authenticate', {
          userId: session.user.id,
          email: session.user.email,
          name: session.user.name,
        });
      });

      newSocket.on('authenticated', (data) => {
        console.log('Socket authenticated:', data);
      });

      newSocket.on('connected', (data) => {
        console.log('Connected to real-time services:', data);
      });

      newSocket.on('user_online', (data) => {
        console.log('User online:', data);
        setConnectedUsers(prev => new Map(prev).set(data.userId, data));
      });

      newSocket.on('user_offline', (data) => {
        console.log('User offline:', data);
        setConnectedUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      // Reconnect event listeners
      newSocket.on('reconnect', () => {
        console.log('Socket reconnected');
        setIsConnected(true);
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setConnectedUsers(new Map());
      };
    }
  }, [session, autoConnect]);

  const joinRoom = (room: string) => {
    if (socket) {
      socket.emit('join_room', room);
    }
  };

  const leaveRoom = (room: string) => {
    if (socket) {
      socket.emit('leave_room', room);
    }
  };

  const sendMessage = (room: string, message: string, sender: any) => {
    if (socket) {
      socket.emit('send_message', { room, message, sender });
    }
  };

  const sendProjectUpdate = (projectId: string, update: any) => {
    if (socket) {
      socket.emit('project_update', { projectId, update, userId: session?.user.id });
    }
  };

  const sendNoteUpdate = (noteId: string, update: any) => {
    if (socket) {
      socket.emit('note_update', { noteId, update, userId: session?.user.id });
    }
  };

  const sendAIInteraction = (sessionId: string, prompt: string, response: string) => {
    if (socket) {
      socket.emit('ai_interaction', { sessionId, prompt, response });
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
      
      // Store listener for cleanup
      if (!eventListeners.current.has(event)) {
        eventListeners.current.set(event, []);
      }
      eventListeners.current.get(event)?.push(callback);
    }
  };

  const off = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback);
      
      // Remove from stored listeners
      const listeners = eventListeners.current.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  };

  const emit = (event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  return {
    socket,
    isConnected,
    connectedUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendProjectUpdate,
    sendNoteUpdate,
    sendAIInteraction,
    on,
    off,
    emit,
  };
}

// Specific hooks for real-time features
export function useRealTimeProjects() {
  const socket = useSocket();
  const [projectUpdates, setProjectUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (socket.isConnected) {
      socket.on('project_updated', (data) => {
        setProjectUpdates(prev => [...prev, data]);
      });

      return () => {
        socket.off('project_updated');
      };
    }
  }, [socket.isConnected]);

  return { projectUpdates, sendProjectUpdate: socket.sendProjectUpdate };
}

export function useRealTimeNotes() {
  const socket = useSocket();
  const [noteUpdates, setNoteUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (socket.isConnected) {
      socket.on('note_updated', (data) => {
        setNoteUpdates(prev => [...prev, data]);
      });

      return () => {
        socket.off('note_updated');
      };
    }
  }, [socket.isConnected]);

  return { noteUpdates, sendNoteUpdate: socket.sendNoteUpdate };
}

export function useRealTimeChat(room: string) {
  const socket = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (socket.isConnected && room) {
      // Join the room
      socket.joinRoom(room);

      // Listen for new messages
      socket.on('new_message', (data) => {
        setMessages(prev => [...prev, data]);
      });

      // Listen for typing indicators
      socket.on('user_typing', (data) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.typing) {
            newSet.add(data.user.name);
          } else {
            newSet.delete(data.user.name);
          }
          return newSet;
        });
      });

      return () => {
        socket.leaveRoom(room);
        socket.off('new_message');
        socket.off('user_typing');
      };
    }
  }, [socket.isConnected, room]);

  const sendMessage = (message: string, sender: any) => {
    socket.sendMessage(room, message, sender);
  };

  const startTyping = (user: any) => {
    socket.emit('typing_start', { room, user });
  };

  const stopTyping = (user: any) => {
    socket.emit('typing_stop', { room, user });
  };

  return {
    messages,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
  };
}

export function useRealTimeAI(sessionId: string) {
  const socket = useSocket();
  const [aiResponses, setAiResponses] = useState<any[]>([]);

  useEffect(() => {
    if (socket.isConnected && sessionId) {
      // Join AI session room
      socket.joinRoom(`ai:${sessionId}`);

      // Listen for AI responses
      socket.on('ai_response', (data) => {
        setAiResponses(prev => [...prev, data]);
      });

      return () => {
        socket.leaveRoom(`ai:${sessionId}`);
        socket.off('ai_response');
      };
    }
  }, [socket.isConnected, sessionId]);

  const sendAIInteraction = (prompt: string, response: string) => {
    socket.sendAIInteraction(sessionId, prompt, response);
  };

  return {
    aiResponses,
    sendAIInteraction,
  };
}