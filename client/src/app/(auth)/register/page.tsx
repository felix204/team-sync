'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/slices/authslice';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      return;
    }
    // Şimdilik statik kayıt
    dispatch(setUser({
      id: '1',
      username: formData.username,
      email: formData.email,
    }));
    router.push('/channels/general');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-[var(--text-normal)]">
            Kullanıcı Adı
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="mt-1 block w-full rounded-md bg-[var(--background-secondary)] px-3 py-2 text-[var(--text-normal)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            placeholder="kullanici_adi"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--text-normal)]">
            E-posta Adresi
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full rounded-md bg-[var(--background-secondary)] px-3 py-2 text-[var(--text-normal)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            placeholder="ornek@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--text-normal)]">
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="mt-1 block w-full rounded-md bg-[var(--background-secondary)] px-3 py-2 text-[var(--text-normal)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-normal)]">
            Şifre Tekrar
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="mt-1 block w-full rounded-md bg-[var(--background-secondary)] px-3 py-2 text-[var(--text-normal)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full rounded-md bg-[var(--brand)] px-4 py-2 text-white hover:bg-[var(--brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2"
        >
          Kayıt Ol
        </button>
      </div>

      <div className="text-center text-sm">
        <span className="text-[var(--text-muted)]">Zaten hesabınız var mı? </span>
        <Link href="/login" className="text-[var(--text-link)] hover:underline">
          Giriş Yap
        </Link>
      </div>
    </form>
  );
} 