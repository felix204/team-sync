'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';

interface MessageBoxProps {
  channelId: string;
}

export default function MessageBox({ channelId }: MessageBoxProps) {
  const [input, setInput] = useState('');
  const [remainingMessages, setRemainingMessages] = useState(50);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { socket, isConnected, messages, sendMessage, joinChannel, leaveChannel, fetchChannelMessages } = useSocket();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Fallback mesaj çekme fonksiyonu (fetchChannelMessages olmadığında)
  const fetchMessagesManually = useCallback(async (channelId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
      const response = await axios.get(`${SERVER_URL}/api/channels/${channelId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Manuel olarak mesajlar alındı:', response.data.length);
      
      // Mesajları socket context'e eklemenin bir yolu yok, sadece yerel state kullanabilirsiniz
      // Bu sadece acil bir çözüm, ideal değil
    } catch (error) {
      console.error('Manuel mesaj çekme hatası:', error);
    }
  }, []);
  
  // fetchRemainingMessages için useCallback kullan
  const fetchRemainingMessages = useCallback(async () => {
    if (!user) return;
    
    try {
      // Şimdilik sabit bir değer kullanıyoruz
      setRemainingMessages(50);
    } catch (error) {
      console.error('Mesaj hakkı sorgulanamadı:', error);
    }
  }, [user]);
  
  // Sayfayı yüklediğimizde mesajları çek
  useEffect(() => {
    if (channelId && isConnected) {
      if (typeof fetchChannelMessages === 'function') {
        console.log('fetchChannelMessages ile mesajlar çekiliyor');
        fetchChannelMessages(channelId);
      } else {
        console.log('fetchChannelMessages bulunamadı, manuel çekme deneniyor');
        fetchMessagesManually(channelId);
      }
    }
  }, [channelId, isConnected, fetchChannelMessages, fetchMessagesManually]);
  
  // Kanala katılma - daha az bağımlılıkla
  useEffect(() => {
    if (channelId && socket && isConnected) {
      joinChannel(channelId);
      fetchRemainingMessages();
      
      return () => {
        leaveChannel(channelId);
      };
    }
  }, [channelId, socket, isConnected, joinChannel, leaveChannel, fetchRemainingMessages]);
  
  // Yazıyor... bildirimi - typingUsers bağımlılığını kaldırıldı
  useEffect(() => {
    if (!socket) return;
    
    const handleTyping = (data: { username: string }) => {
      setTypingUsers(prev => {
        if (prev.includes(data.username)) return prev;
        return [...prev, data.username];
      });
      
      // 3 saniye sonra kaldır
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(name => name !== data.username));
      }, 3000);
    };
    
    socket.on('user_typing', handleTyping);
    
    return () => {
      socket.off('user_typing', handleTyping);
    };
  }, [socket]);
  
  // Mesaj limiti bildirimi
  useEffect(() => {
    if (!socket) return;
    
    const handleMessageLimit = (message: string) => {
      alert(message);
    };
    
    socket.on('message_limit', handleMessageLimit);
    
    return () => {
      socket.off('message_limit', handleMessageLimit);
    };
  }, [socket]);
  
  // Mesaj gönderme
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.trim() && channelId) {
      sendMessage(input.trim(), channelId);
      setInput('');
      
      // Kalan mesaj hakkını güncelle
      setRemainingMessages(prev => Math.max(0, prev - 1));
    }
  };
  
  // Typing bildirimi
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    if (socket && isConnected && channelId) {
      socket.emit('typing', { channelId });
    }
  };
  
  // Mesajları otomatik kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Kullanıcı ID karşılaştırma yardımcı fonksiyonu
  const isCurrentUserMessage = (messageUserId: string): boolean => {
    if (!user || !user.id) return false;
    
    // Her ikisini de string olarak karşılaştır
    return String(messageUserId) === String(user.id);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] py-10">
            Henüz mesaj yok. İlk mesajı siz gönderin!
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = isCurrentUserMessage(message.userId);
            
            return (
              <div 
                key={message._id || index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3/4 rounded-lg p-3 ${
                  isOwnMessage
                    ? 'bg-[var(--brand)] text-white'
                    : 'bg-[var(--background-secondary)] text-[var(--text-normal)]'
                }`}>
                  <div className="font-semibold text-xs">
                    {message.username}
                  </div>
                  <div>{message.content}</div>
                  <div className="text-xs opacity-70 text-right">
                    {new Date(message.createdAt || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {typingUsers.length > 0 && (
          <div className="text-sm text-[var(--text-muted)]">
            {typingUsers.join(', ')} yazıyor...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input alanı */}
      <div className="p-4 border-t border-[var(--background-tertiary)]">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={
              remainingMessages > 0 
                ? `Mesaj yazın... (${remainingMessages} mesaj hakkınız kaldı)`
                : 'Günlük mesaj kotanız doldu'
            }
            disabled={remainingMessages <= 0}
            className="flex-1 bg-[var(--background-secondary)] text-[var(--text-normal)] rounded-l-md p-2 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || remainingMessages <= 0}
            className="bg-[var(--brand)] text-white p-2 rounded-r-md disabled:opacity-50"
          >
            Gönder
          </button>
        </form>
        
        {/* Mesaj kotası uyarısı */}
        {remainingMessages <= 10 && remainingMessages > 0 && (
          <div className="mt-2 text-xs text-yellow-500">
            Dikkat: Günlük mesaj kotanız azalıyor! ({remainingMessages} mesaj kaldı)
          </div>
        )}
        
        {remainingMessages <= 0 && (
          <div className="mt-2 text-xs text-red-500">
            Günlük mesaj kotanız doldu. Yarın tekrar mesaj gönderebilirsiniz.
          </div>
        )}
      </div>
    </div>
  );
} 