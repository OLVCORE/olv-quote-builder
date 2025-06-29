"use client";
import React, { useState } from 'react';
import QuoteForm from '@/components/QuoteForm';
import QuoteResult from '@/components/QuoteResult';
import { QuoteInput, QuoteResult as QR } from '@/types/quote';

export default function QuoteInCompany() {
  const [data, setData] = useState<{ input: QuoteInput; result: QR } | null>(null);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Simulador – Consult In-Company</h1>
      <QuoteForm onResult={(result, input) => setData({ input, result })} />
      {data && <QuoteResult input={data.input} result={data.result} />}
    </main>
  );
} 