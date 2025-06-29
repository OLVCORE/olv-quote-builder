"use client";
import React, { useState, useMemo } from 'react';
import { ServiceConfig, InputField } from '@/lib/services';
import { useAdmin } from './AdminContext';
import { useRates, Currency } from '@/lib/useRates';

type ExtraCost = {
  id: string;
  description: string;
  qty: number;
  unit: number;
  discount: number; // %
};

interface Props {
  config: ServiceConfig;
}

export default function ServiceForm({ config }: Props) {
  const [values, setValues] = useState<Record<string, any>>(
    Object.fromEntries(config.inputs.map((i) => [i.key, i.default]))
  );

  const { admin, enableAdmin } = useAdmin();

  function handleChange(field: InputField, val: any) {
    setValues((prev) => ({ ...prev, [field.key]: val }));
  }

  // Extra costs state
  const [extras, setExtras] = useState<ExtraCost[]>([]);

  const addExtra = () => {
    setExtras((prev) => [
      ...prev,
      { id: Date.now().toString(), description: '', qty: 1, unit: 0, discount: 0 },
    ]);
  };

  const updateExtra = (id: string, key: keyof ExtraCost, value: any) => {
    // Validate discount permissions
    if (key === 'discount' && value > 5 && !admin) {
      const pwd = prompt('Desconto acima de 5% requer aprovação. Senha do gerente:');
      if (pwd === 'olvadmin') {
        enableAdmin();
      } else {
        alert('Senha incorreta');
        return;
      }
    }
    setExtras((prev) => prev.map((l) => (l.id === id ? { ...l, [key]: value } : l)));
  };

  const removeExtra = (id: string) => setExtras((prev) => prev.filter((l) => l.id !== id));

  const [globalDiscount, setGlobalDiscount] = useState<number>(0);

  const handleGlobalDiscount = (val: number) => {
    if (!admin && val > 5) {
      const pwd = prompt('Desconto acima de 5% requer aprovação. Senha do gerente:');
      if (pwd === 'olvadmin') {
        enableAdmin();
      } else {
        alert('Senha incorreta');
        return;
      }
    }
    setGlobalDiscount(val);
  };

  const baseResult = useMemo(() => config.calculate(values), [values, config]);

  // Currency conversion state & rate
  const [currency, setCurrency] = useState<Currency>('BRL');
  const { rates } = useRates('BRL');
  const conversionRate = currency === 'BRL' ? 1 : rates[currency] || 1;

  const extrasTotal = extras.reduce((sum, l) => {
    const lineTotal = l.qty * l.unit * (1 - l.discount / 100);
    return sum + (isNaN(lineTotal) ? 0 : lineTotal);
  }, 0);

  const extrasTotalFX = extrasTotal * conversionRate;

  const subtotal = baseResult.total + extrasTotal;
  const discountAmount = subtotal * (globalDiscount / 100);
  const finalTotal = subtotal - discountAmount;

  // Currency conversion
  const convertedTotal = finalTotal * conversionRate;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* LEFT – Inputs */}
      <div className="space-y-6">
        {/* Inputs */}
        {config.inputs.map((field) => {
          if (field.type === 'number')
            return (
              <div key={field.key}>
                <label className="block text-sm font-semibold mb-1">{field.label}</label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={values[field.key]}
                  onChange={(e) => handleChange(field, Number(e.target.value))}
                />
              </div>
            );
          if (field.type === 'select')
            return (
              <div key={field.key}>
                <label className="block text-sm font-semibold mb-1">{field.label}</label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={values[field.key]}
                  onChange={(e) => handleChange(field, e.target.value)}
                >
                  {field.options!.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          if (field.type === 'checkbox')
            return (
              <label key={field.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-emerald-600"
                  checked={values[field.key] as boolean}
                  onChange={(e) => handleChange(field, e.target.checked)}
                />
                {field.label}
              </label>
            );
        })}

        {/* Outros custos */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Outros custos</h3>
            <button
              type="button"
              onClick={addExtra}
              className="text-sm text-emerald-600 underline"
            >
              + Adicionar linha
            </button>
          </div>
          {extras.length > 0 && (
            <table className="w-full text-sm border">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border p-1">Descrição</th>
                  <th className="border p-1 w-16">Qtd</th>
                  <th className="border p-1 w-24">Unit (BRL)</th>
                  <th className="border p-1 w-24">Unit ({currency})</th>
                  <th className="border p-1 w-20">Desc. %</th>
                  <th className="border p-1 w-24">Subtotal (BRL)</th>
                  <th className="border p-1 w-28">Subtotal ({currency})</th>
                  <th className="border p-1 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {extras.map((l) => {
                  const subtotal = l.qty * l.unit * (1 - l.discount / 100);
                  return (
                    <tr key={l.id} className="odd:bg-white even:bg-slate-50">
                      <td className="border p-1">
                        <input
                          type="text"
                          className="w-full px-1"
                          value={l.description}
                          onChange={(e) => updateExtra(l.id, 'description', e.target.value)}
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          className="w-full px-1"
                          value={l.qty === 0 ? '' : l.qty}
                          min={0}
                          onChange={(e) => updateExtra(l.id, 'qty', Number(e.target.value))}
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          className="w-full px-1 disabled:opacity-70"
                          value={l.unit === 0 ? '' : l.unit}
                          min={0}
                          step={0.01}
                          onChange={(e) => updateExtra(l.id, 'unit', Number(e.target.value))}
                          readOnly={!admin}
                        />
                      </td>
                      {/* Unit FX read-only */}
                      <td className="border p-1 text-right">
                        {currency === 'BRL' ? '-' : (l.unit * conversionRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          className="w-full px-1"
                          value={l.discount === 0 ? '' : l.discount}
                          min={0}
                          max={100}
                          onChange={(e) => updateExtra(l.id, 'discount', Number(e.target.value))}
                        />
                      </td>
                      <td className="border p-1 text-right">
                        {isNaN(subtotal) ? '-' : `R$ ${subtotal.toLocaleString('pt-BR')}`}
                      </td>
                      <td className="border p-1 text-right">
                        {currency === 'BRL'
                          ? '-'
                          : (subtotal * conversionRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border p-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeExtra(l.id)}
                          className="text-xs text-red-600"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Global discount */}
        <div className="flex items-center gap-4">
          <label className="font-semibold">Desconto global (%)</label>
          <input
            type="number"
            className="border px-2 py-1 w-24"
            value={globalDiscount}
            min={0}
            onChange={(e) => handleGlobalDiscount(Number(e.target.value))}
          />
        </div>

        {/* Currency selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm">Moeda:</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="border px-2 py-1 rounded text-sm"
          >
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {/* RIGHT – Memória de cálculo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Memória de Cálculo</h3>
        <table className="w-full text-sm border">
          <tbody>
            {/* Breakdown items from service calculate */}
            {Object.entries(baseResult.breakdown).map(([k, v]) => (
              <tr key={k} className="odd:bg-white even:bg-slate-50">
                <td className="border p-1 capitalize">{k}</td>
                <td className="border p-1 text-right">R$ {v.toLocaleString('pt-BR')}</td>
              </tr>
            ))}
            {/* Extras */}
            {extras.map((l) => (
              <tr key={l.id} className="odd:bg-white even:bg-slate-50">
                <td className="border p-1">{l.description || 'Outro custo'}</td>
                <td className="border p-1 text-right">
                  R$ {(l.qty * l.unit * (1 - l.discount / 100)).toLocaleString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totais */}
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm mb-1 flex justify-between">
            <span>Subtotal</span>
            <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
          </div>
          {currency !== 'BRL' && (
            <div className="text-sm mb-1 flex justify-between">
              <span>Subtotal ({currency})</span>
              <span>
                { (subtotal * conversionRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }
              </span>
            </div>
          )}
          <div className="text-sm mb-1 flex justify-between">
            <span>Descontos</span>
            <span>- R$ {discountAmount.toLocaleString('pt-BR')}</span>
          </div>
          {currency !== 'BRL' && (
            <div className="text-sm mb-1 flex justify-between">
              <span>Descontos ({currency})</span>
              <span>
                - { (discountAmount * conversionRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }
              </span>
            </div>
          )}
          <div className="font-bold text-lg flex justify-between">
            <span>Total Final</span>
            <span>
              {currency === 'BRL' ? 'R$' : currency + ' '} {convertedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* PDF */}
        <button
          type="button"
          className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors text-white py-2 rounded"
          onClick={() => alert('PDF preview em desenvolvimento')}
        >
          Visualizar PDF
        </button>
      </div>
    </div>
  );
} 