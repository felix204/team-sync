'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import MessageBox from '@/components/chat/MessageBox';
import axios from 'axios';

export default function GeneralChat() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Sayfa yüklendiğinde kanal bilgilerini al
  useEffect(() => {
    async function fetchChannels() {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token bulunamadı');
          setIsLoading(false);
          return;
        }

        // API URL
        const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
        
        // Kanalları getir
        const response = await axios.get(`${SERVER_URL}/api/channels`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Kanallar yüklendi', response.data);
        
        // Genel kanalı bul
        if (response.data && response.data.length > 0) {
          // Adı "Genel" içeren bir kanal var mı?
          const generalChannel = response.data.find((channel: any) => 
            channel.name.toLowerCase().includes('genel') || 
            channel.name.toLowerCase().includes('general')
          );
          
          if (generalChannel) {
            console.log('Genel kanal bulundu:', generalChannel);
            setChannelId(generalChannel._id);
          } else {
            console.log('Genel kanal bulunamadı, ilk kanal kullanılıyor:', response.data[0]);
            setChannelId(response.data[0]._id);
          }
        } else {
          setError('Kanal bulunamadı');
        }
      } catch (error) {
        console.error('Kanal verileri alınamadı', error);
        setError('Kanal bilgileri yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    }

    fetchChannels();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!channelId) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-400">Kanal bulunamadı</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-[var(--background-tertiary)] px-4 flex items-center">
        <h1 className="text-[var(--header-primary)] font-semibold"># Genel Sohbet</h1>
      </div>

      {/* Mesaj Kutusu - Socket.io entegrasyonu ile */}
      <MessageBox channelId={channelId} key={channelId} />
    </div>
  );
} 