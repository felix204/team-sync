'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen">
      {/* Server List - Sol Sidebar */}
      <div className="server-list">
        {/* Server listesi buraya gelecek */}
      </div>

      {/* Channel List - Orta Sidebar */}
      <div className="sidebar">
        {/* Kanal listesi buraya gelecek */}
      </div>

      {/* Main Content */}
      <div className="content-area">
        {children}
      </div>
    </div>
  );
} 