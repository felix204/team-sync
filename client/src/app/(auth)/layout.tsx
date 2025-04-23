'use client';

import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background-tertiary)]">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-[var(--background-primary)] p-8 shadow-lg m-4">
        <div className="text-center">
          <div className="flex justify-center">
            <Image
              src="/logo.svg"
              alt="TeamSync Logo"
              width={64}
              height={64}
              className="mb-4"
            />
          </div>
          <h2 className="text-2xl font-bold text-[var(--header-primary)]">
            TeamSync&apos;e Hoş Geldiniz
          </h2>
          <p className="mt-2 text-[var(--text-muted)]">
            Ekibinizle gerçek zamanlı iletişim kurun
          </p>
        </div>
        {children}
      </div>
    </main>
  );
} 