"use client";
import React, { useState } from 'react';
import { QuoteInput, QuoteResult } from '@/types/quote';

interface Props {
  onResult: (result: QuoteResult, input: QuoteInput) => void;
}

export default function QuoteForm({ onResult }: Props) {
  const [data, setData] = useState<QuoteInput>({
    teuPerYear: 50,
    cifPerYear: 1000000,
    shipmentsPerMonth: 5,
    complexity: 'low',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/quote/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result: QuoteResult = await res.json();
    onResult(result, data);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-lg mx-auto px-4 sm:px-0">
      <div>
        <label className="block text-sm font-medium mb-1">TEU por ano</label>
        <input
          type="number"
          className="w-full border px-3 py-2 rounded text-sm"
          value={data.teuPerYear}
          onChange={(e) => setData({ ...data, teuPerYear: Number(e.target.value) })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Valor CIF anual (R$)</label>
        <input
          type="number"
          className="w-full border px-3 py-2 rounded text-sm"
          value={data.cifPerYear}
          onChange={(e) => setData({ ...data, cifPerYear: Number(e.target.value) })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Embarques por mês</label>
        <input
          type="number"
          className="w-full border px-3 py-2 rounded text-sm"
          value={data.shipmentsPerMonth}
          onChange={(e) => setData({ ...data, shipmentsPerMonth: Number(e.target.value) })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Complexidade</label>
        <select
          className="w-full border px-3 py-2 rounded text-sm"
          value={data.complexity}
          onChange={(e) => setData({ ...data, complexity: e.target.value as any })}
        >
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
      </div>
      <button
        className="w-full bg-emerald-600 text-white py-2 rounded disabled:opacity-50 text-sm font-semibold"
        disabled={loading}
      >
        {loading ? 'Calculando…' : 'Calcular'}
      </button>
    </form>
  );
} 