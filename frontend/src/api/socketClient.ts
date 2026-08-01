import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('tc_token') || localStorage.getItem('token');
    socket = io({
      withCredentials: true,
      auth: {
        token
      }
    });
  }
  return socket;
};
