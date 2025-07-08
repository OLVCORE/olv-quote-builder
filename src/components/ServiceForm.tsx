"use client";
import React, { useState, useMemo } from 'react';
import { ServiceConfig, InputField } from '@/lib/services';
import { useAdmin } from './AdminContext';
import { useRates } from '@/lib/useRates';
import { FaFilePdf, FaFileExcel, FaSync, FaCalculator, FaReceipt, FaEdit, FaCog, FaComments, FaChartBar, FaPlus, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { addSyncRecordToHistory } from './CRMSyncHistory';
import TabelaTarifas from './TabelaTarifas';
import { getTabelaTarifas } from '@/lib/tarifas';
import ServicosAdicionaisTable from './ServicosAdicionaisTable';
import Collapsible from './UI/Collapsible';
import { calculateTaxes } from '@/lib/utils/calculations';
import { convertValue, formatCurrency } from '@/lib/utils/currency';
import { Currency, ExchangeRates } from '@/lib/types/simulator';

interface Props {
  config: ServiceConfig;
  currency: string;
  customRate: string;
  expandAll?: boolean;
}

export default function ServiceForm({ config, currency, customRate, expandAll }: Props) {
  const [values, setValues] = useState<Record<string, any>>(
    Object.fromEntries(config.inputs.map((i) => [i.key, i.default]))
  );
  const { admin, enableAdmin } = useAdmin();

  function handleChange(field: InputField, val: any) {
    setValues((prev) => ({ ...prev, [field.key]: val }));
  }

  // Cálculo principal do serviço
  const baseResult = useMemo(() => config.calculate(values), [values, config]);

  // Câmbio
  const { rates } = useRates('BRL');
  const defaultRate = currency === 'BRL' ? 1 : rates[currency] || 1;
  const conversionRate = customRate ? Number(customRate) : defaultRate;

  function convertToForeign(val: number) {
    if (currency === 'BRL') return '-';
    if (!conversionRate || conversionRate === 0) return '-';
    return (val / conversionRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }

  // Exportação PDF
  const exportToPDF = () => {
    window.print();
  };

  // Exportação Excel
  const exportToExcel = () => {
    alert('Exportação XLSX de toda a proposta ainda não implementada.');
  };

  // Sincronização CRM
  const syncToCRM = async () => {
    const crmConfig = localStorage.getItem('crm_config');
    if (!crmConfig) {
      alert('Configure o CRM primeiro nas configurações.');
      return;
    }
    try {
      const configCRM = JSON.parse(crmConfig);
      const { CRMIntegration } = await import('@/lib/crmIntegration');
      const crm = new CRMIntegration(configCRM);
      const contact = {
        email: values.email || 'cliente@exemplo.com',
        firstName: values.nome?.split(' ')[0] || 'Cliente',
        lastName: values.nome?.split(' ').slice(1).join(' ') || 'Exemplo',
        company: values.empresa || 'Empresa Exemplo',
        phone: values.telefone || '',
      };
      const deal = {
        title: `Proposta - ${config.name}`,
        amount: baseResult.total,
        currency: currency,
        stage: 'proposal',
        contactId: '',
        description: `Proposta gerada para ${values.empresa || 'cliente'} - ${config.description}`,
        closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        probability: 50,
      };
      addSyncRecordToHistory({
        crmType: configCRM.type,
        contactName: `${contact.firstName} ${contact.lastName}`,
        dealTitle: deal.title,
        amount: deal.amount,
        currency: deal.currency,
        status: 'pending'
      });
      const result = await crm.syncQuoteToCRM(contact, deal);
      addSyncRecordToHistory({
        crmType: configCRM.type,
        contactName: `${contact.firstName} ${contact.lastName}`,
        dealTitle: deal.title,
        amount: deal.amount,
        currency: deal.currency,
        status: 'success',
        contactId: result.contactId,
        dealId: result.dealId
      });
      alert(`Sincronizado com CRM! Contact ID: ${result.contactId}, Deal ID: ${result.dealId}`);
    } catch (error) {
      console.error('CRM sync error:', error);
      const configCRM = JSON.parse(crmConfig);
      const contact = {
        email: values.email || 'cliente@exemplo.com',
        firstName: values.nome?.split(' ')[0] || 'Cliente',
        lastName: values.nome?.split(' ').slice(1).join(' ') || 'Exemplo',
        company: values.empresa || 'Empresa Exemplo',
        phone: values.telefone || '',
      };
      addSyncRecordToHistory({
        crmType: configCRM.type,
        contactName: `${contact.firstName} ${contact.lastName}`,
        dealTitle: `Proposta - ${config.name}`,
        amount: baseResult.total,
        currency: currency,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      alert(`Erro ao sincronizar com CRM: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Renderização dos campos dinâmicos com visual premium
  const renderInputs = () => {
    // Se for Serviços Adicionais, renderiza tabela dinâmica
    if (config.slug === 'servicos-adicionais') {
      return <ServicosAdicionaisTable values={values} setValues={setValues} />;
    }
    // Caso contrário, renderiza inputs padrão com visual premium
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {config.inputs.map((input, index) => (
          <div key={input.key} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative space-y-3">
              <label className="block text-sm font-bold text-olvblue dark:text-ourovelho flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-ourovelho to-ourovelho-dark rounded-full"></div>
                {input.label}
              </label>
              <input
                type={input.type}
                value={values[input.key] || ''}
                onChange={(e) => handleChange(input, e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 text-olvblue dark:text-ourovelho placeholder:text-slate-400 dark:placeholder:text-ourovelho/60 focus:ring-2 focus:ring-ourovelho focus:border-ourovelho shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                placeholder={input.label}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Breakdown detalhado (visual premium)
  const renderBreakdown = () => {
    const breakdown = baseResult.breakdown || {};
    if (!breakdown || Object.keys(breakdown).length === 0) return null;
    return (
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700/30 dark:to-slate-600/30 rounded-2xl blur-xl"></div>
        <div className="relative bg-white/95 dark:bg-slate-800/95 border-2 border-green-200 dark:border-green-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <FaChartBar className="text-2xl text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">Breakdown Detalhado</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50">
                  <th className="p-4 text-left font-bold text-green-800 dark:text-green-300">Item</th>
                  <th className="p-4 text-right font-bold text-green-800 dark:text-green-300">Valor (BRL)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(breakdown).map(([key, value], index) => (
                  <tr key={key} className={`${index % 2 === 0 ? 'bg-white/50' : 'bg-green-50/50'} dark:${index % 2 === 0 ? 'bg-slate-700/50' : 'bg-green-900/20'} hover:bg-green-100/50 dark:hover:bg-green-800/20 transition-colors duration-200`}>
                    <td className="p-4 font-semibold capitalize text-slate-700 dark:text-slate-200">{key.replace(/_/g, ' ')}</td>
                    <td className="p-4 text-right font-bold text-green-600 dark:text-green-400">R$ {Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Tabela de tarifas (quando aplicável) com visual premium
  const tabela = getTabelaTarifas(config.slug);
  const renderTabelaTarifas = () => (
    tabela && (
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/30 dark:to-slate-600/30 rounded-2xl blur-xl"></div>
        <div className="relative bg-white/95 dark:bg-slate-800/95 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
              <FaReceipt className="text-2xl text-white" />
            </div>
            <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400">Tabela de Tarifas</h3>
          </div>
          <TabelaTarifas tabela={tabela} currency={currency} customRate={customRate} />
        </div>
      </div>
    )
  );

  // Seção Serviços Principais com visual premium
  const renderServicosPrincipais = () => (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700/30 dark:to-slate-600/30 rounded-2xl blur-xl"></div>
      <div className="relative bg-white/95 dark:bg-slate-800/95 border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <FaCalculator className="text-2xl text-white" />
          </div>
          <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400">Serviços Principais</h3>
        </div>
        {renderInputs()}
      </div>
    </div>
  );

  // Seção Impostos (dinâmica) com visual premium
  const [impostos, setImpostos] = useState([
    { nome: 'ISS', valor: '' },
    { nome: 'IR', valor: '' },
  ]);
  const adicionarImposto = () => setImpostos(imps => [...imps, { nome: '', valor: '' }]);
  const removerImposto = (idx: number) => setImpostos(imps => imps.filter((_, i) => i !== idx));
  const renderImpostos = () => (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-700/30 dark:to-slate-600/30 rounded-2xl blur-xl"></div>
      <div className="relative bg-white/95 dark:bg-slate-800/95 border-2 border-orange-200 dark:border-orange-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
            <FaReceipt className="text-2xl text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              Impostos
            </h3>
            <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
              Impostos são calculados em cascata conforme legislação brasileira
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50">
                <th className="p-3 text-left font-bold text-orange-800 dark:text-orange-300">Imposto</th>
                <th className="p-3 text-left font-bold text-orange-800 dark:text-orange-300">Percentual (%)</th>
                <th className="p-3 text-center font-bold text-orange-800 dark:text-orange-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {impostos.map((imp, idx) => (
                <tr key={idx} className="hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-colors duration-200">
                  <td className="p-3">
                    <input
                      type="text"
                      value={imp.nome}
                      onChange={e => setImpostos(imps => imps.map((i, j) => j === idx ? { ...i, nome: e.target.value } : i))}
                      className="w-full px-3 py-2 rounded-lg border-2 border-orange-200 dark:border-orange-600 bg-white/90 dark:bg-slate-700/90 text-orange-700 dark:text-orange-300 placeholder:text-orange-400 dark:placeholder:text-orange-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-inner"
                      placeholder="Nome do imposto"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={imp.valor}
                      onChange={e => setImpostos(imps => imps.map((i, j) => j === idx ? { ...i, valor: e.target.value } : i))}
                      className="w-32 px-3 py-2 rounded-lg border-2 border-orange-200 dark:border-orange-600 bg-white/90 dark:bg-slate-700/90 text-orange-700 dark:text-orange-300 placeholder:text-orange-400 dark:placeholder:text-orange-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-inner"
                      placeholder="0,00"
                      min={0}
                      max={100}
                      step={0.01}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => removerImposto(idx)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remover imposto"
                      disabled={impostos.length === 1}
                    >
                      <FaTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <button
          type="button"
          onClick={adicionarImposto}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          title="Adicionar novo imposto"
        >
          <FaPlus size={16} />
          Adicionar Imposto
        </button>
      </div>
    </div>
  );

  // Seção Observações Gerais com visual premium
  const [observacoes, setObservacoes] = useState('');
  const renderObservacoes = () => (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-slate-700/30 dark:to-slate-600/30 rounded-2xl blur-xl"></div>
      <div className="relative bg-white/95 dark:bg-slate-800/95 border-2 border-teal-200 dark:border-teal-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl">
            <FaComments className="text-2xl text-white" />
          </div>
          <h3 className="text-2xl font-bold text-teal-700 dark:text-teal-400">Observações Gerais</h3>
        </div>
        <textarea
          value={observacoes}
          onChange={e => setObservacoes(e.target.value)}
          className="w-full min-h-[120px] px-4 py-3 rounded-xl border-2 border-teal-200 dark:border-teal-600 bg-white/90 dark:bg-slate-700/90 text-teal-700 dark:text-teal-300 placeholder:text-teal-400 dark:placeholder:text-teal-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-inner resize-none"
          placeholder="Digite observações, condições ou notas gerais da proposta..."
        />
      </div>
    </div>
  );

  // Seção Resultados detalhados com visual premium
  const renderResultados = () => {
    // 1. Serviços principais e adicionais (breakdown)
    const breakdown = baseResult.breakdown || {};
    const linhasServicos = Object.entries(breakdown)
      .filter(([k, v]) => Number(v) > 0)
      .map(([k, v]) => ({
        tipo: 'servico',
        descricao: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        valor: Number(v)
      }));

    // 2. Serviços adicionais customizados (linhasAdicionais)
    const linhasAdicionais = (values.linhasAdicionais || [])
      .filter((linha: any) => linha && linha.descricao && Number(linha.valor) > 0)
      .map((linha: any) => ({
        tipo: 'adicional',
        descricao: linha.descricao,
        valor: Number(linha.valor)
      }));

    // 3. Soma base para impostos
    const subtotalServicos = linhasServicos.reduce((sum: number, l: any) => sum + l.valor, 0);
    const subtotalAdicionais = linhasAdicionais.reduce((sum: number, l: any) => sum + l.valor, 0);
    const subtotalBase = subtotalServicos + subtotalAdicionais;
    const currencyTyped = currency as Currency;
    const impostosSelecionados = impostos.filter(imp => imp.nome && imp.valor && Number(imp.valor) > 0).map(imp => ({
      name: imp.nome,
      code: imp.nome.toUpperCase().replace(/\s/g, '_'),
      rate: Number(imp.valor),
      enabled: true
    }));
    const impostosCalculados = calculateTaxes(subtotalBase, 'SP', impostosSelecionados); // UF pode ser dinâmico
    const exchangeRates: ExchangeRates = {
      BRL: 1,
      USD: rates.USD || 1,
      EUR: rates.EUR || 1,
      CNY: rates.CNY || 1,
      [currencyTyped]: conversionRate || rates[currencyTyped] || 1
    };
    const linhasImpostos = impostosCalculados.taxes.map(tax => ({
      tipo: 'imposto',
      descricao: tax.code,
      valor: (tax as any)['value'] ?? 0,
      percentual: tax.rate
    }));
    const subtotalImpostos = linhasImpostos.reduce((sum: number, l: any) => sum + l.valor, 0);
    const totalGeral = subtotalBase + subtotalImpostos;

    // 4. Conversão de moeda
    function formatCurrencyValue(val: number) {
      if (currencyTyped === 'BRL') return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      const converted = convertValue(val, 'BRL', currencyTyped, exchangeRates);
      return formatCurrency(converted, currencyTyped);
    }

    return (
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700/30 dark:to-slate-600/30 rounded-2xl blur-xl"></div>
        <div className="relative bg-white/95 dark:bg-slate-800/95 border-2 border-indigo-200 dark:border-indigo-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
              <FaChartBar className="text-2xl text-white" />
            </div>
            <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">Resultado Detalhado</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50">
                  <th className="p-4 text-left font-bold text-indigo-800 dark:text-indigo-300">Item</th>
                  <th className="p-4 text-right font-bold text-indigo-800 dark:text-indigo-300">Valor (BRL)</th>
                  <th className="p-4 text-right font-bold text-indigo-800 dark:text-indigo-300">{currency !== 'BRL' ? `Valor (${currency})` : ''}</th>
                  <th className="p-4 text-right font-bold text-indigo-800 dark:text-indigo-300">% sobre total</th>
                </tr>
              </thead>
              <tbody>
                {linhasServicos.map((linha: any, idx: number) => (
                  <tr key={idx} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors duration-200">
                    <td className="p-4 font-semibold capitalize text-slate-700 dark:text-slate-200">{linha.descricao}</td>
                    <td className="p-4 text-right font-bold text-indigo-600 dark:text-indigo-400">R$ {linha.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-right font-bold text-indigo-600 dark:text-indigo-400">{currency !== 'BRL' ? formatCurrencyValue(linha.valor) : ''}</td>
                    <td className="p-4 text-right text-slate-600 dark:text-slate-300">{((linha.valor / totalGeral) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%</td>
                  </tr>
                ))}
                <tr className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 font-bold">
                  <td className="p-4 text-right text-green-800 dark:text-green-300" colSpan={3}>
                    Subtotal Serviços
                    <FaInfoCircle className="inline ml-2 text-green-600 dark:text-green-400" title="Soma dos serviços principais." />
                  </td>
                  <td className="p-4 text-right text-green-800 dark:text-green-300">{formatCurrencyValue(subtotalServicos)}</td>
                </tr>
                {linhasAdicionais.map((linha: any, idx: number) => (
                  <tr key={idx} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors duration-200">
                    <td className="p-4 font-semibold capitalize text-slate-700 dark:text-slate-200">{linha.descricao}</td>
                    <td className="p-4 text-right font-bold text-indigo-600 dark:text-indigo-400">R$ {linha.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-right font-bold text-indigo-600 dark:text-indigo-400">{currency !== 'BRL' ? formatCurrencyValue(linha.valor) : ''}</td>
                    <td className="p-4 text-right text-slate-600 dark:text-slate-300">{((linha.valor / totalGeral) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%</td>
                  </tr>
                ))}
                <tr className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 font-bold">
                  <td className="p-4 text-right text-blue-800 dark:text-blue-300" colSpan={3}>
                    Subtotal Adicionais
                    <FaInfoCircle className="inline ml-2 text-blue-600 dark:text-blue-400" title="Soma dos serviços adicionais." />
                  </td>
                  <td className="p-4 text-right text-blue-800 dark:text-blue-300">{formatCurrencyValue(subtotalAdicionais)}</td>
                </tr>
                {linhasImpostos.map((linha: any, idx: number) => (
                  <tr key={idx} className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-800/30 dark:hover:to-red-800/30 transition-colors duration-200">
                    <td className="p-4 font-semibold capitalize text-orange-700 dark:text-orange-300">
                      {linha.descricao}
                      <FaInfoCircle className="inline ml-2 text-orange-600 dark:text-orange-400" title="Imposto calculado em cascata sobre o subtotal anterior." />
                    </td>
                    <td className="p-4 text-right font-bold text-orange-600 dark:text-orange-400">R$ {linha.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-right font-bold text-orange-600 dark:text-orange-400">{currency !== 'BRL' ? formatCurrencyValue(linha.valor) : ''}</td>
                    <td className="p-4 text-right text-orange-600 dark:text-orange-400">{((linha.valor / totalGeral) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%</td>
                  </tr>
                ))}
                <tr className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 font-bold">
                  <td className="p-4 text-right text-orange-800 dark:text-orange-300" colSpan={3}>
                    Subtotal Impostos
                    <FaInfoCircle className="inline ml-2 text-orange-600 dark:text-orange-400" title="Soma dos impostos em cascata." />
                  </td>
                  <td className="p-4 text-right text-orange-800 dark:text-orange-300">{formatCurrencyValue(subtotalImpostos)}</td>
                </tr>
                <tr className="bg-gradient-to-r from-ourovelho/20 to-ourovelho-dark/20 dark:from-ourovelho/30 dark:to-ourovelho-dark/30 font-extrabold text-lg">
                  <td className="p-4 text-right text-ourovelho-dark dark:text-ourovelho" colSpan={3}>Total Geral</td>
                  <td className="p-4 text-right text-ourovelho-dark dark:text-ourovelho">{formatCurrencyValue(totalGeral)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Botões de ação avançados com visual premium
  const renderAcoesAvancadas = () => (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700/30 dark:to-slate-600/30 rounded-2xl blur-xl"></div>
      <div className="relative bg-white/95 dark:bg-slate-800/95 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-slate-500 to-gray-600 rounded-xl">
            <FaCog className="text-2xl text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300">Ações Avançadas</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={exportToPDF}
            className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FaFilePdf size={20} />
            Exportar PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FaFileExcel size={20} />
            Exportar Excel
          </button>
          <button
            onClick={syncToCRM}
            className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FaSync size={20} />
            Sincronizar CRM
          </button>
        </div>
      </div>
    </div>
  );

  // Botões de ação básicos com visual premium
  const renderAcoes = () => (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-ourovelho/20 to-ourovelho-dark/20 dark:from-ourovelho/30 dark:to-ourovelho-dark/30 rounded-2xl blur-xl"></div>
      <div className="relative bg-white/95 dark:bg-slate-800/95 border-2 border-ourovelho/30 dark:border-ourovelho/50 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-ourovelho to-ourovelho-dark rounded-xl">
            <FaCalculator className="text-2xl text-white" />
          </div>
          <h3 className="text-2xl font-bold text-ourovelho-dark dark:text-ourovelho">Ações Rápidas</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={exportToPDF}
            className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FaFilePdf size={20} />
            Visualizar PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FaFileExcel size={20} />
            Exportar Excel
          </button>
          <button
            onClick={syncToCRM}
            className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FaSync size={20} />
            Sincronizar CRM
          </button>
        </div>
      </div>
    </div>
  );

  // Seção Serviços Adicionais com visual premium
  const renderServicosAdicionais = () => (
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-slate-700/30 dark:to-slate-600/30 rounded-2xl blur-xl"></div>
      <div className="relative bg-white/95 dark:bg-slate-800/95 border-2 border-pink-200 dark:border-pink-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl">
            <FaPlus className="text-2xl text-white" />
          </div>
          <h3 className="text-2xl font-bold text-pink-700 dark:text-pink-400">Serviços Adicionais</h3>
        </div>
        <ServicosAdicionaisTable values={values} setValues={setValues} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <Collapsible 
        title="1. Serviços Principais" 
        expanded={expandAll} 
        icon={<FaCalculator className="text-white" />}
        color="purple"
      >
        {renderServicosPrincipais()}
      </Collapsible>
      
      <Collapsible 
        title="2. Tabela de Tarifas" 
        expanded={expandAll} 
        icon={<FaReceipt className="text-white" />}
        color="blue"
      >
        {renderTabelaTarifas()}
      </Collapsible>
      
      <Collapsible 
        title="3. Breakdown Detalhado" 
        expanded={expandAll} 
        icon={<FaChartBar className="text-white" />}
        color="green"
      >
        {renderBreakdown()}
      </Collapsible>
      
      <Collapsible 
        title="4. Serviços Adicionais" 
        expanded={expandAll} 
        icon={<FaPlus className="text-white" />}
        color="pink"
      >
        {renderServicosAdicionais()}
      </Collapsible>
      
      <Collapsible 
        title="5. Impostos" 
        expanded={expandAll} 
        icon={<FaReceipt className="text-white" />}
        color="orange"
      >
        {renderImpostos()}
      </Collapsible>
      
      <Collapsible 
        title="6. Observações Gerais" 
        expanded={expandAll} 
        icon={<FaComments className="text-white" />}
        color="teal"
      >
        {renderObservacoes()}
      </Collapsible>
      
      <Collapsible 
        title="7. Resultado Detalhado" 
        expanded={expandAll} 
        icon={<FaChartBar className="text-white" />}
        color="indigo"
      >
        {renderResultados()}
      </Collapsible>
      
      {admin ? renderAcoesAvancadas() : renderAcoes()}
    </div>
  );
}