"use client";
import React, { useState } from 'react';
import { TabelaTarifas } from '@/lib/tarifas';
import { useRates } from '@/lib/useRates';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { FaFilePdf, FaFileExcel, FaCoins } from 'react-icons/fa';
import { convertValue, formatCurrency as formatCurrencyUtil } from '@/lib/utils/currency';
import { Currency as CurrencyType, ExchangeRates } from '@/lib/types/simulator';

interface Props {
  tabela: TabelaTarifas;
  currency: string;
  customRate: string;
}

export default function TabelaTarifasComponent({ tabela, currency, customRate }: Props) {
  const { rates } = useRates('BRL');
  const defaultRate = currency === 'BRL' ? 1 : rates[currency as keyof ExchangeRates] || 1;
  const conversionRate = customRate ? Number(customRate) : defaultRate;

  // Garante que rates sempre tem as quatro moedas
  const safeRates: ExchangeRates = {
    BRL: 1,
    USD: rates.USD || 0.18,
    EUR: rates.EUR || 0.17,
    CNY: rates.CNY || 1.3
  };
  if (currency !== 'BRL') safeRates[currency as keyof ExchangeRates] = conversionRate;

  function parseValor(valor: string | number): number {
    if (typeof valor === 'number') return valor;
    const match = valor.replace(/\./g, '').replace(/,/g, '.').match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  }

  function convertToForeign(val: number) {
    if (currency === 'BRL') return '-';
    if (!conversionRate || conversionRate === 0) return '-';
    const converted = convertValue(val, 'BRL', currency as CurrencyType, safeRates);
    return formatCurrencyUtil(converted, currency as CurrencyType);
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
    <div className="bg-olvblue dark:bg-bg-dark-secondary p-3 sm:p-4 lg:p-6 rounded-xl border border-ourovelho dark:border-ourovelho shadow-lg">
      <h3 className="text-lg sm:text-xl font-bold text-white dark:text-ourovelho mb-2">{tabela.titulo}</h3>
      {tabela.subtitulo && (
        <p className="text-xs sm:text-sm text-white dark:text-slate-200 opacity-80 mb-2">{tabela.subtitulo}</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-accent-light dark:bg-accent-dark text-white">
              <th className="border border-ourovelho p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">Item</th>
              <th className="border border-ourovelho p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">Descrição</th>
              <th className="border border-ourovelho p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm">Valor (BRL)</th>
              <th className="border border-ourovelho p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm">Valor ({currency})</th>
              <th className="border border-ourovelho p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm">Condições</th>
              <th className="border border-ourovelho p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">Observações</th>
            </tr>
          </thead>
          <tbody>
            {tabela.items.map((item, idx) => {
              const valorNum = parseValor(item.valor);
              return (
                <tr key={idx} className="odd:bg-olvblue/80 dark:odd:bg-bg-dark-tertiary even:bg-olvblue dark:even:bg-bg-dark-secondary">
                  <td className="border border-ourovelho p-2 sm:p-3 font-medium text-white dark:text-ourovelho text-xs sm:text-sm">{item.item}</td>
                  <td className="border border-ourovelho p-2 sm:p-3 text-white dark:text-slate-200 text-xs sm:text-sm">{item.descricao}</td>
                  <td className="border border-ourovelho p-2 sm:p-3 text-center font-semibold text-white dark:text-ourovelho text-xs sm:text-sm">{formatCurrencyUtil(valorNum, 'BRL')}</td>
                  <td className="border border-ourovelho p-2 sm:p-3 text-center font-semibold text-white dark:text-ourovelho text-xs sm:text-sm">{convertToForeign(valorNum)}</td>
                  <td className="border border-ourovelho p-2 sm:p-3 text-center text-white dark:text-slate-200 text-xs sm:text-sm">{item.condicoes}</td>
                  <td className="border border-ourovelho p-2 sm:p-3 text-white dark:text-slate-200 text-xs sm:text-sm">{item.observacoes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {tabela.observacoesGerais && tabela.observacoesGerais.length > 0 && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-accent-light/10 dark:bg-accent-dark/10 rounded-lg border-l-4 border-accent-dark">
          <h4 className="font-semibold text-white dark:text-ourovelho mb-2 text-sm sm:text-base">Observações Gerais</h4>
          <ul className="space-y-1">
            {tabela.observacoesGerais.map((obs, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-white dark:text-slate-200 flex items-start">
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