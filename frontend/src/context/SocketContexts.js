import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client'; // v4 named import [fix]
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('ff_token') || localStorage.getItem('token');
    const serverURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // establish connection
    const s = io(serverURL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      console.log('🔌 Connected to chat server');
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.log('🔌 Disconnected from chat server');
      setIsConnected(false);
    });

    s.on('userOnline', ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    s.on('userOffline', ({ userId }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    setSocket(s);

    return () => {
      s.close();
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers(new Set());
    };
  }, [isAuthenticated, user]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinChat: (chatId) => socket?.emit('joinChat', chatId),
    leaveChat: (chatId) => socket?.emit('leaveChat', chatId),
    sendMessage: (data) => socket?.emit('sendMessage', data),
    emitTyping: (data) => socket?.emit('typing', data),
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
