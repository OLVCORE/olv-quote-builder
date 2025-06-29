import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { QuoteInput, calculateQuote } from '@/lib/pricingEngine';
// Importação adiada para evitar que @react-pdf/renderer seja avaliado em build

export async function POST(request: NextRequest) {
  const data = (await request.json()) as QuoteInput;
  const result = calculateQuote(data);

  // Importa dinamicamente para compatibilidade ESM/CJS no Vercel
  const { pdf } = await import('@react-pdf/renderer');
  const { QuotePDF } = await import('@/lib/pdf');

  const doc = <QuotePDF input={data} result={result} />;
  const pdfBuffer = await pdf(doc).toBuffer();

  return new NextResponse(pdfBuffer as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="quote.pdf"',
    },
  });
} 