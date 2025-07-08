import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Simulator/Header';
import { AuthProvider } from '@/components/AuthContext';

const inter = Inter({ subsets: ['latin'] });

const PreviewBanner = dynamic(() => import('@/components/PreviewBanner'), { ssr: false });

export const metadata: Metadata = {
  title: 'OLV Quote Builder',
  description: 'Internal quoting tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const commit = process.env.NEXT_PUBLIC_COMMIT?.slice(0, 7) || 'dev';
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV || 'local';

  return (
    <html lang="pt-BR">
      <body className={inter.className + ' bg-slate-50 min-h-screen dark:bg-slate-900'}>
        <AuthProvider>
          {/* Novo Header OLV Internacional */}
          <Header />
          <div className="pt-4 pb-16 max-w-7xl mx-auto">{children}</div>
          {/* Commit info */}
          <footer className="fixed bottom-0 right-0 m-2 text-xs text-slate-400 select-none z-50">
            versão: {commit} • {env}
          </footer>
          <PreviewBanner />
        </AuthProvider>
      </body>
    </html>
  );
} 