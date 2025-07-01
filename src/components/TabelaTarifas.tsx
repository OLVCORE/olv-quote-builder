"use client";
import React, { useState } from 'react';
import { TabelaTarifas } from '@/lib/tarifas';
import { useRates, Currency } from '@/lib/useRates';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { FaFilePdf, FaFileExcel, FaCoins } from 'react-icons/fa';

interface Props {
  tabela: TabelaTarifas;
}

export default function TabelaTarifasComponent({ tabela }: Props) {
  const [currency, setCurrency] = useState<Currency>('BRL');
  const { rates } = useRates('BRL');
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const defaultRate = currency === 'BRL' ? 1 : rates[currency] || 1;
  const conversionRate = customRate || liveRate || defaultRate;

  async function fetchExchangeRate(from: string, to: string) {
    setLoadingRate(true);
    try {
      const res = await fetch(`https://api.exchangerate.host/latest?base=${from}&symbols=${to}`);
      const data = await res.json();
      setLiveRate(data.rates[to]);
    } catch (e) {
      setLiveRate(null);
    }
    setLoadingRate(false);
  }

  function handleCurrencyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newCurrency = e.target.value as Currency;
    setCurrency(newCurrency);
    setCustomRate(null);
    setLiveRate(null);
    if (newCurrency !== 'BRL') fetchExchangeRate('BRL', newCurrency);
  }

  function convertToForeign(val: number) {
    if (currency === 'BRL') return '-';
    if (!conversionRate || conversionRate === 0) return '-';
    return (val / conversionRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }

  // Exportação PDF (print preview)
  const exportToPDF = () => {
    window.print();
  };

  // Exportação XLSX
  const exportToExcel = () => {
    const table = tabela.items.map(item => {
      const valorNum = typeof item.valor === 'string' ? Number(item.valor.replace(/[^\d,\.]/g, '').replace(',', '.')) : item.valor;
      return {
        Item: item.item,
        Descrição: item.descricao,
        'Valor (BRL)': item.valor,
        [`Valor (${currency})`]: currency === 'BRL' ? '-' : (valorNum / conversionRate).toFixed(2),
        Condições: item.condicoes,
        Observações: item.observacoes,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(table);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tarifas');
    XLSX.writeFile(workbook, 'tabela_tarifas.xlsx');
  };

  return (
    <div className="bg-olvblue dark:bg-bg-dark-secondary p-6 rounded-xl border border-ourovelho dark:border-ourovelho shadow-lg">
      <h3 className="text-xl font-bold text-white dark:text-ourovelho mb-2">{tabela.titulo}</h3>
      {tabela.subtitulo && (
        <p className="text-sm text-white dark:text-slate-200 opacity-80 mb-2">{tabela.subtitulo}</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-accent-light dark:bg-accent-dark text-white">
              <th className="border border-ourovelho p-3 text-left font-semibold">Item</th>
              <th className="border border-ourovelho p-3 text-left font-semibold">Descrição</th>
              <th className="border border-ourovelho p-3 text-center font-semibold">Valor (BRL)</th>
              <th className="border border-ourovelho p-3 text-center font-semibold">Valor ({currency}) <FaCoins className="inline ml-1 text-accent-light" /></th>
              <th className="border border-ourovelho p-3 text-center font-semibold">Condições</th>
              <th className="border border-ourovelho p-3 text-left font-semibold">Observações</th>
            </tr>
          </thead>
          <tbody>
            {tabela.items.map((item, idx) => {
              const valorNum = typeof item.valor === 'string' ? Number(item.valor.replace(/[^\d,\.]/g, '').replace(',', '.')) : item.valor;
              return (
                <tr key={idx} className="odd:bg-olvblue/80 dark:odd:bg-bg-dark-tertiary even:bg-olvblue dark:even:bg-bg-dark-secondary">
                  <td className="border border-ourovelho p-3 font-medium text-white dark:text-ourovelho">{item.item}</td>
                  <td className="border border-ourovelho p-3 text-white dark:text-slate-200">{item.descricao}</td>
                  <td className="border border-ourovelho p-3 text-center font-semibold text-white dark:text-ourovelho">{item.valor}</td>
                  <td className="border border-ourovelho p-3 text-center font-semibold text-white dark:text-ourovelho">{convertToForeign(valorNum)} {currency !== 'BRL' && <FaCoins className="inline ml-1 text-accent-light" />}</td>
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