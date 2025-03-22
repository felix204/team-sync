'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/slices/authslice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Şimdilik statik giriş
    dispatch(setUser({
      id: '1',
      username: 'test_user',
      email: formData.email,
    }));
    router.push('/channels/general');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
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
      </div>

      <div>
        <button
          type="submit"
          className="w-full rounded-md bg-[var(--brand)] px-4 py-2 text-white hover:bg-[var(--brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2"
        >
          Giriş Yap
        </button>
      </div>

      <div className="text-center text-sm">
        <span className="text-[var(--text-muted)]">Hesabınız yok mu? </span>
        <Link href="/register" className="text-[var(--text-link)] hover:underline">
          Kayıt Ol
        </Link>
      </div>
    </form>
  );
} 