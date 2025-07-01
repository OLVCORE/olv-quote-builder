"use client";
import React, { useState } from 'react';
import { TabelaTarifas } from '@/lib/tarifas';
import { useRates, Currency } from '@/lib/useRates';

interface Props {
  tabela: TabelaTarifas;
}

export default function TabelaTarifasComponent({ tabela }: Props) {
  const [currency, setCurrency] = useState<Currency>('BRL');
  const { rates } = useRates('BRL');
  const [customRate, setCustomRate] = useState<number | null>(null);
  const defaultRate = currency === 'BRL' ? 1 : rates[currency] || 1;
  const conversionRate = customRate || defaultRate;
  function convertToForeign(val: number) {
    if (currency === 'BRL') return '-';
    if (!conversionRate || conversionRate === 0) return '-';
    return (val / conversionRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }
  return (
    <div className="bg-olvblue dark:bg-bg-dark-secondary p-6 rounded-xl border border-ourovelho dark:border-ourovelho shadow-lg">
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white dark:text-ourovelho mb-2">{tabela.titulo}</h3>
          {tabela.subtitulo && (
            <p className="text-sm text-white dark:text-slate-200 opacity-80">{tabela.subtitulo}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-white dark:text-ourovelho text-sm font-semibold">Moeda:</label>
          <select
            className="border border-ourovelho dark:border-ourovelho rounded px-2 py-1 bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
            value={currency}
            onChange={e => setCurrency(e.target.value as Currency)}
          >
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <input
            type="number"
            inputMode="numeric"
            className="w-24 border border-ourovelho dark:border-ourovelho rounded px-2 py-1 bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho ml-2"
            placeholder="Cotação"
            value={customRate ?? ''}
            onChange={e => setCustomRate(e.target.value ? Number(e.target.value) : null)}
            min={0}
            step={0.0001}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-accent-light dark:bg-accent-dark text-white">
              <th className="border border-ourovelho p-3 text-left font-semibold">Item</th>
              <th className="border border-ourovelho p-3 text-left font-semibold">Descrição</th>
              <th className="border border-ourovelho p-3 text-center font-semibold">Valor (BRL)</th>
              <th className="border border-ourovelho p-3 text-center font-semibold">Valor ({currency})</th>
              <th className="border border-ourovelho p-3 text-center font-semibold">Condições</th>
              <th className="border border-ourovelho p-3 text-left font-semibold">Observações</th>
            </tr>
          </thead>
          <tbody>
            {tabela.items.map((item, idx) => {
              // Extrair valor numérico do campo valor
              const valorNum = typeof item.valor === 'string' ? Number(item.valor.replace(/[^\d,\.]/g, '').replace(',', '.')) : item.valor;
              return (
                <tr key={idx} className="odd:bg-olvblue/80 dark:odd:bg-bg-dark-tertiary even:bg-olvblue dark:even:bg-bg-dark-secondary">
                  <td className="border border-ourovelho p-3 font-medium text-white dark:text-ourovelho">{item.item}</td>
                  <td className="border border-ourovelho p-3 text-white dark:text-slate-200">{item.descricao}</td>
                  <td className="border border-ourovelho p-3 text-center font-semibold text-white dark:text-ourovelho">{item.valor}</td>
                  <td className="border border-ourovelho p-3 text-center font-semibold text-white dark:text-ourovelho">{convertToForeign(valorNum)}</td>
                  <td className="border border-ourovelho p-3 text-center text-white dark:text-slate-200">{item.condicoes}</td>
                  <td className="border border-ourovelho p-3 text-white dark:text-slate-200 text-sm">{item.observacoes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {tabela.observacoesGerais && tabela.observacoesGerais.length > 0 && (
        <div className="mt-6 p-4 bg-accent-light/10 dark:bg-accent-dark/10 rounded-lg border-l-4 border-accent-dark">
          <h4 className="font-semibold text-white dark:text-ourovelho mb-2">Observações Gerais</h4>
          <ul className="space-y-1">
            {tabela.observacoesGerais.map((obs, idx) => (
              <li key={idx} className="text-sm text-white dark:text-slate-200 flex items-start">
                <span className="text-white dark:text-ourovelho mr-2">•</span>
                {obs}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 