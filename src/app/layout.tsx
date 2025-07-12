import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Header from '@/components/layout/header';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

export const metadata: Metadata = {
  title: {
    default: 'OLV Quote Builder 2.0',
    template: '%s | OLV Quote Builder'
  },
  description: 'Plataforma avançada de cotação e simulação fiscal brasileira com IA integrada',
  keywords: ['cotação', 'fiscal', 'brasil', 'simulação', 'impostos', 'comex'],
  authors: [{ name: 'OLV Internacional' }],
  creator: 'OLV Internacional',
  publisher: 'OLV Internacional',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://quote.olvinternacional.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://quote.olvinternacional.com',
    title: 'OLV Quote Builder 2.0',
    description: 'Plataforma avançada de cotação e simulação fiscal brasileira',
    siteName: 'OLV Quote Builder',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OLV Quote Builder 2.0',
    description: 'Plataforma avançada de cotação e simulação fiscal brasileira',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const commit = process.env.NEXT_PUBLIC_COMMIT?.slice(0, 7) || 'dev';
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV || 'local';

  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#667eea" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-background">
              <Header />
              <main className="pt-16">
                {children}
              </main>
            </div>
            
            {/* Global Toaster */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
            
            {/* Version Footer */}
            <footer className="fixed bottom-2 right-2 text-xs text-muted-foreground select-none z-50">
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm border border-border/50">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>v2.0.0 • {commit} • {env}</span>
              </div>
            </footer>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
} 