'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import React from 'react';

interface MessageBoxProps {
  channelId: string;
}

interface Channel {
  id: string;
  name: string;
}

export default function MessageBox({ channelId }: MessageBoxProps) {
  const [input, setInput] = useState('');
  const [remainingMessages, setRemainingMessages] = useState(50);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { socket, isConnected, messages: socketMessages, sendMessage, joinChannel, leaveChannel, fetchChannelMessages, setMessages } = useSocket();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Mesajları temizleme fonksiyonu
  const clearMessages = () => {
    if (window.confirm('Mesaj geçmişini temizlemek istediğinize emin misiniz?')) {
      try {
        const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        
        if (!token || !channelId) return;
        
        axios.delete(`${SERVER_URL}/api/channels/${channelId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
          setMessages([]);
          console.log('Mesajlar başarıyla silindi');
        })
        .catch(error => {
          console.error('Mesajları silme hatası:', error);
          alert('Mesajlar silinirken bir hata oluştu');
        });
      } catch (error) {
        console.error('Mesajları silme hatası:', error);
      }
    }
  };
  

  const fetchMessagesManually = useCallback(async (channelId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
      const response = await axios.get(`${SERVER_URL}/api/channels/${channelId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Manuel olarak mesajlar alındı:', response.data.length);
      

    } catch (error) {
      console.error('Manuel mesaj çekme hatası:', error);
    }
  }, []);
  

  const fetchRemainingMessages = useCallback(async () => {
    if (!user) return;
    
    try {

      setRemainingMessages(50);
    } catch (error) {
      console.error('Mesaj hakkı sorgulanamadı:', error);
    }
  }, [user]);
  

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
  

  useEffect(() => {
    if (channelId && socket && isConnected) {
      joinChannel(channelId);
      fetchRemainingMessages();
      
      return () => {
        leaveChannel(channelId);
      };
    }
  }, [channelId, socket, isConnected, joinChannel, leaveChannel, fetchRemainingMessages]);
  

  useEffect(() => {
    if (!socket) return;
    
    const handleTyping = (data: { username: string }) => {
      setTypingUsers(prev => {
        if (prev.includes(data.username)) return prev;
        return [...prev, data.username];
      });
      

      setTimeout(() => {
        setTypingUsers(prev => prev.filter(name => name !== data.username));
      }, 3000);
    };
    
    socket.on('user_typing', handleTyping);
    
    return () => {
      socket.off('user_typing', handleTyping);
    };
  }, [socket]);
  

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
  

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.trim() && channelId) {
      sendMessage(input.trim(), channelId);
      setInput('');
      
      
      setRemainingMessages(prev => Math.max(0, prev - 1));
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    if (socket && isConnected && channelId) {
      socket.emit('typing', { channelId });
    }
  };
  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [socketMessages]);
  

  const isCurrentUserMessage = (messageUserId: string): boolean => {
    if (!user || !user.id) return false;
    

    return String(messageUserId) === String(user.id);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 className="font-semibold">{channelId}</h3>
        <button
          onClick={clearMessages}
          className="text-xs px-3 py-1 rounded-md border border-[var(--background-tertiary)] hover:bg-[var(--background-secondary)]"
        >
          Geçmişi Temizle
        </button>
      </div>
      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {socketMessages.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] py-10">
            Henüz mesaj yok. İlk mesajı siz gönderin!
          </div>
        ) : (
          socketMessages.map((message, index) => {
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