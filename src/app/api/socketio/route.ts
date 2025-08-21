import { NextRequest } from 'next/server';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';

export type NextApiResponse = any;

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextRequest, res: NextApiResponse) => {
  if (!res.socket.server.io) {
    console.log('Socket.IO server is initializing...');
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socketio',
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
        methods: ['GET', 'POST'],
      },
    });

    // Store connected users
    const connectedUsers = new Map();

    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', (userData) => {
        const { userId, email, name } = userData;
        connectedUsers.set(socket.id, { userId, email, name });
        socket.join(`user:${userId}`);
        
        // Notify others that user is online
        socket.broadcast.emit('user_online', {
          userId,
          name,
          socketId: socket.id,
        });
        
        socket.emit('authenticated', { success: true });
      });

      // Handle joining rooms
      socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
      });

      // Handle leaving rooms
      socket.on('leave_room', (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} left room: ${room}`);
      });

      // Handle real-time messages
      socket.on('send_message', (data) => {
        const { room, message, sender } = data;
        io.to(room).emit('new_message', {
          id: Date.now(),
          message,
          sender,
          timestamp: new Date(),
        });
      });

      // Handle project updates
      socket.on('project_update', (data) => {
        const { projectId, update, userId } = data;
        io.to(`project:${projectId}`).emit('project_updated', {
          projectId,
          update,
          userId,
          timestamp: new Date(),
        });
      });

      // Handle note updates
      socket.on('note_update', (data) => {
        const { noteId, update, userId } = data;
        io.to(`note:${noteId}`).emit('note_updated', {
          noteId,
          update,
          userId,
          timestamp: new Date(),
        });
      });

      // Handle AI assistant interactions
      socket.on('ai_interaction', (data) => {
        const { sessionId, prompt, response } = data;
        io.to(`ai:${sessionId}`).emit('ai_response', {
          sessionId,
          prompt,
          response,
          timestamp: new Date(),
        });
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { room, user } = data;
        socket.to(room).emit('user_typing', { user, typing: true });
      });

      socket.on('typing_stop', (data) => {
        const { room, user } = data;
        socket.to(room).emit('user_typing', { user, typing: false });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const user = connectedUsers.get(socket.id);
        if (user) {
          // Notify others that user is offline
          socket.broadcast.emit('user_offline', {
            userId: user.userId,
            name: user.name,
            socketId: socket.id,
          });
          connectedUsers.delete(socket.id);
        }
      });

      // Send welcome message
      socket.emit('connected', {
        socketId: socket.id,
        message: 'Connected to Oxx real-time services',
      });
    });

    res.socket.server.io = io;
  } else {
    console.log('Socket.IO server already running');
  }
  res.end();
};

export default ioHandler;