import 'dotenv/config';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app';
import prisma from './lib/prisma';
import redis from './lib/redis';

const PORT = process.env.API_PORT || 3001;

async function bootstrap() {
  // Kiểm tra kết nối database
  await prisma.$connect();
  console.log('✅ PostgreSQL connected');

  await redis.connect();

  const server = http.createServer(app);

  // Khởi tạo Socket.io cho realtime notifications
  const io = new SocketServer(server, {
    cors: {
      origin: (process.env.CORS_ORIGINS || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join', (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`🚀 ACFMart API running on http://localhost:${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received — shutting down gracefully');
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
