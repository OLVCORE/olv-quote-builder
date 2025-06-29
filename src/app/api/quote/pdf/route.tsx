import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { QuoteInput, calculateQuote } from '@/lib/pricingEngine';
import { QuotePDF } from '@/lib/pdf';
import { pdf } from '@react-pdf/renderer';

export async function POST(request: NextRequest) {
  const data = (await request.json()) as QuoteInput;
  const result = calculateQuote(data);

  const doc = <QuotePDF input={data} result={result} />;
  const pdfBuffer = await pdf(doc).toBuffer();

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="quote.pdf"',
    },
  });
} 