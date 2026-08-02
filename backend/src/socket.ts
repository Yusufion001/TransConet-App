import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from './config/env';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin.includes('transconet') || origin.includes('railway') || origin.includes('onrender') || origin.includes('vercel') || origin.endsWith('.run.app') || origin.endsWith('.cloudshell.dev') || origin.includes('localhost')) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // JWT Authentication Middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, User: ${(socket as any).user?.id}`);

    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
    });

    socket.on('join_load', (loadId) => {
      socket.join(`load_${loadId}`);
      console.log(`Socket ${socket.id} joined load_${loadId}`);
    });

    socket.on('driver_update_location', (data: { loadId: string, lat: number, lng: number }) => {
        // Enforce that only authorized transporters can emit locations
        const userRole = (socket as any).user?.role;
        if (userRole !== 'TRANSPORTER' && userRole !== 'ADMIN') {
          return; // Silently drop unauthorized location updates
        }

        const { loadId, lat, lng } = data;
        io?.to(`load_${loadId}`).emit('location_update', { lat, lng, timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
