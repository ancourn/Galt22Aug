import { Server } from 'socket.io';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join user-specific room for personalized updates
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined room user:${userId}`);
    }
    
    // Join team rooms if specified
    const teamIds = socket.handshake.query.teamIds;
    if (teamIds) {
      const teams = Array.isArray(teamIds) ? teamIds : [teamIds];
      teams.forEach(teamId => {
        socket.join(`team:${teamId}`);
        console.log(`User ${userId} joined team:${teamId}`);
      });
    }
    
    // Handle messages
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Mail events
    socket.on('mail:received', (data: { userId: string; mail: any }) => {
      // Broadcast to all clients in the user's room
      io.to(`user:${data.userId}`).emit('mail:update', {
        type: 'received',
        mail: data.mail,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('mail:sent', (data: { userId: string; mail: any }) => {
      // Broadcast to all clients in the user's room
      io.to(`user:${data.userId}`).emit('mail:update', {
        type: 'sent',
        mail: data.mail,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('mail:updated', (data: { userId: string; mailId: string; updates: any }) => {
      // Broadcast to all clients in the user's room
      io.to(`user:${data.userId}`).emit('mail:update', {
        type: 'updated',
        mailId: data.mailId,
        updates: data.updates,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('mail:deleted', (data: { userId: string; mailId: string }) => {
      // Broadcast to all clients in the user's room
      io.to(`user:${data.userId}`).emit('mail:update', {
        type: 'deleted',
        mailId: data.mailId,
        timestamp: new Date().toISOString(),
      });
    });

    // Team events
    socket.on('team:created', (data: { team: any; members: string[] }) => {
      // Notify all team members
      data.members.forEach(memberId => {
        io.to(`user:${memberId}`).emit('team:update', {
          type: 'created',
          team: data.team,
          timestamp: new Date().toISOString(),
        });
      });
    });

    socket.on('team:updated', (data: { teamId: string; updates: any; members: string[] }) => {
      // Notify all team members
      data.members.forEach(memberId => {
        io.to(`user:${memberId}`).emit('team:update', {
          type: 'updated',
          teamId: data.teamId,
          updates: data.updates,
          timestamp: new Date().toISOString(),
        });
      });
    });

    socket.on('team:member_added', (data: { teamId: string; member: any; members: string[] }) => {
      // Notify all team members
      data.members.forEach(memberId => {
        io.to(`user:${memberId}`).emit('team:update', {
          type: 'member_added',
          teamId: data.teamId,
          member: data.member,
          timestamp: new Date().toISOString(),
        });
      });
    });

    // Task events
    socket.on('task:created', (data: { task: any; teamId?: string; assigneeId?: string; reporterId: string }) => {
      // Notify relevant users
      const recipients = new Set([data.reporterId]);
      
      if (data.assigneeId) {
        recipients.add(data.assigneeId);
      }
      
      if (data.teamId) {
        // Broadcast to all team members
        io.to(`team:${data.teamId}`).emit('task:update', {
          type: 'created',
          task: data.task,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Broadcast to specific users
        recipients.forEach(userId => {
          io.to(`user:${userId}`).emit('task:update', {
            type: 'created',
            task: data.task,
            timestamp: new Date().toISOString(),
          });
        });
      }
    });

    socket.on('task:updated', (data: { taskId: string; updates: any; teamId?: string; assigneeId?: string; reporterId: string }) => {
      // Notify relevant users
      const recipients = new Set([data.reporterId]);
      
      if (data.assigneeId) {
        recipients.add(data.assigneeId);
      }
      
      if (data.teamId) {
        // Broadcast to all team members
        io.to(`team:${data.teamId}`).emit('task:update', {
          type: 'updated',
          taskId: data.taskId,
          updates: data.updates,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Broadcast to specific users
        recipients.forEach(userId => {
          io.to(`user:${userId}`).emit('task:update', {
            type: 'updated',
            taskId: data.taskId,
            updates: data.updates,
            timestamp: new Date().toISOString(),
          });
        });
      }
    });

    socket.on('task:deleted', (data: { taskId: string; teamId?: string; assigneeId?: string; reporterId: string }) => {
      // Notify relevant users
      const recipients = new Set([data.reporterId]);
      
      if (data.assigneeId) {
        recipients.add(data.assigneeId);
      }
      
      if (data.teamId) {
        // Broadcast to all team members
        io.to(`team:${data.teamId}`).emit('task:update', {
          type: 'deleted',
          taskId: data.taskId,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Broadcast to specific users
        recipients.forEach(userId => {
          io.to(`user:${userId}`).emit('task:update', {
            type: 'deleted',
            taskId: data.taskId,
            timestamp: new Date().toISOString(),
          });
        });
      }
    });

    socket.on('task:comment_added', (data: { taskId: string; comment: any; teamId?: string; assigneeId?: string; reporterId: string }) => {
      // Notify relevant users
      const recipients = new Set([data.reporterId, data.comment.userId]);
      
      if (data.assigneeId) {
        recipients.add(data.assigneeId);
      }
      
      if (data.teamId) {
        // Broadcast to all team members
        io.to(`team:${data.teamId}`).emit('task:update', {
          type: 'comment_added',
          taskId: data.taskId,
          comment: data.comment,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Broadcast to specific users
        recipients.forEach(userId => {
          io.to(`user:${userId}`).emit('task:update', {
            type: 'comment_added',
            taskId: data.taskId,
            comment: data.comment,
            timestamp: new Date().toISOString(),
          });
        });
      }
    });

    // Document events
    socket.on('document:uploaded', (data: { document: any; userId: string; teamId?: string }) => {
      // Notify document owner and team members
      io.to(`user:${data.userId}`).emit('document:update', {
        type: 'uploaded',
        document: data.document,
        timestamp: new Date().toISOString(),
      });

      if (data.teamId) {
        io.to(`team:${data.teamId}`).emit('document:update', {
          type: 'uploaded',
          document: data.document,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('document:processed', (data: { documentId: string; userId: string; status: string; message?: string }) => {
      // Notify document owner
      io.to(`user:${data.userId}`).emit('document_processed', {
        documentId: data.documentId,
        status: data.status,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('document:shared', (data: { documentId: string; sharedBy: string; sharedWith: string; permission: string; message?: string }) => {
      // Notify the user who received the share
      io.to(`user:${data.sharedWith}`).emit('document_shared', {
        documentId: data.documentId,
        sharedBy: data.sharedBy,
        permission: data.permission,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('document:updated', (data: { documentId: string; updates: any; userId: string; teamId?: string }) => {
      // Notify document owner and team members
      io.to(`user:${data.userId}`).emit('document:update', {
        type: 'updated',
        documentId: data.documentId,
        updates: data.updates,
        timestamp: new Date().toISOString(),
      });

      if (data.teamId) {
        io.to(`team:${data.teamId}`).emit('document:update', {
          type: 'updated',
          documentId: data.documentId,
          updates: data.updates,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('document:deleted', (data: { documentId: string; userId: string; teamId?: string }) => {
      // Notify document owner and team members
      io.to(`user:${data.userId}`).emit('document:update', {
        type: 'deleted',
        documentId: data.documentId,
        timestamp: new Date().toISOString(),
      });

      if (data.teamId) {
        io.to(`team:${data.teamId}`).emit('document:update', {
          type: 'deleted',
          documentId: data.documentId,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to WebSocket Echo Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};