import React from 'react';
import { QuoteInput, QuoteResult as QR } from '@/types/quote';

interface Props {
  input: QuoteInput;
  result: QR;
}

export default function QuoteResult({ input, result }: Props) {
  return (
    <div className="max-w-lg bg-white rounded shadow p-6 space-y-3">
      <h2 className="text-xl font-semibold">Resultado</h2>
      <p>
        Retainer sugerido: <strong>R$ {result.retainer.toLocaleString('pt-BR')}</strong>/mês
      </p>
      <p>
        Variável sobre CIF/savings: <strong>{result.variableRate}%</strong>
      </p>
      <p>ROI 12 meses: <strong>{result.roi12m}%</strong></p>
      <p>Payback: <strong>{result.paybackMonths} meses</strong></p>
    </div>
  );
} 