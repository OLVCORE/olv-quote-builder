"use client";
import React, { useState } from 'react';
import { TabelaTarifas } from '@/lib/tarifas';
import { useRates } from '@/lib/useRates';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { FaFilePdf, FaFileExcel, FaCoins, FaInfoCircle } from 'react-icons/fa';
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
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl blur-xl"></div>
      
      {/* Main container */}
      <div className="relative bg-white/95 dark:bg-slate-800/95 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FaCoins className="text-2xl text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400">{tabela.titulo}</h3>
              {tabela.subtitulo && (
                <p className="text-sm text-blue-600 dark:text-blue-300 opacity-80 mt-1">{tabela.subtitulo}</p>
              )}
            </div>
          </div>
          
          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportToPDF}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              title="Exportar PDF"
            >
              <FaFilePdf size={16} />
            </button>
            <button
              onClick={exportToExcel}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              title="Exportar Excel"
            >
              <FaFileExcel size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow-xl rounded-xl border-2 border-blue-200 dark:border-blue-700">
              <table className="min-w-full divide-y divide-blue-200 dark:divide-blue-700">
                <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                      Valor (BRL)
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                      Valor ({currency})
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                      Condições
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-blue-100 dark:divide-blue-700">
                  {tabela.items.map((item, idx) => {
                    const valorNum = parseValor(item.valor);
                    return (
                      <tr 
                        key={idx} 
                        className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 ${
                          idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-blue-50/50 dark:bg-blue-900/10'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700 dark:text-blue-300">
                          {item.item}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">
                          {item.descricao}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrencyUtil(valorNum, 'BRL')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                          {convertToForeign(valorNum)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-600 dark:text-slate-300">
                          {item.condicoes}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {item.observacoes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Observações Gerais */}
        {tabela.observacoesGerais && tabela.observacoesGerais.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <FaInfoCircle className="text-white" />
              </div>
              <h4 className="text-lg font-bold text-blue-700 dark:text-blue-400">Observações Gerais</h4>
            </div>
            <ul className="space-y-2">
              {tabela.observacoesGerais.map((obs, idx) => (
                <li key={idx} className="text-sm text-slate-700 dark:text-slate-200 flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-3 mt-1">•</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 