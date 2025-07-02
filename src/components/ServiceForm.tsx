"use client";
import React, { useState, useMemo } from 'react';
import { ServiceConfig, InputField } from '@/lib/services';
import { useAdmin } from './AdminContext';
import { useRates, Currency } from '@/lib/useRates';
import { getTabelaTarifas } from '@/lib/tarifas';
import TabelaTarifasComponent from './TabelaTarifas';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';

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
  currency: string;
  customRate: string;
}

// Exemplo de tooltip simples
function Tooltip({ text, children }: { text: string, children: React.ReactNode }) {
  return (
    <span className="relative group cursor-help">
      {children}
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs px-3 py-1 rounded bg-slate-900 text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity duration-200 shadow-lg">
        {text}
      </span>
    </span>
  );
}

export default function ServiceForm({ config, currency, customRate }: Props) {
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
    // Permitir desconto acima de 5% para qualquer usuário, apenas exibir aviso
    if (key === 'discount' && value > 5) {
      alert('Atenção: descontos acima de 5% devem ser usados com critério.');
    }
    setExtras((prev) => prev.map((l) => (l.id === id ? { ...l, [key]: value } : l)));
  };

  const removeExtra = (id: string) => setExtras((prev) => prev.filter((l) => l.id !== id));

  const [globalDiscount, setGlobalDiscount] = useState<number>(0);

  const handleGlobalDiscount = (val: number) => {
    // Permitir desconto global acima de 5% para qualquer usuário, apenas exibir aviso
    if (val > 5) {
      alert('Atenção: descontos acima de 5% devem ser usados com critério.');
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
  const { rates } = useRates('BRL');
  const defaultRate = currency === 'BRL' ? 1 : rates[currency] || 1;
  const conversionRate = customRate ? Number(customRate) : defaultRate;

  function convertToForeign(val: number) {
    if (currency === 'BRL') return '-';
    if (!conversionRate || conversionRate === 0) return '-';
    return (val / conversionRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }

  const handleRateChange = (val:number) => {
    // This function is now empty as the conversionRate is managed by the props
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

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // This function is now empty as the currency is managed by the props
  };

  const loadingRate = false;
  const exportToPDF = () => {
    // Implementation of exportToPDF
  };
  const exportToExcel = () => {
    // Implementation of exportToExcel
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 px-2 sm:px-4 md:px-6">
      {/* Linha 1: Serviços Principais (esquerda) + Resultados (direita) */}
      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {/* 1. Serviços Principais */}
          <section className="bg-olvblue dark:bg-bg-dark-secondary rounded-xl border border-ourovelho dark:border-ourovelho shadow p-4 sm:p-6">
            <h2 className="text-lg font-bold text-white dark:text-ourovelho mb-4 flex items-center gap-2">
              1. Serviços Principais
              <Tooltip text="Preencha os dados essenciais do serviço principal selecionado. Cada campo impacta diretamente o cálculo da proposta.">
                <svg className="w-4 h-4 text-white dark:text-ourovelho" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
              </Tooltip>
            </h2>
            {config.inputs.filter(f => !f.key.startsWith('extra') && !f.key.startsWith('add') && !f.key.startsWith('custom')).map((field) => {
              if (field.type === 'number')
                return (
                  <div key={field.key} className="mb-3">
                    <label className="block text-sm font-semibold mb-1 text-white dark:text-ourovelho">{field.label}</label>
                    <input
                      type="number"
                      className="w-full border border-ourovelho dark:border-ourovelho px-3 py-2 rounded bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
                      value={values[field.key]}
                      onChange={(e) => handleChange(field, Number(e.target.value))}
                    />
                  </div>
                );
              if (field.type === 'select')
                return (
                  <div key={field.key} className="mb-3">
                    <label className="block text-sm font-semibold mb-1 text-white dark:text-ourovelho">{field.label}</label>
                    <select
                      className="w-full border border-ourovelho dark:border-ourovelho px-3 py-2 rounded bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
                      value={values[field.key]}
                      onChange={(e) => handleChange(field, e.target.value)}
                    >
                      {field.options!.map((opt) => (
                        <option key={opt.value} value={opt.value} className="text-white dark:text-ourovelho">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              if (field.type === 'checkbox')
                return (
                  <label key={field.key} className="flex items-center gap-2 mb-2 text-white dark:text-ourovelho">
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
          </section>
        </div>
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {/* 4. Resultados */}
          <section className="bg-olvblue dark:bg-bg-dark-secondary rounded-xl border border-ourovelho dark:border-ourovelho shadow p-4 sm:p-6">
            <h2 className="text-lg font-bold text-white dark:text-ourovelho mb-4 flex items-center gap-2">
              4. Resultados
              <Tooltip text="Veja o detalhamento do cálculo, totais, descontos e impostos da proposta.">
                <svg className="w-4 h-4 text-white dark:text-ourovelho" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
              </Tooltip>
            </h2>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-white dark:text-ourovelho mb-2">Memória de Cálculo</h3>
              <table className="w-full text-sm border border-ourovelho dark:border-ourovelho rounded overflow-hidden">
                <thead className="bg-olvblue/60 dark:bg-bg-dark-tertiary">
                  <tr>
                    <th className="border p-2 text-white dark:text-ourovelho">Item</th>
                    <th className="border p-2 text-white dark:text-ourovelho">Valor (BRL)</th>
                    <th className="border p-2 text-white dark:text-ourovelho">Valor ({currency})</th>
                    <th className="border p-2 text-white dark:text-ourovelho">%</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Serviços principais flagados (checkbox marcados) */}
                  {config.inputs.filter(f => f.type === 'checkbox' && values[f.key]).map((field) => {
                    const value = baseResult.breakdown[field.key] || 0;
                    const perc = finalTotal ? (value / finalTotal) * 100 : 0;
                    return (
                      <tr key={field.key} className="odd:bg-olvblue/80 dark:odd:bg-bg-dark-tertiary even:bg-olvblue dark:even:bg-bg-dark-secondary">
                        <td className="border p-1 text-white dark:text-ourovelho">{field.label}</td>
                        <td className="border p-1 text-right text-white dark:text-ourovelho">R$ {value.toLocaleString('pt-BR')}</td>
                        <td className="border p-1 text-right text-white dark:text-ourovelho">{convertToForeign(value)}</td>
                        <td className="border p-1 text-xs text-white dark:text-ourovelho">{perc.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                  {/* Especialistas On-Demand: múltiplos SLAs */}
                  {config.slug === 'comex-on-demand' && ['start','pro','critical'].map(sla => {
                    const hours = values['hours'] && values['service_level'] === sla ? values['hours'] : 0;
                    if (!hours) return null;
                    const rates: Record<string, number> = { start: 390, pro: 490, critical: 650 };
                    const value = rates[sla] * hours;
                    const perc = finalTotal ? (value / finalTotal) * 100 : 0;
                    return (
                      <tr key={sla} className="odd:bg-olvblue/80 dark:odd:bg-bg-dark-tertiary even:bg-olvblue dark:even:bg-bg-dark-secondary">
                        <td className="border p-1 text-white dark:text-ourovelho">{sla.charAt(0).toUpperCase() + sla.slice(1)} (Especialista)</td>
                        <td className="border p-1 text-right text-white dark:text-ourovelho">R$ {value.toLocaleString('pt-BR')}</td>
                        <td className="border p-1 text-right text-white dark:text-ourovelho">{convertToForeign(value)}</td>
                        <td className="border p-1 text-xs text-white dark:text-ourovelho">{perc.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                  {/* Serviços adicionais */}
                  {extras.map((l) => {
                    const subtotal = l.qty * l.unit * (1 - l.discount / 100);
                    const perc = finalTotal ? (subtotal / finalTotal) * 100 : 0;
                    return (
                      <tr key={l.id} className="odd:bg-olvblue/80 dark:odd:bg-bg-dark-tertiary even:bg-olvblue dark:even:bg-bg-dark-secondary">
                        <td className="border p-1 text-white dark:text-ourovelho">{l.description || 'Outro custo'}</td>
                        <td className="border p-1 text-right text-white dark:text-ourovelho">R$ {(subtotal).toLocaleString('pt-BR')}</td>
                        <td className="border p-1 text-right text-white dark:text-ourovelho">{convertToForeign(subtotal)}</td>
                        <td className="border p-1 text-xs text-white dark:text-ourovelho">{perc.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                  {/* Impostos habilitados */}
                  {taxRates.filter(tax => tax.enabled).map((tax, idx) => {
                    const taxAmount = subtotalAfterDiscount * (tax.rate / 100);
                    const perc = finalTotal ? (taxAmount / finalTotal) * 100 : 0;
                    return (
                      <tr key={tax.type} className="odd:bg-olvblue/80 dark:odd:bg-bg-dark-tertiary even:bg-olvblue dark:even:bg-bg-dark-secondary">
                        <td className="border p-1 text-yellow-800 dark:text-ourovelho">{tax.type} ({tax.rate}%)</td>
                        <td className="border p-1 text-right text-yellow-800 dark:text-ourovelho">R$ {taxAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="border p-1 text-right text-yellow-800 dark:text-ourovelho">{convertToForeign(taxAmount)}</td>
                        <td className="border p-1 text-xs text-yellow-800 dark:text-ourovelho">{perc.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-olvblue/80 dark:bg-bg-dark-tertiary p-4 rounded-lg mb-4">
              <div className="text-sm mb-1 flex justify-between text-white dark:text-ourovelho">
                <span>Subtotal</span>
                <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
              </div>
              {currency !== 'BRL' && (
                <div className="text-sm mb-1 flex justify-between text-white dark:text-ourovelho">
                  <span>Subtotal ({currency})</span>
                  <span>{convertToForeign(subtotal)}</span>
                </div>
              )}
              <div className="text-sm mb-1 flex justify-between text-white dark:text-ourovelho">
                <span>Descontos</span>
                <span>- R$ {discountAmount.toLocaleString('pt-BR')}</span>
              </div>
              {currency !== 'BRL' && (
                <div className="text-sm mb-1 flex justify-between text-white dark:text-ourovelho">
                  <span>Descontos ({currency})</span>
                  <span>- {convertToForeign(discountAmount)}</span>
                </div>
              )}
              <div className="text-sm mb-1 flex justify-between text-yellow-800 dark:text-ourovelho font-semibold">
                <span>Impostos</span>
                <span>+ R$ {taxesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              {currency !== 'BRL' && (
                <div className="text-sm mb-1 flex justify-between text-yellow-800 dark:text-ourovelho">
                  <span>Impostos ({currency})</span>
                  <span>+ {convertToForeign(taxesTotal)}</span>
                </div>
              )}
              <div className="font-bold text-lg flex justify-between border-t pt-2 text-white dark:text-ourovelho">
                <span>Total Final</span>
                <span>{currency === 'BRL' ? 'R$' : currency + ' '}{convertedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <button type="button" className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors text-white py-2 rounded font-bold">Visualizar PDF</button>
          </section>
        </div>
      </div>
      {/* Linha 2: Serviços Adicionais (paisagem, card horizontal largura total) */}
      <section className="w-full bg-olvblue dark:bg-bg-dark-secondary rounded-xl border border-ourovelho dark:border-ourovelho shadow p-4 sm:p-6 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white dark:text-ourovelho flex items-center gap-2">
            2. Serviços Adicionais
            <Tooltip text="Adicione custos extras, customizações ou serviços complementares à proposta.">
              <svg className="w-4 h-4 text-white dark:text-ourovelho" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
            </Tooltip>
          </h2>
          <button type="button" onClick={addExtra} className="ml-4 px-3 py-1 rounded bg-accent-light dark:bg-accent-dark text-white font-bold text-lg hover:bg-accent-light-hover dark:hover:bg-accent-dark-hover border border-ourovelho dark:border-ourovelho shadow transition-colors" title="Adicionar serviço adicional">+ Adicionar</button>
        </div>
        <table className="w-full text-sm border border-ourovelho dark:border-ourovelho rounded overflow-hidden">
          <thead className="bg-olvblue/60 dark:bg-bg-dark-tertiary">
            <tr>
              <th className="border p-2 text-white dark:text-ourovelho">Descrição</th>
              <th className="border p-2 text-white dark:text-ourovelho">Qtd</th>
              <th className="border p-2 text-white dark:text-ourovelho">Unit (BRL)</th>
              <th className="border p-2 text-white dark:text-ourovelho">Unit ({currency})</th>
              <th className="border p-2 text-white dark:text-ourovelho">Desc. %</th>
              <th className="border p-2 text-white dark:text-ourovelho">Subtotal (BRL)</th>
              <th className="border p-2 text-white dark:text-ourovelho">Subtotal ({currency})</th>
              <th className="border p-2"></th>
            </tr>
          </thead>
          <tbody>
            {extras.map((l) => {
              const subtotal = l.qty * l.unit * (1 - l.discount / 100);
              return (
                <tr key={l.id} className="odd:bg-olvblue/80 dark:odd:bg-bg-dark-tertiary even:bg-olvblue dark:even:bg-bg-dark-secondary">
                  <td className="border p-1"><input type="text" className="w-full px-1 bg-transparent text-white dark:text-ourovelho" value={l.description} onChange={(e) => updateExtra(l.id, 'description', e.target.value)} /></td>
                  <td className="border p-1"><input type="number" className="w-full px-1 bg-transparent text-white dark:text-ourovelho" value={l.qty === 0 ? '' : l.qty} min={0} onChange={(e) => updateExtra(l.id, 'qty', Number(e.target.value))} /></td>
                  <td className="border p-1"><input type="number" className="w-full px-1 bg-transparent text-white dark:text-ourovelho" value={l.unit === 0 ? '' : l.unit} min={0} step={0.01} onChange={(e) => updateExtra(l.id, 'unit', Number(e.target.value))} /></td>
                  <td className="border p-1 text-right">{convertToForeign(l.unit)}</td>
                  <td className="border p-1"><input type="number" className="w-full px-1 bg-transparent text-white dark:text-ourovelho" value={l.discount === 0 ? '' : l.discount} min={0} max={100} onChange={(e) => updateExtra(l.id, 'discount', Number(e.target.value))} /></td>
                  <td className="border p-1 text-right">{isNaN(subtotal) ? '-' : `R$ ${subtotal.toLocaleString('pt-BR')}`}</td>
                  <td className="border p-1 text-right">{convertToForeign(subtotal)}</td>
                  <td className="border p-1 text-center"><button type="button" onClick={() => removeExtra(l.id)} className="text-xs text-red-600">✕</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      {/* Linha 3: Impostos (vertical, à esquerda) */}
      <section className="w-full bg-olvblue dark:bg-bg-dark-secondary rounded-xl border border-ourovelho dark:border-ourovelho shadow p-4 sm:p-6 flex flex-col lg:w-1/2">
        <h2 className="text-lg font-bold text-white dark:text-ourovelho mb-4 flex items-center gap-2">
          3. Impostos
          <Tooltip text="Selecione e edite as taxas de impostos aplicáveis à proposta. Os valores são calculados automaticamente.">
            <svg className="w-4 h-4 text-white dark:text-ourovelho" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
          </Tooltip>
        </h2>
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-white dark:text-ourovelho">Impostos e Taxas</span>
          <button type="button" onClick={addCustomTax} className="text-xs bg-accent-light dark:bg-accent-dark text-white px-2 py-1 rounded hover:bg-accent-light-hover dark:hover:bg-accent-dark-hover">+ Custom</button>
        </div>
        <div className="space-y-2">
          {taxRates.map((tax, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-olvblue/80 dark:bg-bg-dark-tertiary rounded border border-ourovelho dark:border-ourovelho">
              <input type="checkbox" checked={tax.enabled} onChange={(e) => updateTaxRate(tax.type, 'enabled', e.target.checked)} className="accent-accent-dark" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white dark:text-ourovelho">{tax.type}</div>
                <div className="text-xs text-white dark:text-ourovelho opacity-75">{tax.description}</div>
              </div>
              <input type="number" value={tax.rate} onChange={(e) => updateTaxRate(tax.type, 'rate', parseFloat(e.target.value) || 0)} className="w-20 px-2 py-1 text-sm border rounded bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho" min={0} max={100} step={0.01} disabled={!tax.enabled} />
              <span className="text-xs text-white dark:text-ourovelho">%</span>
            </div>
          ))}
        </div>
        <div className="mt-3 p-2 bg-accent-light/20 dark:bg-accent-dark/20 text-white dark:text-ourovelho rounded text-sm font-semibold flex justify-between">
          <span>Total Impostos:</span>
          <span>R$ {taxesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </section>
      {/* Linha 4: Tabela de Tarifas (paisagem, card horizontal largura total) */}
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <h2 className="text-lg font-bold text-white dark:text-ourovelho flex items-center gap-2">
          5. Tabela de Tarifas e Condições
          <Tooltip text="Confira todos os itens, valores e condições detalhadas do serviço.">
            <svg className="w-4 h-4 text-white dark:text-ourovelho" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
          </Tooltip>
        </h2>
        {/* Bloco de câmbio/ícones ao lado do título */}
        <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
          <label className="text-white dark:text-ourovelho text-sm font-semibold">Moeda:</label>
          <select
            className="border border-ourovelho dark:border-ourovelho rounded px-2 py-1 bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
            value={currency}
            onChange={handleCurrencyChange}
          >
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <input
            type="number"
            inputMode="numeric"
            className="w-24 border border-ourovelho dark:border-ourovelho rounded px-2 py-1 bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
            placeholder="Cotação"
            value={customRate ?? ''}
            onChange={e => handleRateChange(e.target.value ? Number(e.target.value) : 0)}
            min={0}
            step={0.0001}
            disabled={currency === 'BRL'}
          />
          {loadingRate && <span className="ml-2 text-xs text-white">Buscando...</span>}
          <button onClick={exportToPDF} className="ml-4 text-ourovelho hover:text-accent-light" title="Visualizar/Imprimir PDF"><FaFilePdf size={20} /></button>
          <button onClick={exportToExcel} className="ml-2 text-ourovelho hover:text-accent-light" title="Exportar Excel"><FaFileExcel size={20} /></button>
        </div>
      </div>
      <section className="w-full bg-olvblue dark:bg-bg-dark-secondary rounded-xl border border-ourovelho dark:border-ourovelho shadow p-4 sm:p-6 flex flex-col">
        {(() => {
          const tabelaTarifas = getTabelaTarifas(config.slug);
          if (tabelaTarifas) {
            return <TabelaTarifasComponent tabela={tabelaTarifas} currency={currency} customRate={customRate} />;
          }
          return (
            <div className="p-4 text-white dark:text-ourovelho">Tabela de tarifas e condições: consulte a ficha técnica do serviço para detalhes completos.</div>
          );
        })()}
      </section>
      {/* Linha 5: Observações Gerais (paisagem, card horizontal largura total) */}
      <section className="w-full bg-olvblue/80 dark:bg-bg-dark-tertiary rounded-xl border border-ourovelho dark:border-ourovelho shadow p-4 sm:p-6 flex flex-col">
        <h2 className="text-lg font-bold text-white dark:text-ourovelho mb-4 flex items-center gap-2">
          6. Observações Gerais
          <Tooltip text="Informações complementares, condições comerciais e observações importantes.">
            <svg className="w-4 h-4 text-white dark:text-ourovelho" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
          </Tooltip>
        </h2>
        <div className="text-sm text-white dark:text-ourovelho">
          Consulte a ficha técnica do serviço para detalhes completos, condições comerciais, prazos e garantias. Valores sujeitos a reajuste conforme mercado e inflação.
        </div>
      </section>
    </div>
  );
} 