import React from 'react';

export default function PreviewBanner() {
  if (typeof window === 'undefined') return null;

  const host = window.location.hostname;
  // Production canonical domain
  const prodDomain = 'olv-quote-builder.vercel.app';
  const isPreview = host !== prodDomain && host.endsWith('vercel.app');

  if (!isPreview) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-black text-sm p-2 text-center z-50">
      Você está visualizando um deploy de PREVIEW –&nbsp;
      <a href={`https://${prodDomain}${window.location.pathname}`} className="underline font-semibold">
        clique aqui para a versão de produção
      </a>
    </div>
  );
} 