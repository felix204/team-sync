import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/redux/provider";
import { SocketProvider } from '@/context/SocketContext';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TeamSync - Ekip İçi İletişim Platformu",
  description: "Gerçek zamanlı mesajlaşma ve işbirliği platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        <Providers>
          <SocketProvider>
            {children}
          </SocketProvider>
        </Providers>
      </body>
    </html>
  );
}
