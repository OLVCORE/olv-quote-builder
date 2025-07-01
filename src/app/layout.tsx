import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

const PreviewBanner = dynamic(() => import('@/components/PreviewBanner'), { ssr: false });

const LanguageSwitcher = dynamic(() => import('@/components/LanguageSwitcher'), { ssr: false });

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
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 bg-slate-800 text-white sticky top-0 z-40 shadow">
          <div className="flex items-center gap-2">
            <div className="rounded-full border-4 border-yellow-400 transition-shadow duration-200 hover:shadow-[0_0_0_4px_rgba(255,215,0,0.5)] w-12 h-12 flex items-center justify-center bg-white">
              <Image src="/logo-olv.svg" alt="OLV" width={40} height={40} className="rounded-full" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-slate-900 ml-2">OLV Quote Builder</span>
          </div>
          <LanguageSwitcher />
        </header>

        <div className="pt-4">{children}</div>
        {/* Commit info */}
        <footer className="fixed bottom-0 right-0 m-2 text-xs text-slate-400 select-none">
          versão: {commit} • {env}
        </footer>
        <PreviewBanner />
      </body>
    </html>
  );
} 