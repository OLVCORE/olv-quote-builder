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

// Tipos para impostos
type TaxType = 'ICMS' | 'PIS' | 'COFINS' | 'II' | 'IPI' | 'ISS' | 'IOF' | 'Custom';
type TaxRate = {
  type: TaxType;
  rate: number;
  description: string;
  enabled: boolean;
};

// Estados brasileiros
const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

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
      }
    }
    setGlobalDiscount(val);
  };

  // Estado para UF selecionada
  const [selectedState, setSelectedState] = useState<string>('SP');

  // Estado para impostos
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    { type: 'ICMS', rate: 18.0, description: 'Imposto sobre Circulação de Mercadorias e Serviços', enabled: true },
    { type: 'PIS', rate: 1.65, description: 'Programa de Integração Social', enabled: true },
    { type: 'COFINS', rate: 7.6, description: 'Contribuição para o Financiamento da Seguridade Social', enabled: true },
    { type: 'II', rate: 0.0, description: 'Imposto de Importação', enabled: false },
    { type: 'IPI', rate: 0.0, description: 'Imposto sobre Produtos Industrializados', enabled: false },
    { type: 'ISS', rate: 5.0, description: 'Imposto Sobre Serviços', enabled: false },
    { type: 'IOF', rate: 0.38, description: 'Imposto sobre Operações Financeiras', enabled: false },
    { type: 'Custom', rate: 0.0, description: 'Taxa customizada', enabled: false },
  ]);

  // Atualizar taxa de imposto
  const updateTaxRate = (type: TaxType, field: keyof TaxRate, value: any) => {
    setTaxRates(prev => prev.map(tax => 
      tax.type === type ? { ...tax, [field]: value } : tax
    ));
  };

  // Adicionar taxa customizada
  const addCustomTax = () => {
    const customName = prompt('Nome da taxa customizada:');
    if (customName) {
      setTaxRates(prev => [...prev, {
        type: 'Custom',
        rate: 0.0,
        description: customName,
        enabled: true
      }]);
    }
  };

  const baseResult = useMemo(() => config.calculate(values), [values, config]);

  // Currency conversion state & rate
  const [currency, setCurrency] = useState<Currency>('BRL');
  const { rates } = useRates('BRL');
  const defaultRate = currency === 'BRL' ? 1 : rates[currency] || 1;
  const [customRate, setCustomRate] = useState<number | null>(null);
  const conversionRate = customRate || defaultRate;

  function convertToForeign(val: number) {
    if (currency === 'BRL') return '-';
    if (!conversionRate || conversionRate === 0) return '-';
    return (val / conversionRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }

  const handleRateChange = (val:number) => {
    setCustomRate(val > 0 ? val : null);
  };

  const extrasTotal = extras.reduce((sum, l) => {
    const lineTotal = l.qty * l.unit * (1 - l.discount / 100);
    return sum + (isNaN(lineTotal) ? 0 : lineTotal);
  }, 0);

  const extrasTotalFX = extrasTotal * conversionRate;

  const subtotal = baseResult.total + extrasTotal;
  const discountAmount = subtotal * (globalDiscount / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;

  // Cálculo de impostos
  const taxesTotal = taxRates.reduce((sum, tax) => {
    if (!tax.enabled) return sum;
    return sum + (subtotalAfterDiscount * (tax.rate / 100));
  }, 0);

  const finalTotal = subtotalAfterDiscount + taxesTotal;

  // Currency conversion
  const convertedTotal = finalTotal * conversionRate;

  // Função utilitária para buscar descrição real do breakdown
  function getBreakdownDescription(config: ServiceConfig, key: string): string {
    // Busca por label do input ou descrição do serviço
    const input = config.inputs.find(i => i.key.toLowerCase() === key.toLowerCase());
    if (input) return input.label;
    // Fallback para descrições conhecidas
    if (key === 'base') return 'Valor base do serviço (setup, book, diagnóstico, etc)';
    if (key === 'retainer') return 'Retainer mensal ou anual conforme serviço';
    if (key === 'extras') return 'Custos adicionais selecionados';
    if (key === 'pmeGrowth') return 'Plano PME Growth (mensal)';
    if (key === 'adhoc') return 'Plano Ad-hoc (horas avulsas)';
    if (key === 'assisted') return 'Embarques assistidos';
    if (key === 'setup') return 'Setup inicial ou diagnóstico';
    if (key === 'variable') return 'Componente variável (ex: % sobre CIF)';
    if (key === 'fee12m') return 'Fee anualizado (12 meses)';
    return config.description || key;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* LEFT – Inputs */}
      <div className="space-y-6">
        {/* Seletor de UF */}
        <div className="bg-bg-light-secondary dark:bg-bg-dark-secondary p-4 rounded-lg border border-accent-light dark:border-accent-dark">
          <h3 className="font-semibold text-accent-dark mb-3">📍 Estado de Destino</h3>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-3 py-2 rounded border border-accent-light dark:border-accent-dark bg-bg-light-tertiary dark:bg-bg-dark-tertiary text-txt-light dark:text-txt-dark"
          >
            {BRAZILIAN_STATES.map(state => (
              <option key={state.value} value={state.value}>
                {state.value} - {state.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-txt-light dark:text-txt-dark mt-2 opacity-75">
            Seleção afeta automaticamente as taxas de ICMS e outros impostos estaduais
          </p>
        </div>

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

        {/* Módulo de Impostos */}
        <div className="bg-bg-light-secondary dark:bg-bg-dark-secondary p-4 rounded-lg border border-accent-light dark:border-accent-dark">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-accent-dark">💰 Impostos e Taxas</h3>
            <button
              type="button"
              onClick={addCustomTax}
              className="text-xs bg-accent-light dark:bg-accent-dark text-white px-2 py-1 rounded hover:bg-accent-light-hover dark:hover:bg-accent-dark-hover"
            >
              + Custom
            </button>
          </div>
          
          <div className="space-y-2">
            {taxRates.map((tax, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-bg-light-tertiary dark:bg-bg-dark-tertiary rounded border">
                <input
                  type="checkbox"
                  checked={tax.enabled}
                  onChange={(e) => updateTaxRate(tax.type, 'enabled', e.target.checked)}
                  className="accent-accent-dark"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-txt-light dark:text-txt-dark">{tax.type}</div>
                  <div className="text-xs text-txt-light dark:text-txt-dark opacity-75">{tax.description}</div>
                </div>
                <input
                  type="number"
                  value={tax.rate}
                  onChange={(e) => updateTaxRate(tax.type, 'rate', parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-sm border rounded bg-white dark:bg-bg-dark-tertiary text-txt-light dark:text-txt-dark"
                  min={0}
                  max={100}
                  step={0.01}
                  disabled={!tax.enabled}
                />
                <span className="text-xs text-txt-light dark:text-txt-dark">%</span>
              </div>
            ))}
          </div>
          
          <div className="mt-3 p-2 bg-accent-light dark:bg-accent-dark text-white rounded text-sm">
            <div className="flex justify-between">
              <span>Total Impostos:</span>
              <span>R$ {taxesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

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
                        {convertToForeign(l.unit)}
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
                        {convertToForeign(subtotal)}
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

        {/* Currency selector & rate */}
        <div className="flex items-center gap-3">
          <label className="text-sm">Moeda:</label>
          <select
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value as Currency);
              setCustomRate(null); // reset custom rate on change
            }}
            className="border px-2 py-1 rounded text-sm"
          >
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <label className="text-sm">Câmbio</label>
          <input
            type="number"
            step="0.0001"
            className="border px-2 py-1 w-24 text-sm"
            value={conversionRate}
            onChange={(e) => handleRateChange(Number(e.target.value))}
            readOnly={currency === 'BRL'}
            min={0.0001}
          />
          {customRate && currency !== 'BRL' && (
            <button
              type="button"
              className="text-xs text-emerald-700 underline"
              onClick={() => setCustomRate(null)}
            >
              reset ↺
            </button>
          )}
        </div>
      </div>

      {/* RIGHT – Memória de cálculo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Memória de Cálculo</h3>
        <table className="w-full text-sm border">
          <tbody>
            {/* Breakdown items from service calculate */}
            {Object.entries(baseResult.breakdown).map(([k, v]) => {
              const perc = (v / subtotal) * 100;
              // Buscar descrição real do item k
              const description = getBreakdownDescription(config, k);
              return (
                <tr key={k} className="odd:bg-white even:bg-slate-50">
                  <td className="border p-1 capitalize">
                    <span title={description}>{k}</span>
                  </td>
                  <td className="border p-1 text-right">R$ {v.toLocaleString('pt-BR')}</td>
                  <td className="border p-1 text-right">{convertToForeign(v)}</td>
                  <td className="border p-1 text-xs text-slate-400">{perc.toFixed(1)}%</td>
                </tr>
              );
            })}
            {/* Extras */}
            {extras.map((l) => {
              const subtotal = l.qty * l.unit * (1 - l.discount / 100);
              return (
                <tr key={l.id} className="odd:bg-white even:bg-slate-50">
                  <td className="border p-1">{l.description || 'Outro custo'}</td>
                  <td className="border p-1 text-right">R$ {(subtotal).toLocaleString('pt-BR')}</td>
                  <td className="border p-1 text-right">{convertToForeign(subtotal)}</td>
                  <td className="border p-1 text-xs text-slate-400"></td>
                </tr>
              );
            })}
            {/* Impostos */}
            {taxRates.filter(tax => tax.enabled).map((tax, idx) => {
              const taxAmount = subtotalAfterDiscount * (tax.rate / 100);
              return (
                <tr key={idx} className="odd:bg-white even:bg-slate-50 bg-yellow-50">
                  <td className="border p-1 text-yellow-800">{tax.type} ({tax.rate}%)</td>
                  <td className="border p-1 text-right text-yellow-800">R$ {taxAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="border p-1 text-right text-yellow-800">{convertToForeign(taxAmount)}</td>
                  <td className="border p-1 text-xs text-slate-400"></td>
                </tr>
              );
            })}
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
                { convertToForeign(subtotal) }
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
                - { convertToForeign(discountAmount) }
              </span>
            </div>
          )}
          <div className="text-sm mb-1 flex justify-between text-yellow-800 font-semibold">
            <span>Impostos</span>
            <span>+ R$ {taxesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          {currency !== 'BRL' && (
            <div className="text-sm mb-1 flex justify-between text-yellow-800">
              <span>Impostos ({currency})</span>
              <span>
                + { convertToForeign(taxesTotal) }
              </span>
            </div>
          )}
          <div className="font-bold text-lg flex justify-between border-t pt-2">
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

        {/* Área textual explicando o serviço */}
        <div className="mt-6 p-4 bg-slate-100 dark:bg-[#141c2f] border-l-4 border-yellow-400 rounded shadow text-slate-700 dark:text-slate-200">
          <h4 className="font-bold mb-1">Sobre este serviço</h4>
          <div className="text-sm whitespace-pre-line">{config.description}</div>
          <div className="text-xs mt-2 text-slate-500">Tabela de tarifas e condições: consulte a ficha técnica do serviço para detalhes completos.</div>
        </div>
      </div>
    </div>
  );
} 