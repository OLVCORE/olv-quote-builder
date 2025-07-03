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
              className="w-full px-3 py-2 rounded border border-olvblue dark:border-ourovelho bg-white dark:bg-[#232a3d] text-olvblue dark:text-ourovelho placeholder:text-slate-400 dark:placeholder:text-ourovelho/60 focus:ring-2 focus:ring-olvblue dark:focus:ring-ourovelho"
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
      <div className="bg-white dark:bg-[#181f33] border border-olvblue dark:border-ourovelho rounded-xl p-6 mb-8 shadow-md">
        <h3 className="text-xl font-bold text-olvblue dark:text-ourovelho mb-6">Breakdown Detalhado</h3>
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
    tabela && <div className="bg-white dark:bg-[#181f33] border border-olvblue dark:border-ourovelho rounded-xl p-6 mb-8 shadow-md">
      <TabelaTarifas tabela={tabela} currency={currency} customRate={customRate} />
    </div>
  );

  // Seção Serviços Principais
  const renderServicosPrincipais = () => (
    <div className="bg-white dark:bg-[#181f33] border border-olvblue dark:border-ourovelho rounded-xl p-6 mb-8 shadow-md">
      <h3 className="text-xl font-bold text-olvblue dark:text-ourovelho mb-6">Serviços Principais</h3>
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
    <div className="bg-white dark:bg-[#181f33] border border-olvblue dark:border-ourovelho rounded-xl p-6 mb-8 shadow-md">
      <h3 className="text-xl font-bold text-olvblue dark:text-ourovelho mb-6">
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
                  className="w-full px-2 py-1 rounded border border-olvblue dark:border-ourovelho bg-white dark:bg-[#232a3d] text-olvblue dark:text-ourovelho placeholder:text-slate-400 dark:placeholder:text-ourovelho/60 focus:ring-2 focus:ring-olvblue dark:focus:ring-ourovelho"
                  placeholder="Nome do imposto"
                  title="Nome do imposto (ex: ISS, ICMS, PIS, COFINS)"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={imp.valor}
                  onChange={e => setImpostos(imps => imps.map((i, j) => j === idx ? { ...i, valor: e.target.value } : i))}
                  className="w-24 px-2 py-1 rounded border border-olvblue dark:border-ourovelho bg-white dark:bg-[#232a3d] text-olvblue dark:text-ourovelho placeholder:text-slate-400 dark:placeholder:text-ourovelho/60 focus:ring-2 focus:ring-olvblue dark:focus:ring-ourovelho"
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
    <div className="bg-white dark:bg-[#181f33] border border-olvblue dark:border-ourovelho rounded-xl p-6 mb-8 shadow-md">
      <h3 className="text-xl font-bold text-olvblue dark:text-ourovelho mb-6">Observações Gerais</h3>
      <textarea
        value={observacoes}
        onChange={e => setObservacoes(e.target.value)}
        className="w-full min-h-[60px] px-3 py-2 rounded border border-olvblue dark:border-ourovelho bg-white dark:bg-[#232a3d] text-olvblue dark:text-ourovelho placeholder:text-slate-400 dark:placeholder:text-ourovelho/60 focus:ring-2 focus:ring-olvblue dark:focus:ring-ourovelho"
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
      <div className="bg-white dark:bg-[#181f33] border border-olvblue dark:border-ourovelho rounded-xl p-6 mb-8 shadow-md">
        <h3 className="text-xl font-bold text-olvblue dark:text-ourovelho mb-6">Resultado Detalhado</h3>
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
            {linhasServicos.map((linha: any, idx: number) => (
              <tr key={idx} className="even:bg-olvblue/5 dark:even:bg-bg-dark-tertiary">
                <td className="p-2 font-medium capitalize">{linha.descricao}</td>
                <td className="p-2 text-right font-bold text-olvblue dark:text-ourovelho">R$ {linha.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="p-2 text-right font-bold text-olvblue dark:text-ourovelho">{currency !== 'BRL' ? formatCurrencyValue(linha.valor) : ''}</td>
                <td className="p-2 text-right">{((linha.valor / totalGeral) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%</td>
              </tr>
            ))}
            <tr className="bg-ourovelho/10 font-semibold">
              <td className="p-2 text-right" colSpan={3}>Subtotal Serviços <span title="Soma dos serviços principais.">🛈</span></td>
              <td className="p-2 text-right">{formatCurrencyValue(subtotalServicos)}</td>
            </tr>
            {linhasAdicionais.map((linha: any, idx: number) => (
              <tr key={idx} className="even:bg-olvblue/5 dark:even:bg-bg-dark-tertiary">
                <td className="p-2 font-medium capitalize">{linha.descricao}</td>
                <td className="p-2 text-right font-bold text-olvblue dark:text-ourovelho">R$ {linha.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="p-2 text-right font-bold text-olvblue dark:text-ourovelho">{currency !== 'BRL' ? formatCurrencyValue(linha.valor) : ''}</td>
                <td className="p-2 text-right">{((linha.valor / totalGeral) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%</td>
              </tr>
            ))}
            <tr className="bg-ourovelho/10 font-semibold">
              <td className="p-2 text-right" colSpan={3}>Subtotal Adicionais <span title="Soma dos serviços adicionais.">🛈</span></td>
              <td className="p-2 text-right">{formatCurrencyValue(subtotalAdicionais)}</td>
            </tr>
            {linhasImpostos.map((linha: any, idx: number) => (
              <tr key={idx} className="bg-olvblue/10 dark:bg-ourovelho/10">
                <td className="p-2 font-medium capitalize">{linha.descricao} <span className="ml-1 text-xs text-ourovelho" title="Imposto calculado em cascata sobre o subtotal anterior.">🛈</span></td>
                <td className="p-2 text-right font-bold text-olvblue dark:text-ourovelho">R$ {linha.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="p-2 text-right font-bold text-olvblue dark:text-ourovelho">{currency !== 'BRL' ? formatCurrencyValue(linha.valor) : ''}</td>
                <td className="p-2 text-right">{((linha.valor / totalGeral) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%</td>
              </tr>
            ))}
            <tr className="bg-ourovelho/10 font-semibold">
              <td className="p-2 text-right" colSpan={3}>Subtotal Impostos <span title="Soma dos impostos em cascata.">🛈</span></td>
              <td className="p-2 text-right">{formatCurrencyValue(subtotalImpostos)}</td>
            </tr>
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
      <button className="bg-gray-700 text-white px-3 py-2 rounded font-bold" title="Salvar como Template" onClick={() => alert('Funcionalidade de salvar como template em desenvolvimento.')}>Salvar como Template</button>
      <button className="bg-blue-700 text-white px-3 py-2 rounded font-bold" title="Salvar Versão" onClick={() => alert('Funcionalidade de salvar versão em desenvolvimento.')}>💾 Salvar Versão</button>
      <button className="bg-gray-600 text-white px-3 py-2 rounded font-bold" title="Histórico" onClick={() => alert('Funcionalidade de histórico em desenvolvimento.')}>📋 Histórico (0)</button>
      <button className="bg-gray-600 text-white px-3 py-2 rounded font-bold" title="Comentários" onClick={() => alert('Funcionalidade de comentários em desenvolvimento.')}>💬 Comentários (0)</button>
      <button className="bg-yellow-600 text-white px-3 py-2 rounded font-bold" title="Personalizar" onClick={() => alert('Funcionalidade de personalização em desenvolvimento.')}>🎨 Personalizar</button>
      <button className="bg-pink-600 text-white px-3 py-2 rounded font-bold" title="Modo Expresso" onClick={() => alert('Funcionalidade de modo expresso em desenvolvimento.')}>⚡ Modo Expresso</button>
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

  // Restaurar tabela de Serviços Adicionais (nº 2) no corpo da cotação
  const renderServicosAdicionais = () => (
    <div className="bg-white dark:bg-[#181f33] border border-olvblue dark:border-ourovelho rounded-xl p-6 mb-8 shadow-md">
      <h3 className="text-xl font-bold text-olvblue dark:text-ourovelho mb-6">Serviços Adicionais</h3>
      <ServicosAdicionaisTable values={values} setValues={setValues} currency={currencyTyped} exchangeRates={exchangeRates} />
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 md:px-6">
      {renderAcoesAvancadas()}
      <Collapsible title="1. Serviços Principais" expanded={expandAll}>{renderServicosPrincipais()}</Collapsible>
      <Collapsible title="2. Serviços Adicionais" expanded={expandAll}>{renderServicosAdicionais()}</Collapsible>
      <Collapsible title="3. Impostos" expanded={expandAll}>{renderImpostos()}</Collapsible>
      <Collapsible title="4. Resultado" expanded={expandAll}>{renderResultados()}</Collapsible>
      <Collapsible title="5. Breakdown Detalhado" expanded={expandAll}>{renderBreakdown()}</Collapsible>
      <Collapsible title="6. Tabela de Tarifas e Condições" expanded={expandAll}>{renderTabelaTarifas()}</Collapsible>
      <Collapsible title="7. Observações Gerais" expanded={expandAll}>{renderObservacoes()}</Collapsible>
      {renderAcoes()}
    </div>
  );
}