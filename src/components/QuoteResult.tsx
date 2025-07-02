import React from 'react';
import { QuoteInput, QuoteResult as QR } from '@/types/quote';

interface Props {
  input: QuoteInput;
  result: QR;
}

export default function QuoteResult({ input, result }: Props) {
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded shadow p-4 sm:p-6 space-y-3 px-4 sm:px-0">
      <h2 className="text-lg sm:text-xl font-semibold">Resultado</h2>
      <p className="text-sm sm:text-base">
        Retainer sugerido: <strong>R$ {result.retainer.toLocaleString('pt-BR')}</strong>/mês
      </p>
      <p className="text-sm sm:text-base">
        Variável sobre CIF/savings: <strong>{result.variableRate}%</strong>
      </p>
      <p className="text-sm sm:text-base">ROI 12 meses: <strong>{result.roi12m}%</strong></p>
      <p className="text-sm sm:text-base">Payback: <strong>{result.paybackMonths} meses</strong></p>
    </div>
  );
} 