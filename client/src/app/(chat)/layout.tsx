'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProfile } from '@/api/auth';
import { setUser } from '@/redux/slices/authslice';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      setHasToken(!!token);
      
      if (token && !isAuthenticated) {
        try {
          // Token varsa ama kullanıcı bilgileri yoksa (sayfa yenilemeden sonra)
          // Kullanıcı profilini çekip Redux'a kaydedelim
          const profileData = await dispatch(getProfile()).unwrap();
          dispatch(setUser({
            id: profileData._id,
            username: profileData.name,
            email: profileData.email
          }));
        } catch (error) {
          console.error('Profil bilgisi alınamadı:', error);
          localStorage.removeItem('token');
          router.push('/login');
        }
      } else if (!token && !isAuthenticated) {
        router.push('/login');
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [isAuthenticated, router, dispatch]);

  if (loading) {
    return null; // Yükleme sırasında hiçbir şey gösterme
  }

  if (!isAuthenticated && !hasToken) {
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