/**
 * WebSocket Server Setup
 * Real-time messaging, notifications, presence
 */

const socketIO = require('socket.io');
const logger = require('../utils/logger');

class WebSocketManager {
  constructor(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true
      }
    });

    this.userConnections = new Map();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.io.use((socket, next) => {
      socket.userId = 'user_' + Math.random().toString(36).substring(7);
      next();
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info('Socket connected', { userId: socket.userId });

      if (!this.userConnections.has(socket.userId)) {
        this.userConnections.set(socket.userId, []);
      }
      this.userConnections.get(socket.userId).push(socket);

      this.io.emit('user:online', { userId: socket.userId });

      socket.on('message:send', (data) => this.handleMessageSend(socket, data));
      socket.on('message:typing', (data) => this.handleTyping(socket, data));
      socket.on('message:read', (data) => this.handleMessageRead(socket, data));
      socket.on('conversation:join', (data) => this.handleJoinConversation(socket, data));
      socket.on('conversation:leave', (data) => this.handleLeaveConversation(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  async handleMessageSend(socket, data) {
    try {
      const { conversationId, content } = data;
      this.io.to(`conv:${conversationId}`).emit('message:new', {
        id: 'msg_' + Math.random().toString(36).substring(7),
        conversationId,
        senderId: socket.userId,
        content,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Message send error', error);
      socket.emit('message:error', { error: error.message });
    }
  }

  handleTyping(socket, data) {
    const { conversationId } = data;
    socket.to(`conv:${conversationId}`).emit('message:typing', {
      userId: socket.userId,
      conversationId
    });
  }

  async handleMessageRead(socket, data) {
    const { conversationId, messageIds } = data;
    this.io.to(`conv:${conversationId}`).emit('message:read', {
      userId: socket.userId,
      messageIds
    });
  }

  handleJoinConversation(socket, data) {
    const { conversationId } = data;
    socket.join(`conv:${conversationId}`);
    socket.to(`conv:${conversationId}`).emit('user:joined', {
      userId: socket.userId,
      conversationId
    });
  }

  handleLeaveConversation(socket, data) {
    const { conversationId } = data;
    socket.leave(`conv:${conversationId}`);
    socket.to(`conv:${conversationId}`).emit('user:left', {
      userId: socket.userId,
      conversationId
    });
  }

  handleDisconnect(socket) {
    const connections = this.userConnections.get(socket.userId);
    if (connections) {
      const index = connections.indexOf(socket);
      if (index > -1) connections.splice(index, 1);
      if (connections.length === 0) this.userConnections.delete(socket.userId);
    }
    this.io.emit('user:offline', { userId: socket.userId });
  }

  sendNotification(userId, notification) {
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.forEach(socket => socket.emit('notification', notification));
    }
  }

  broadcastToConversation(conversationId, event, data) {
    this.io.to(`conv:${conversationId}`).emit(event, data);
  }
}

module.exports = WebSocketManager;
