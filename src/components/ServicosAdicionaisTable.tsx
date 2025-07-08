import React from 'react';
import { FaPlus, FaTrash, FaInfoCircle, FaEdit } from 'react-icons/fa';

interface LinhaAdicional {
  descricao: string;
  valor: string;
}

interface Props {
  values: Record<string, any>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  currency?: string;
  exchangeRates?: Record<string, number>;
}

export default function ServicosAdicionaisTable({ values, setValues, currency = 'BRL', exchangeRates = { BRL: 1, USD: 1 } }: Props) {
  // Inicializa linhas adicionais se não existir
  const linhas: LinhaAdicional[] = values.linhasAdicionais && values.linhasAdicionais.length > 0
    ? values.linhasAdicionais
    : [];

  // Adiciona nova linha
  const adicionarLinha = () => {
    setValues((prev) => ({
      ...prev,
      linhasAdicionais: [...linhas, { descricao: '', valor: '' }]
    }));
  };

  // Remove linha
  const removerLinha = (idx: number) => {
    setValues((prev) => ({
      ...prev,
      linhasAdicionais: linhas.filter((_, i) => i !== idx)
    }));
  };

  // Atualiza campo de uma linha
  const atualizarLinha = (idx: number, campo: keyof LinhaAdicional, valor: any) => {
    setValues((prev) => ({
      ...prev,
      linhasAdicionais: linhas.map((linha, i) =>
        i === idx ? { ...linha, [campo]: valor } : linha
      )
    }));
  };

  return (
    <div className="relative">
      {/* PADRONIZADO: Azul oficial */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl blur-xl"></div>
      
      {/* Main container */}
      <div className="relative bg-white/95 dark:bg-slate-800/95 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {/* PADRONIZADO: Azul oficial */}
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <FaEdit className="text-2xl text-white" />
          </div>
          <div>
            {/* PADRONIZADO: Azul oficial */}
            <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400">Serviços Adicionais</h3>
            {/* PADRONIZADO: Azul oficial */}
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              Adicione serviços extras personalizados para sua proposta
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mb-6">
          <div className="inline-block min-w-full align-middle">
            {/* PADRONIZADO: Azul oficial */}
            <div className="overflow-hidden shadow-xl rounded-xl border-2 border-blue-200 dark:border-blue-700">
              <table className="min-w-full divide-y divide-blue-200 dark:divide-blue-700">
                <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaInfoCircle className="text-blue-200" />
                        Descrição
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaInfoCircle className="text-blue-200" />
                        Valor (BRL)
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                      Valor (USD)
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-blue-100 dark:divide-blue-700">
                  {linhas.map((linha, idx) => (
                    <tr 
                      key={idx} 
                      className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 ${
                        idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-blue-50/50 dark:bg-blue-900/10'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={linha.descricao}
                          onChange={e => atualizarLinha(idx, 'descricao', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-700/90 text-blue-700 dark:text-blue-300 placeholder:text-blue-400 dark:placeholder:text-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                          placeholder="Descrição do serviço"
                          title="Descreva o serviço adicional. Exemplo: 'Despacho aduaneiro'."
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={linha.valor}
                          onChange={e => atualizarLinha(idx, 'valor', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-700/90 text-blue-700 dark:text-blue-300 placeholder:text-blue-400 dark:placeholder:text-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                          placeholder="0,00"
                          min={0}
                          title="Informe o valor do serviço adicional em reais."
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {(() => {
                            const val = Number(linha.valor);
                            if (!val || !exchangeRates.USD) return '-';
                            // Conversão BRL -> USD
                            const usd = currency === 'USD' ? val : (val / exchangeRates.USD);
                            return usd.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
                          })()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => removerLinha(idx)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remover linha"
                          disabled={linhas.length === 1}
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PADRONIZADO: Azul oficial */}
        <button
          type="button"
          onClick={adicionarLinha}
          className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          title="Adicionar novo serviço adicional"
        >
          <FaPlus size={16} />
          Adicionar Serviço Adicional
        </button>
      </div>
    </div>
  );
} 