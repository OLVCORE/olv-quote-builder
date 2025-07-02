"use client";
import React, { useState, useMemo } from 'react';
import { ServiceConfig, InputField } from '@/lib/services';
import { useAdmin } from './AdminContext';
import { useRates } from '@/lib/useRates';
import { FaFilePdf, FaFileExcel, FaSync } from 'react-icons/fa';
import { addSyncRecordToHistory } from './CRMSyncHistory';
import TabelaTarifas from './TabelaTarifas';
import { getTabelaTarifas } from '@/lib/tarifas';

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

  // Renderização dos campos dinâmicos
  const renderInputs = () => (
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
  );

  // Breakdown detalhado
  const renderBreakdown = () => (
    <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-4 mb-6">
      <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho mb-4">Breakdown Detalhado</h3>
      <pre className="text-xs text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 rounded p-2 overflow-x-auto">
        {JSON.stringify(baseResult.breakdown, null, 2)}
      </pre>
    </div>
  );

  // Tabela de tarifas (quando aplicável)
  const tabela = getTabelaTarifas(config.slug);
  const renderTabelaTarifas = () => (
    tabela && <div className="mb-6">
      <TabelaTarifas tabela={tabela} currency={currency} customRate={customRate} />
    </div>
  );

  // Resultado e totais
  const renderTotais = () => (
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
  );

  // Botões de ação
  const renderAcoes = () => (
    <div className="flex flex-col sm:flex-row gap-2">
      <button onClick={exportToPDF} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold flex items-center justify-center gap-2">
        <FaFilePdf /> Exportar PDF
      </button>
      <button onClick={exportToExcel} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold flex items-center justify-center gap-2">
        <FaFileExcel /> Exportar Excel
      </button>
      <button onClick={syncToCRM} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-bold flex items-center justify-center gap-2">
        <FaSync /> Sincronizar CRM
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 md:px-6">
      <div className="bg-olvblue dark:bg-bg-dark-secondary rounded-xl border border-ourovelho p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white dark:text-ourovelho mb-4">{config.name}</h2>
        <p className="text-white/80 dark:text-ourovelho/80 mb-6">{config.description}</p>
        {renderInputs()}
        {renderBreakdown()}
        {renderTabelaTarifas()}
        {renderTotais()}
        {renderAcoes()}
      </div>
    </div>
  );
}