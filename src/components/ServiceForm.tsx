"use client";
import React, { useState, useMemo } from 'react';
import { ServiceConfig, InputField } from '@/lib/services';
import { useAdmin } from './AdminContext';
import { useRates } from '@/lib/useRates';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';

interface Props {
  config: ServiceConfig;
  currency: string;
  customRate: string;
}

export default function ServiceForm({ config, currency, customRate }: Props) {
  const [values, setValues] = useState<Record<string, any>>(
    Object.fromEntries(config.inputs.map((i) => [i.key, i.default]))
  );

  const { admin, enableAdmin } = useAdmin();

  function handleChange(field: InputField, val: any) {
    setValues((prev) => ({ ...prev, [field.key]: val }));
  }

  const baseResult = useMemo(() => config.calculate(values), [values, config]);

  const { rates } = useRates('BRL');
  const defaultRate = currency === 'BRL' ? 1 : rates[currency] || 1;
  const conversionRate = customRate ? Number(customRate) : defaultRate;

  function convertToForeign(val: number) {
    if (currency === 'BRL') return '-';
    if (!conversionRate || conversionRate === 0) return '-';
    return (val / conversionRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }

  const exportToPDF = () => {
    // Implementation of exportToPDF
  };

  const exportToExcel = () => {
    // Implementation of exportToExcel
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 md:px-6">
      <div className="bg-olvblue dark:bg-bg-dark-secondary rounded-xl border border-ourovelho p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white dark:text-ourovelho mb-4">{config.name}</h2>
        <p className="text-white/80 dark:text-ourovelho/80 mb-6">{config.description}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {config.inputs.map((input) => (
            <div key={input.key} className="space-y-2">
              <label className="block text-sm font-semibold text-white dark:text-ourovelho">
                {input.label}
              </label>
              <input
                type={input.type}
                value={values[input.key] || ''}
                onChange={(e) => handleChange(input, e.target.value)}
                className="w-full px-3 py-2 rounded border border-ourovelho bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
                placeholder={input.label}
              />
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho mb-4">Resultado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Total (BRL):</span>
              <div className="text-xl font-bold text-olvblue dark:text-ourovelho">
                R$ {baseResult.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            {currency !== 'BRL' && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Total ({currency}):</span>
                <div className="text-xl font-bold text-olvblue dark:text-ourovelho">
                  {convertToForeign(baseResult.total)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={exportToPDF} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold flex items-center justify-center gap-2">
            <FaFilePdf /> Exportar PDF
          </button>
          <button onClick={exportToExcel} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold flex items-center justify-center gap-2">
            <FaFileExcel /> Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
}