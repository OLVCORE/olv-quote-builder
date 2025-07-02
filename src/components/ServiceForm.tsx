"use client";
import React, { useState, useMemo } from 'react';
import { ServiceConfig, InputField } from '@/lib/services';
import { useAdmin } from './AdminContext';
import { useRates } from '@/lib/useRates';
import { FaFilePdf, FaFileExcel, FaSync } from 'react-icons/fa';
import { addSyncRecordToHistory } from './CRMSyncHistory';
import TabelaTarifas from './TabelaTarifas';
import { getTabelaTarifas } from '@/lib/tarifas';
import ServicosAdicionaisTable from './ServicosAdicionaisTable';
import Collapsible from './UI/Collapsible';

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
  const renderInputs = () => {
    // Se for Serviços Adicionais, renderiza tabela dinâmica
    if (config.slug === 'servicos-adicionais') {
      return <ServicosAdicionaisTable values={values} setValues={setValues} />;
    }
    // Caso contrário, renderiza inputs padrão
    return (
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
  };

  // Breakdown detalhado (visual premium)
  const renderBreakdown = () => {
    const breakdown = baseResult.breakdown || {};
    if (!breakdown || Object.keys(breakdown).length === 0) return null;
    return (
      <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho mb-4">Breakdown Detalhado</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-ourovelho/20">
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-right">Valor (BRL)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(breakdown).map(([key, value]) => (
              <tr key={key} className="even:bg-olvblue/80 dark:even:bg-bg-dark-tertiary">
                <td className="p-2 font-medium capitalize">{key.replace(/_/g, ' ')}</td>
                <td className="p-2 text-right font-bold text-olvblue dark:text-ourovelho">R$ {Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Tabela de tarifas (quando aplicável)
  const tabela = getTabelaTarifas(config.slug);
  const renderTabelaTarifas = () => (
    tabela && <div className="mb-6">
      <TabelaTarifas tabela={tabela} currency={currency} customRate={customRate} />
    </div>
  );

  // Seção Serviços Principais
  const renderServicosPrincipais = () => (
    <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-4 mb-6">
      <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho mb-4">Serviços Principais</h3>
      {renderInputs()}
    </div>
  );

  // Seção Impostos (dinâmica)
  const [impostos, setImpostos] = useState([
    { nome: 'ISS', valor: '' },
    { nome: 'IR', valor: '' },
  ]);
  const adicionarImposto = () => setImpostos(imps => [...imps, { nome: '', valor: '' }]);
  const removerImposto = (idx: number) => setImpostos(imps => imps.filter((_, i) => i !== idx));
  const renderImpostos = () => (
    <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-4 mb-6">
      <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho mb-4">
        Impostos <span className="text-xs text-ourovelho" title="Impostos são calculados em cascata: cada imposto incide sobre o subtotal anterior, conforme legislação brasileira.">🛈</span>
      </h3>
      <table className="w-full text-sm mb-2">
        <thead>
          <tr className="bg-ourovelho/20">
            <th className="p-2 text-left">Imposto <span className="text-xs text-ourovelho" title="Nome do imposto (ex: ISS, ICMS, PIS, COFINS)">🛈</span></th>
            <th className="p-2 text-left">Percentual (%) <span className="text-xs text-ourovelho" title="Percentual do imposto sobre o subtotal anterior">🛈</span></th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {impostos.map((imp, idx) => (
            <tr key={idx}>
              <td className="p-2">
                <input
                  type="text"
                  value={imp.nome}
                  onChange={e => setImpostos(imps => imps.map((i, j) => j === idx ? { ...i, nome: e.target.value } : i))}
                  className="w-full px-2 py-1 rounded border border-ourovelho bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
                  placeholder="Nome do imposto"
                  title="Nome do imposto (ex: ISS, ICMS, PIS, COFINS)"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={imp.valor}
                  onChange={e => setImpostos(imps => imps.map((i, j) => j === idx ? { ...i, valor: e.target.value } : i))}
                  className="w-24 px-2 py-1 rounded border border-ourovelho bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
                  placeholder="0,00"
                  min={0}
                  max={100}
                  step={0.01}
                  title="Percentual do imposto sobre o subtotal anterior"
                />
              </td>
              <td className="p-2 text-center">
                <button
                  type="button"
                  onClick={() => removerImposto(idx)}
                  className="text-red-600 hover:text-red-800 font-bold text-lg"
                  title="Remover imposto"
                  disabled={impostos.length === 1}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={adicionarImposto}
        className="bg-ourovelho text-olvblue font-bold px-4 py-2 rounded hover:bg-yellow-400"
        title="Adicionar novo imposto"
      >
        + Imposto
      </button>
    </div>
  );

  // Seção Observações Gerais
  const [observacoes, setObservacoes] = useState('');
  const renderObservacoes = () => (
    <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-4 mb-6">
      <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho mb-4">Observações Gerais</h3>
      <textarea
        value={observacoes}
        onChange={e => setObservacoes(e.target.value)}
        className="w-full min-h-[60px] px-3 py-2 rounded border border-ourovelho bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
        placeholder="Digite observações, condições ou notas gerais da proposta..."
      />
    </div>
  );

  // Seção Resultados detalhados
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
    const subtotalServicos = [...linhasServicos, ...linhasAdicionais].reduce((sum, l) => sum + l.valor, 0);

    // 4. Impostos em cascata
    let subtotal = subtotalServicos;
    const linhasImpostos = impostos
      .filter(imp => imp.nome && imp.valor && Number(imp.valor) > 0)
      .map((imp, idx) => {
        const valor = subtotal * (Number(imp.valor) / 100);
        subtotal += valor;
        return {
          tipo: 'imposto',
          descricao: imp.nome,
          valor,
          percentual: Number(imp.valor)
        };
      });

    // 5. Linhas finais para exibição
    const linhas = [
      ...linhasServicos,
      ...linhasAdicionais,
      ...linhasImpostos
    ];
    const totalGeral = subtotal;

    // 6. Conversão de moeda
    const { convertValue, formatCurrency } = require('@/lib/utils/currency');
    const exchangeRates = { BRL: 1, [currency]: conversionRate };
    
    function formatCurrencyValue(val: number) {
      if (currency === 'BRL') return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      const converted = convertValue(val, 'BRL', currency as any, exchangeRates);
      return formatCurrency(converted, currency as any);
    }

    return (
      <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-4 mb-6 overflow-x-auto">
        <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho mb-4">Resultado Detalhado</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-ourovelho/20">
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-right">Valor (BRL)</th>
              <th className="p-2 text-right">{currency !== 'BRL' ? `Valor (${currency})` : ''}</th>
              <th className="p-2 text-right">% sobre total</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha, idx) => (
              <tr key={idx} className={linha.tipo === 'imposto' ? 'bg-olvblue/10 dark:bg-ourovelho/10' : 'even:bg-olvblue/5 dark:even:bg-bg-dark-tertiary'}>
                <td className="p-2 font-medium capitalize">
                  {linha.descricao}
                  {linha.tipo === 'imposto' && (
                    <span className="ml-1 text-xs text-ourovelho" title="Imposto calculado em cascata sobre o subtotal anterior.">🛈</span>
                  )}
                </td>
                <td className="p-2 text-right font-bold text-olvblue dark:text-ourovelho">
                  R$ {linha.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2 text-right font-bold text-olvblue dark:text-ourovelho">
                  {currency !== 'BRL' ? formatCurrencyValue(linha.valor) : ''}
                </td>
                <td className="p-2 text-right">
                  {((linha.valor / totalGeral) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
                </td>
              </tr>
            ))}
            <tr className="bg-ourovelho/30 font-extrabold">
              <td className="p-2 text-right" colSpan={3}>Total Geral</td>
              <td className="p-2 text-right">{formatCurrencyValue(totalGeral)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Botões de ação avançados
  const renderAcoesAvancadas = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      <button className="bg-gray-700 text-white px-3 py-2 rounded font-bold" title="Salvar como Template">Salvar como Template</button>
      <button className="bg-blue-700 text-white px-3 py-2 rounded font-bold" title="Salvar Versão">💾 Salvar Versão</button>
      <button className="bg-gray-600 text-white px-3 py-2 rounded font-bold" title="Histórico">📋 Histórico (0)</button>
      <button className="bg-gray-600 text-white px-3 py-2 rounded font-bold" title="Comentários">💬 Comentários (0)</button>
      <button className="bg-yellow-600 text-white px-3 py-2 rounded font-bold" title="Personalizar">🎨 Personalizar</button>
      <button className="bg-pink-600 text-white px-3 py-2 rounded font-bold" title="Modo Expresso">⚡ Modo Expresso</button>
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
      {renderAcoesAvancadas()}
      <Collapsible title="1. Serviços Principais">{renderServicosPrincipais()}</Collapsible>
      <Collapsible title="2. Serviços Adicionais"><ServicosAdicionaisTable values={values} setValues={setValues} /></Collapsible>
      <Collapsible title="3. Impostos">{renderImpostos()}</Collapsible>
      <Collapsible title="4. Resultado">{renderResultados()}</Collapsible>
      <Collapsible title="5. Breakdown Detalhado">{renderBreakdown()}</Collapsible>
      <Collapsible title="6. Tabela de Tarifas e Condições">{renderTabelaTarifas()}</Collapsible>
      <Collapsible title="7. Observações Gerais">{renderObservacoes()}</Collapsible>
      {renderAcoes()}
    </div>
  );
}