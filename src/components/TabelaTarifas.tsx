"use client";
import React from 'react';
import { TabelaTarifas } from '@/lib/tarifas';

interface Props {
  tabela: TabelaTarifas;
}

export default function TabelaTarifasComponent({ tabela }: Props) {
  return (
    <div className="bg-bg-light-secondary dark:bg-bg-dark-secondary p-6 rounded-xl border border-accent-light dark:border-accent-dark shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-olvblue dark:text-ourovelho mb-2">{tabela.titulo}</h3>
        {tabela.subtitulo && (
          <p className="text-sm text-olvblue dark:text-slate-200 opacity-80">{tabela.subtitulo}</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-accent-light dark:bg-accent-dark text-white">
              <th className="border border-accent-dark p-3 text-left font-semibold">Item</th>
              <th className="border border-accent-dark p-3 text-left font-semibold">Descrição</th>
              <th className="border border-accent-dark p-3 text-center font-semibold">Valor</th>
              <th className="border border-accent-dark p-3 text-center font-semibold">Condições</th>
              <th className="border border-accent-dark p-3 text-left font-semibold">Observações</th>
            </tr>
          </thead>
          <tbody>
            {tabela.items.map((item, idx) => (
              <tr key={idx} className="odd:bg-gray-100 dark:odd:bg-bg-dark-tertiary even:bg-gray-50 dark:even:bg-bg-dark-secondary">
                <td className="border border-accent-light dark:border-accent-dark p-3 font-medium text-olvblue dark:text-ourovelho">
                  {item.item}
                </td>
                <td className="border border-accent-light dark:border-accent-dark p-3 text-olvblue dark:text-slate-200">
                  {item.descricao}
                </td>
                <td className="border border-accent-light dark:border-accent-dark p-3 text-center font-semibold text-olvblue dark:text-ourovelho">
                  {item.valor}
                </td>
                <td className="border border-accent-light dark:border-accent-dark p-3 text-center text-olvblue dark:text-slate-200">
                  {item.condicoes}
                </td>
                <td className="border border-accent-light dark:border-accent-dark p-3 text-olvblue dark:text-slate-200 text-sm">
                  {item.observacoes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tabela.observacoesGerais && tabela.observacoesGerais.length > 0 && (
        <div className="mt-6 p-4 bg-accent-light/10 dark:bg-accent-dark/10 rounded-lg border-l-4 border-accent-dark">
          <h4 className="font-semibold text-olvblue dark:text-ourovelho mb-2">Observações Gerais</h4>
          <ul className="space-y-1">
            {tabela.observacoesGerais.map((obs, idx) => (
              <li key={idx} className="text-sm text-olvblue dark:text-slate-200 flex items-start">
                <span className="text-olvblue dark:text-ourovelho mr-2">•</span>
                {obs}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 