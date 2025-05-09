"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--sidebar-dark)]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">TeamSync</h1>
        <p className="text-gray-400">Yükleniyor...</p>
      </div>
    </div>
  );
}
