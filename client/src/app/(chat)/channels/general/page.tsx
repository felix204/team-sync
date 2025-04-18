'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import MessageBox from '@/components/chat/MessageBox';

// Script'ten dönen gerçek kanal ID'sini kullanıyoruz
const GENERAL_CHANNEL_ID = '6802d78d46458d930be5cb97'; 

export default function GeneralChat() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false); // Gerekli değilse false yapabiliriz
  const [channelId, setChannelId] = useState(GENERAL_CHANNEL_ID);

  // Sayfa yüklendiğinde genel kanalı al (opsiyonel)
  // useEffect(() => {
  //   const fetchGeneralChannel = async () => {
  //     try {
  //       const response = await fetch('/api/channels?name=Genel%20Sohbet');
  //       const data = await response.json();
  //       if (data && data.length > 0) {
  //         setChannelId(data[0]._id);
  //       }
  //     } catch (error) {
  //       console.error('Kanal bilgisi alınamadı:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   
  //   fetchGeneralChannel();
  // }, []);

  // Şimdilik loading ekranını kaldırdık
  // if (isLoading) {
  //   return <div className="flex justify-center items-center h-full">Yükleniyor...</div>;
  // }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-[var(--background-tertiary)] px-4 flex items-center">
        <h1 className="text-[var(--header-primary)] font-semibold"># Genel Sohbet</h1>
      </div>

      {/* Mesaj Kutusu - Socket.io entegrasyonu ile */}
      <MessageBox channelId={channelId} />
    </div>
  );
} 