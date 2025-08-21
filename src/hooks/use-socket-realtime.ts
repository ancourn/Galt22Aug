'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketProps {
  userId?: string;
  teamIds?: string[];
  onTeamUpdate?: (data: any) => void;
  onTaskUpdate?: (data: any) => void;
  onMailUpdate?: (data: any) => void;
}

export const useSocket = ({
  userId,
  teamIds = [],
  onTeamUpdate,
  onTaskUpdate,
  onMailUpdate,
}: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      query: {
        userId,
        teamIds: teamIds.length > 0 ? teamIds : undefined,
      },
    });

    const socket = socketRef.current;

    // Team event handlers
    socket.on('team:update', (data: any) => {
      onTeamUpdate?.(data);
    });

    // Task event handlers
    socket.on('task:update', (data: any) => {
      onTaskUpdate?.(data);
    });

    // Mail event handlers
    socket.on('mail:update', (data: any) => {
      onMailUpdate?.(data);
    });

    // Connection handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [userId, teamIds, onTeamUpdate, onTaskUpdate, onMailUpdate]);

  // Function to emit events
  const emitTeamEvent = (event: string, data: any) => {
    socketRef.current?.emit(`team:${event}`, data);
  };

  const emitTaskEvent = (event: string, data: any) => {
    socketRef.current?.emit(`task:${event}`, data);
  };

  const emitMailEvent = (event: string, data: any) => {
    socketRef.current?.emit(`mail:${event}`, data);
  };

  return {
    emitTeamEvent,
    emitTaskEvent,
    emitMailEvent,
    socket: socketRef.current,
  };
};