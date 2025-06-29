import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { QuoteInput, calculateQuote } from '@/lib/pricingEngine';
import { QuotePDF } from '@/lib/pdf';

export async function POST(request: NextRequest) {
  const data = (await request.json()) as QuoteInput;
  const result = calculateQuote(data);

  // Importa dinamicamente para compatibilidade ESM/CJS no Vercel
  const { pdf } = await import('@react-pdf/renderer');

  const doc = <QuotePDF input={data} result={result} />;
  const pdfBuffer = await pdf(doc).toBuffer();

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="quote.pdf"',
    },
  });
} 