'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeUsers: any[];
  messages: any[];
  sendMessage: (content: string, channelId: string) => void;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  activeUsers: [],
  messages: [],
  sendMessage: () => {},
  joinChannel: () => {},
  leaveChannel: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    // Socket.io bağlantısını kur
    const socketInstance = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000');
    
    setSocket(socketInstance);
    
    function onConnect() {
      setIsConnected(true);
      console.log('Socket.io bağlantısı kuruldu');
      
      // Kullanıcı bilgilerini gönder
      socketInstance.emit('user_connected', {
        userId: user.id,
        name: user.username
      });
    }
    
    function onDisconnect() {
      setIsConnected(false);
      console.log('Socket.io bağlantısı kesildi');
    }
    
    function onActiveUsers(users: any[]) {
      setActiveUsers(users);
    }
    
    function onNewMessage(message: any) {
      setMessages((prev) => [...prev, message]);
    }
    
    // Event dinleyicileri
    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('active_users', onActiveUsers);
    socketInstance.on('new_message', onNewMessage);
    
    // Temizlik fonksiyonu
    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('active_users', onActiveUsers);
      socketInstance.off('new_message', onNewMessage);
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user]);
  
  // useCallback ile fonksiyonları memoize et
  const sendMessage = useCallback((content: string, channelId: string) => {
    if (socket && isConnected && user) {
      socket.emit('send_message', {
        content,
        channelId,
        userId: user.id
      });
    }
  }, [socket, isConnected, user]);
  
  const joinChannel = useCallback((channelId: string) => {
    if (socket && isConnected) {
      console.log(`Kanal katılma isteği: ${channelId}`);
      socket.emit('join_channel', channelId);
      // Mesajları sıfırla (yeni kanala geçiş)
      setMessages([]);
    }
  }, [socket, isConnected]);
  
  const leaveChannel = useCallback((channelId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_channel', channelId);
    }
  }, [socket, isConnected]);
  
  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      activeUsers,
      messages,
      sendMessage,
      joinChannel,
      leaveChannel
    }}>
      {children}
    </SocketContext.Provider>
  );
} 