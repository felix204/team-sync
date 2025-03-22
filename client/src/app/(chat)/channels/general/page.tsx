'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { mockMessages } from '@/data/mockData';
import { Message } from '@/types';

export default function GeneralChat() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      userId: user?.id || '',
      timestamp: new Date().toISOString(),
      channelId: 'general'
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-[var(--background-tertiary)] px-4 flex items-center">
        <h1 className="text-[var(--header-primary)] font-semibold"># Genel Sohbet</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-4">
            <div className="user-avatar bg-[var(--brand)]">
              {message.userId === user?.id ? 'S' : 'O'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[var(--header-primary)] font-medium">
                  {message.userId === user?.id ? 'Sen' : 'Diğer Kullanıcı'}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-[var(--text-normal)]">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--background-tertiary)]">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="message-input flex-1"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--brand)] text-white rounded-md hover:bg-[var(--brand-hover)] transition-colors"
          >
            Gönder
          </button>
        </div>
      </form>
    </div>
  );
} 