import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import dynamic from 'next/dynamic';

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
      <body className={inter.className + ' bg-slate-50 min-h-screen'}>
        {children}
        {/* Commit info */}
        <footer className="fixed bottom-0 right-0 m-2 text-xs text-slate-400 select-none">
          versão: {commit} • {env}
        </footer>
        <PreviewBanner />
      </body>
    </html>
  );
} 