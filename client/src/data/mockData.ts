import { Message, Channel } from '@/types';

export const mockChannels: Channel[] = [
  {
    id: 'general',
    name: 'Genel Sohbet',
    description: 'Herkesin konuşabileceği genel kanal'
  },
  {
    id: 'kanal-1',
    name: 'Kanal 1',
    description: 'Statik kanal örneği 1'
  },
  {
    id: 'kanal-2',
    name: 'Kanal 2',
    description: 'Statik kanal örneği 2'
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Merhaba, nasılsınız?',
    userId: '1',
    timestamp: new Date().toISOString(),
    channelId: 'general'
  },
  {
    id: '2',
    content: 'İyiyim, teşekkürler!',
    userId: '2',
    timestamp: new Date().toISOString(),
    channelId: 'general'
  }
]; 