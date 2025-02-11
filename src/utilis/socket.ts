import { io } from 'socket.io-client';

const socketURL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:5000';

export const initializeSocket = (token: string) =>
  io(socketURL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 2,
    timeout: 10000,
    autoConnect: false,
    auth: {
      token
    }
  });
