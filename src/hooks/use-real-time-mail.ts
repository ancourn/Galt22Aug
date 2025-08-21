'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface MailUpdateEvent {
  type: 'received' | 'sent' | 'updated' | 'deleted';
  mail?: any;
  mailId?: string;
  updates?: any;
  timestamp: string;
}

export function useRealTimeMail() {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [mailUpdates, setMailUpdates] = useState<MailUpdateEvent[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      query: {
        userId: session.user.id,
      },
    });

    const socket = socketRef.current;

    // Join user room
    socket.emit('join-user-room', session.user.id);

    // Listen for mail updates
    socket.on('mail:update', (event: MailUpdateEvent) => {
      console.log('Mail update received:', event);
      setMailUpdates(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 updates
    });

    // Clean up on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [session?.user?.id]);

  // Function to emit mail events (for when actions are performed)
  const emitMailEvent = (event: string, data: any) => {
    if (socketRef.current && session?.user?.id) {
      socketRef.current.emit(event, {
        userId: session.user.id,
        ...data,
      });
    }
  };

  return {
    mailUpdates,
    emitMailEvent,
    clearUpdates: () => setMailUpdates([]),
  };
}