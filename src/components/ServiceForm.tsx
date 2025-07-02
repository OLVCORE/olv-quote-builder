"use client";
import React, { useState, useMemo } from 'react';
import { ServiceConfig, InputField } from '@/lib/services';
import { useAdmin } from './AdminContext';
import { useRates, Currency } from '@/lib/useRates';
import { getTabelaTarifas } from '@/lib/tarifas';
import TabelaTarifasComponent from './TabelaTarifas';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { generateProposalPDF } from '@/lib/utils/pdfGenerator';
import { CalculationResult, ClientData, ServiceType } from '@/lib/types/simulator';

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

// Utilitário para persistência de templates no localStorage
function getTemplates(key = 'quote_templates'): any[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}
function saveTemplates(templates: any[], key = 'quote_templates') {
  localStorage.setItem(key, JSON.stringify(templates));
}

// Adicionar componente para preview do PDF
function PdfPreviewer({ calculations, clientData }: { calculations: CalculationResult, clientData: ClientData }) {
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    let revoked = false;
    generateProposalPDF(calculations, clientData).then(blob => {
      if (!revoked) {
        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      }
    });
    return () => {
      revoked = true;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculations, clientData]);
  if (!url) return <div className="text-center text-gray-500">Gerando prévia do PDF...</div>;
  return <iframe src={url} title="Prévia PDF" className="w-full h-full min-h-[60vh] rounded border" />;
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

  // Validação de extras
  function validateExtra(l: ExtraCost) {
    const errors: Record<string, string> = {};
    if (!l.description || l.description.trim().length < 2) errors.description = 'Descrição obrigatória';
    if (!l.qty || l.qty <= 0) errors.qty = 'Qtd obrigatória';
    if (!l.unit || l.unit <= 0) errors.unit = 'Unitário obrigatório';
    if (l.discount < 0 || l.discount > 100) errors.discount = 'Desconto inválido';
    return errors;
  }

  // Impedir exportação se houver erro em algum extra
  const hasExtraErrors = extras.some(l => Object.keys(validateExtra(l)).length > 0);

  const exportToPDF = () => {
    if (hasExtraErrors) {
      alert('Corrija os erros nos Serviços Adicionais antes de exportar.');
      return;
    }
    // Implementation of exportToPDF
  };
  const exportToExcel = () => {
    if (hasExtraErrors) {
      alert('Corrija os erros nos Serviços Adicionais antes de exportar.');
      return;
    }
    // Implementation of exportToExcel
  };

  // Estado para templates
  const [templates, setTemplates] = useState(() => getTemplates());
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');

  // Salvar template
  function handleSaveTemplate() {
    const newTemplate = {
      name: templateName,
      desc: templateDesc,
      values,
      extras
    };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    saveTemplates(updated);
    setShowTemplateModal(false);
    setTemplateName('');
    setTemplateDesc('');
  }

  // Aplicar template
  function handleApplyTemplate(idx: number) {
    const t = templates[idx];
    if (t) {
      setValues(t.values);
      setExtras(t.extras);
    }
  }

  // Remover template
  function handleRemoveTemplate(idx: number) {
    const updated = templates.filter((_: any, i: number) => i !== idx);
    setTemplates(updated);
    saveTemplates(updated);
  }

  // Estado para preview do PDF
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  // Estado para envio por e-mail
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ to: '', subject: '', message: '' });
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  // Estado para histórico de versões
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  // Estado para comentários internos
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  // Estado para personalização visual
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [themeConfig, setThemeConfig] = useState({
    primaryColor: '#1e3a8a', // olvblue
    secondaryColor: '#d4af37', // ourovelho
    accentColor: '#059669', // emerald
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderRadius: '12px',
    fontFamily: 'Inter'
  });
  const [previewTheme, setPreviewTheme] = useState(themeConfig);

  // Função para enviar PDF por e-mail
  const sendEmail = async () => {
    if (!emailData.to || !emailData.subject) {
      alert('Preencha o e-mail e assunto obrigatórios.');
      return;
    }
    
    setEmailStatus('sending');
    try {
      const calculations = {
        items: [
          {
            id: config.slug,
            name: config.name,
            description: config.description,
            valueBRL: baseResult.total,
            valueForeign: baseResult.total * (customRate ? Number(customRate) : 1),
            duration: '',
            type: 'fixed' as ServiceType,
            breakdown: baseResult.breakdown
          },
          ...extras.map((l) => ({
            id: l.id,
            name: l.description,
            description: l.description,
            valueBRL: l.qty * l.unit * (1 - l.discount / 100),
            valueForeign: (l.qty * l.unit * (1 - l.discount / 100)) * (customRate ? Number(customRate) : 1),
            duration: '',
            type: 'fixed' as ServiceType,
            breakdown: {}
          }))
        ],
        totalBRL: baseResult.total + extrasTotal,
        totalForeign: (baseResult.total + extrasTotal) * (customRate ? Number(customRate) : 1),
        totalDuration: '',
        currency: (['BRL','USD','EUR','CNY'].includes(currency) ? currency : 'BRL') as 'BRL' | 'USD' | 'EUR' | 'CNY',
        exchangeRate: customRate ? Number(customRate) : 1
      };
      
      const clientData = {
        nome: values.nome || 'Cliente Exemplo',
        empresa: values.empresa || 'Empresa Exemplo',
        cnpj: values.cnpj || '00.000.000/0000-00',
        email: values.email || 'cliente@exemplo.com',
        telefone: values.telefone || '',
      };
      
      const response = await fetch('/api/quote/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          message: emailData.message,
          calculations,
          clientData
        })
      });
      
      if (response.ok) {
        setEmailStatus('success');
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailStatus('idle');
          setEmailData({ to: '', subject: '', message: '' });
        }, 2000);
      } else {
        throw new Error('Falha no envio');
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3000);
    }
  };

  // Função para salvar versão atual
  const saveVersion = () => {
    const newVersion = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      name: `Versão ${versions.length + 1} - ${new Date().toLocaleString('pt-BR')}`,
      data: {
        values,
        extras,
        globalDiscount,
        taxRates,
        currency,
        customRate
      }
    };
    
    const updatedVersions = [...versions, newVersion];
    setVersions(updatedVersions);
    localStorage.setItem('quote_versions', JSON.stringify(updatedVersions));
    
    alert('Versão salva com sucesso!');
  };
  
  // Função para restaurar versão
  const restoreVersion = (version: any) => {
    if (confirm('Deseja restaurar esta versão? Os dados atuais serão perdidos.')) {
      setValues(version.data.values);
      setExtras(version.data.extras);
      setGlobalDiscount(version.data.globalDiscount);
      setTaxRates(version.data.taxRates);
      setShowVersionsModal(false);
      alert('Versão restaurada com sucesso!');
    }
  };
  
  // Função para remover versão
  const removeVersion = (versionId: number) => {
    if (confirm('Deseja remover esta versão?')) {
      const updatedVersions = versions.filter(v => v.id !== versionId);
      setVersions(updatedVersions);
      localStorage.setItem('quote_versions', JSON.stringify(updatedVersions));
    }
  };
  
  // Carregar versões salvas
  React.useEffect(() => {
    const savedVersions = localStorage.getItem('quote_versions');
    if (savedVersions) {
      try {
        setVersions(JSON.parse(savedVersions));
      } catch (error) {
        console.error('Erro ao carregar versões:', error);
      }
    }
  }, []);

  // Função para adicionar comentário
  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      text: newComment.trim(),
      author: 'Usuário' // Em produção, usar dados do usuário logado
    };
    
    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    localStorage.setItem('quote_comments', JSON.stringify(updatedComments));
    setNewComment('');
  };
  
  // Função para remover comentário
  const removeComment = (commentId: number) => {
    if (confirm('Deseja remover este comentário?')) {
      const updatedComments = comments.filter(c => c.id !== commentId);
      setComments(updatedComments);
      localStorage.setItem('quote_comments', JSON.stringify(updatedComments));
    }
  };
  
  // Carregar comentários salvos
  React.useEffect(() => {
    const savedComments = localStorage.getItem('quote_comments');
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (error) {
        console.error('Erro ao carregar comentários:', error);
      }
    }
  }, []);

  // Função para aplicar tema
  const applyTheme = () => {
    setThemeConfig(previewTheme);
    localStorage.setItem('quote_theme', JSON.stringify(previewTheme));
    setShowThemeModal(false);
  };
  
  // Função para resetar tema
  const resetTheme = () => {
    const defaultTheme = {
      primaryColor: '#1e3a8a',
      secondaryColor: '#d4af37',
      accentColor: '#059669',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderRadius: '12px',
      fontFamily: 'Inter'
    };
    setPreviewTheme(defaultTheme);
  };
  
  // Carregar tema salvo
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('quote_theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        setThemeConfig(theme);
        setPreviewTheme(theme);
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      }
    }
  }, []);
  
  // Aplicar estilos dinâmicos
  const dynamicStyles = {
    '--primary-color': themeConfig.primaryColor,
    '--secondary-color': themeConfig.secondaryColor,
    '--accent-color': themeConfig.accentColor,
    '--bg-color': themeConfig.backgroundColor,
    '--text-color': themeConfig.textColor,
    '--border-radius': themeConfig.borderRadius,
    '--font-family': themeConfig.fontFamily
  } as React.CSSProperties;

  // Estado para simulação rápida
  const [quickMode, setQuickMode] = useState(false);
  const [quickData, setQuickData] = useState({
    serviceType: 'pme-comex',
    cifValue: 500000,
    volume: 50,
    urgency: 'normal'
  });
  
  // Templates de simulação rápida
  const quickTemplates = {
    'pme-comex': { base: 15000, retainer: 7000, extras: 5000 },
    'comex-on-demand': { base: 1950, retainer: 0, extras: 0 }, // 5h * 390
    '3pl-turnkey': { base: 7000, retainer: 1000, extras: 0 }, // 7k + 1% CIF
    'end-to-end': { base: 6500, retainer: 34800, extras: 0 }, // setup + 12 meses
    'in-house': { base: 35000, retainer: 114000, extras: 0 } // setup + 12 meses
  };
  
  // Cálculo rápido
  const quickCalculation = () => {
    const template = quickTemplates[quickData.serviceType as keyof typeof quickTemplates];
    let total = template.base + template.retainer + template.extras;
    
    // Ajustes baseados no volume/CIF
    if (quickData.serviceType === 'pme-comex') {
      total += quickData.cifValue * 0.02; // 2% sobre CIF
    } else if (quickData.serviceType === '3pl-turnkey') {
      total += quickData.cifValue * 0.01; // 1% sobre CIF
    }
    
    // Ajuste por urgência
    if (quickData.urgency === 'high') total *= 1.2;
    if (quickData.urgency === 'low') total *= 0.9;
    
    return Math.round(total);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 md:px-6">
      {/* Barra de templates */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 mb-2">
        <button onClick={() => setShowTemplateModal(true)} className="w-full sm:w-auto bg-accent-light dark:bg-accent-dark text-white px-3 sm:px-4 py-2 sm:py-2 rounded font-bold shadow hover:bg-accent-light-hover dark:hover:bg-accent-dark-hover text-sm sm:text-base">Template</button>
        <button onClick={saveVersion} className="w-full sm:w-auto bg-purple-600 dark:bg-purple-700 text-white px-3 sm:px-4 py-2 sm:py-2 rounded font-bold shadow hover:bg-purple-700 dark:hover:bg-purple-800 text-sm sm:text-base">💾 Versão</button>
        <button onClick={() => setShowVersionsModal(true)} className="w-full sm:w-auto bg-indigo-600 dark:bg-indigo-700 text-white px-3 sm:px-4 py-2 sm:py-2 rounded font-bold shadow hover:bg-indigo-700 dark:hover:bg-indigo-800 text-sm sm:text-base">📋 Histórico ({versions.length})</button>
        <button onClick={() => setShowCommentsModal(true)} className="w-full sm:w-auto bg-orange-600 dark:bg-orange-700 text-white px-3 sm:px-4 py-2 sm:py-2 rounded font-bold shadow hover:bg-orange-700 dark:hover:bg-orange-800 text-sm sm:text-base">💬 Comentários ({comments.length})</button>
        <button onClick={() => setShowThemeModal(true)} className="w-full sm:w-auto bg-pink-600 dark:bg-pink-700 text-white px-3 sm:px-4 py-2 sm:py-2 rounded font-bold shadow hover:bg-pink-700 dark:hover:bg-pink-800 text-sm sm:text-base">🎨 Personalizar</button>
        <button 
          onClick={() => setQuickMode(!quickMode)} 
          className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2 rounded font-bold shadow transition-colors text-sm sm:text-base ${
            quickMode 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {quickMode ? '⚡ Expresso Ativo' : '⚡ Expresso'}
        </button>
        {templates.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-white dark:text-ourovelho font-semibold text-sm sm:text-base">Templates:</span>
            <select className="w-full sm:w-auto rounded px-2 py-1 text-sm" onChange={e => handleApplyTemplate(Number(e.target.value))} defaultValue="">
              <option value="" disabled>Escolha um template</option>
              {templates.map((t: any, idx: number) => (
                <option key={idx} value={idx}>{t.name}</option>
              ))}
            </select>
            <button onClick={() => { setTemplates([]); saveTemplates([]); }} className="text-xs text-red-400 underline">Limpar todos</button>
          </div>
        )}
      </div>
      {/* Modal de salvar template */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-olvblue dark:bg-bg-dark-secondary p-4 sm:p-6 rounded-xl border border-ourovelho shadow-xl flex flex-col gap-4 w-[90vw] max-w-[400px] mx-4">
            <h3 className="text-base sm:text-lg font-bold text-white dark:text-ourovelho mb-2">Salvar como Template</h3>
            <input type="text" className="w-full px-3 py-2 rounded border border-ourovelho bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho text-sm" placeholder="Nome do template" value={templateName} onChange={e => setTemplateName(e.target.value)} />
            <textarea className="w-full px-3 py-2 rounded border border-ourovelho bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho text-sm" placeholder="Descrição (opcional)" value={templateDesc} onChange={e => setTemplateDesc(e.target.value)} />
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <button onClick={handleSaveTemplate} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded font-bold text-sm">Salvar</button>
              <button onClick={() => setShowTemplateModal(false)} className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded font-bold text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de preview do PDF */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-bg-dark-secondary p-2 sm:p-4 rounded-xl shadow-2xl w-[95vw] max-w-4xl h-[95vh] flex flex-col mx-2">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <h3 className="text-base sm:text-lg font-bold text-olvblue dark:text-ourovelho">Prévia do PDF</h3>
              <button onClick={() => setShowPdfPreview(false)} className="text-red-600 font-bold text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-auto border rounded bg-slate-100 dark:bg-bg-dark-tertiary p-1 sm:p-2">
              {/* Renderização do PDF em tela */}
              <PdfPreviewer 
                calculations={{
                  items: [
                    {
                      id: config.slug,
                      name: config.name,
                      description: config.description,
                      valueBRL: baseResult.total,
                      valueForeign: baseResult.total * (customRate ? Number(customRate) : 1),
                      duration: '',
                      type: 'fixed' as ServiceType,
                      breakdown: baseResult.breakdown
                    },
                    ...extras.map((l) => ({
                      id: l.id,
                      name: l.description,
                      description: l.description,
                      valueBRL: l.qty * l.unit * (1 - l.discount / 100),
                      valueForeign: (l.qty * l.unit * (1 - l.discount / 100)) * (customRate ? Number(customRate) : 1),
                      duration: '',
                      type: 'fixed' as ServiceType,
                      breakdown: {}
                    }))
                  ],
                  totalBRL: baseResult.total + extrasTotal,
                  totalForeign: (baseResult.total + extrasTotal) * (customRate ? Number(customRate) : 1),
                  totalDuration: '',
                  currency: (['BRL','USD','EUR','CNY'].includes(currency) ? currency : 'BRL') as 'BRL' | 'USD' | 'EUR' | 'CNY',
                  exchangeRate: customRate ? Number(customRate) : 1
                }}
                clientData={{
                  nome: values.nome || 'Cliente Exemplo',
                  empresa: values.empresa || 'Empresa Exemplo',
                  cnpj: values.cnpj || '00.000.000/0000-00',
                  email: values.email || 'cliente@exemplo.com',
                  telefone: values.telefone || '',
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button onClick={exportToPDF} className="flex-1 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white py-2 rounded font-bold flex items-center justify-center gap-2 text-sm"><FaFilePdf /> Exportar PDF</button>
              <button onClick={() => setShowEmailModal(true)} className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2 rounded font-bold flex items-center justify-center gap-2 text-sm">📧 Enviar E-mail</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de envio por e-mail */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-bg-dark-secondary p-4 sm:p-6 rounded-xl shadow-2xl w-[90vw] max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho">Enviar Proposta por E-mail</h3>
              <button onClick={() => setShowEmailModal(false)} className="text-red-600 font-bold text-xl">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">E-mail do Destinatário *</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-bg-dark-tertiary text-gray-900 dark:text-gray-100"
                  value={emailData.to}
                  onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="cliente@empresa.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Assunto *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-bg-dark-tertiary text-gray-900 dark:text-gray-100"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Proposta Comercial OLV Internacional"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Mensagem (opcional)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-bg-dark-tertiary text-gray-900 dark:text-gray-100"
                  rows={4}
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Prezado cliente, segue em anexo nossa proposta comercial..."
                />
              </div>
              
              {emailStatus === 'sending' && (
                <div className="text-center text-blue-600 dark:text-blue-400">Enviando e-mail...</div>
              )}
              
              {emailStatus === 'success' && (
                <div className="text-center text-green-600 dark:text-green-400 font-semibold">✓ E-mail enviado com sucesso!</div>
              )}
              
              {emailStatus === 'error' && (
                <div className="text-center text-red-600 dark:text-red-400 font-semibold">✗ Erro ao enviar e-mail. Tente novamente.</div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <button
                  onClick={sendEmail}
                  disabled={emailStatus === 'sending'}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-white py-2 rounded font-bold text-sm"
                >
                  {emailStatus === 'sending' ? 'Enviando...' : 'Enviar E-mail'}
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 transition-colors text-white py-2 rounded font-bold text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de histórico de versões */}
      {showVersionsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-bg-dark-secondary p-4 sm:p-6 rounded-xl shadow-2xl w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho">Histórico de Versões</h3>
              <button onClick={() => setShowVersionsModal(false)} className="text-red-600 font-bold text-xl">✕</button>
            </div>
            
            {versions.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Nenhuma versão salva ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div key={version.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 dark:bg-bg-dark-tertiary rounded border gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">{version.name}</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {new Date(version.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => restoreVersion(version)}
                        className="flex-1 sm:flex-none px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs sm:text-sm font-semibold"
                      >
                        Restaurar
                      </button>
                      <button
                        onClick={() => removeVersion(version.id)}
                        className="flex-1 sm:flex-none px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm font-semibold"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowVersionsModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de comentários internos */}
      {showCommentsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-bg-dark-secondary p-4 sm:p-6 rounded-xl shadow-2xl w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho">Comentários Internos</h3>
              <button onClick={() => setShowCommentsModal(false)} className="text-red-600 font-bold text-xl">✕</button>
            </div>
            
            {/* Adicionar novo comentário */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-bg-dark-tertiary rounded">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Novo Comentário</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-bg-dark-tertiary text-gray-900 dark:text-gray-100"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário interno sobre esta proposta..."
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-semibold"
                >
                  Adicionar Comentário
                </button>
              </div>
            </div>
            
            {/* Lista de comentários */}
            {comments.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Nenhum comentário ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 dark:bg-bg-dark-tertiary rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{comment.author}</div>
                      <button
                        onClick={() => removeComment(comment.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 mb-2">{comment.text}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(comment.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCommentsModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de personalização visual */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-bg-dark-secondary p-4 sm:p-6 rounded-xl shadow-2xl w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto mx-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho">Personalização Visual</h3>
              <button onClick={() => setShowThemeModal(false)} className="text-red-600 font-bold text-xl">✕</button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Configurações */}
              <div className="space-y-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Configurações</h4>
                
                {/* Cores */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Cor Primária</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={previewTheme.primaryColor}
                        onChange={(e) => setPreviewTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-10 rounded border"
                      />
                      <input
                        type="text"
                        value={previewTheme.primaryColor}
                        onChange={(e) => setPreviewTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-bg-dark-tertiary text-gray-900 dark:text-gray-100"
                        placeholder="#1e3a8a"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Cor Secundária</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={previewTheme.secondaryColor}
                        onChange={(e) => setPreviewTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-12 h-10 rounded border"
                      />
                      <input
                        type="text"
                        value={previewTheme.secondaryColor}
                        onChange={(e) => setPreviewTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-bg-dark-tertiary text-gray-900 dark:text-gray-100"
                        placeholder="#d4af37"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Cor de Destaque</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={previewTheme.accentColor}
                        onChange={(e) => setPreviewTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-12 h-10 rounded border"
                      />
                      <input
                        type="text"
                        value={previewTheme.accentColor}
                        onChange={(e) => setPreviewTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-bg-dark-tertiary text-gray-900 dark:text-gray-100"
                        placeholder="#059669"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Outras configurações */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Raio das Bordas</label>
                    <select
                      value={previewTheme.borderRadius}
                      onChange={(e) => setPreviewTheme(prev => ({ ...prev, borderRadius: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-bg-dark-tertiary text-gray-900 dark:text-gray-100"
                    >
                      <option value="0px">Sem bordas</option>
                      <option value="4px">Pequeno</option>
                      <option value="8px">Médio</option>
                      <option value="12px">Grande</option>
                      <option value="16px">Extra Grande</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Fonte</label>
                    <select
                      value={previewTheme.fontFamily}
                      onChange={(e) => setPreviewTheme(prev => ({ ...prev, fontFamily: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-bg-dark-tertiary text-gray-900 dark:text-gray-100"
                    >
                      <option value="Inter">Inter (Padrão)</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>
                </div>
                
                {/* Botões de ação */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={applyTheme}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold"
                  >
                    Aplicar Tema
                  </button>
                  <button
                    onClick={resetTheme}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-bold"
                  >
                    Resetar
                  </button>
                </div>
              </div>
              
              {/* Preview */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Preview</h4>
                <div 
                  className="p-4 rounded border"
                  style={{
                    backgroundColor: previewTheme.backgroundColor,
                    color: previewTheme.textColor,
                    borderRadius: previewTheme.borderRadius,
                    fontFamily: previewTheme.fontFamily
                  }}
                >
                  <div className="space-y-3">
                    <div 
                      className="p-3 rounded"
                      style={{ backgroundColor: previewTheme.primaryColor, color: 'white' }}
                    >
                      <h5 className="font-bold">Cabeçalho Principal</h5>
                      <p className="text-sm opacity-90">Exemplo de área com cor primária</p>
                    </div>
                    
                    <div 
                      className="p-3 rounded border"
                      style={{ borderColor: previewTheme.secondaryColor }}
                    >
                      <h5 className="font-bold" style={{ color: previewTheme.secondaryColor }}>Área Secundária</h5>
                      <p className="text-sm">Exemplo de área com cor secundária</p>
                    </div>
                    
                    <button 
                      className="px-4 py-2 rounded font-bold text-white"
                      style={{ backgroundColor: previewTheme.accentColor }}
                    >
                      Botão de Destaque
                    </button>
                    
                    <div className="text-sm text-gray-600">
                      <p>Texto secundário para demonstração</p>
                      <p>Fonte: {previewTheme.fontFamily}</p>
                      <p>Bordas: {previewTheme.borderRadius}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Interface de simulação rápida */}
      {quickMode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-bg-dark-secondary p-4 sm:p-6 rounded-xl shadow-2xl w-[95vw] max-w-2xl mx-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho">⚡ Simulação Rápida</h3>
              <button onClick={() => setQuickMode(false)} className="text-red-600 font-bold text-xl">✕</button>
            </div>
            
            <div className="space-y-6">
              {/* Tipo de serviço */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tipo de Serviço</label>
                <select
                  value={quickData.serviceType}
                  onChange={(e) => setQuickData(prev => ({ ...prev, serviceType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-bg-dark-tertiary text-gray-900 dark:text-gray-100"
                >
                  <option value="pme-comex">PME COMEX Ready</option>
                  <option value="comex-on-demand">Especialistas On-Demand</option>
                  <option value="3pl-turnkey">Logística 3PL Turnkey</option>
                  <option value="end-to-end">Logística End-to-End</option>
                  <option value="in-house">Implantação In-House</option>
                </select>
              </div>
              
              {/* Valor CIF/Volume */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  {quickData.serviceType === 'comex-on-demand' ? 'Horas Estimadas' : 'Valor CIF Anual (R$)'}
                </label>
                <input
                  type="number"
                  value={quickData.cifValue}
                  onChange={(e) => setQuickData(prev => ({ ...prev, cifValue: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-bg-dark-tertiary text-gray-900 dark:text-gray-100"
                  placeholder={quickData.serviceType === 'comex-on-demand' ? '5' : '500000'}
                />
              </div>
              
              {/* Volume (se aplicável) */}
              {quickData.serviceType !== 'comex-on-demand' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Volume (TEU/ton)</label>
                  <input
                    type="number"
                    value={quickData.volume}
                    onChange={(e) => setQuickData(prev => ({ ...prev, volume: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-bg-dark-tertiary text-gray-900 dark:text-gray-100"
                    placeholder="50"
                  />
                </div>
              )}
              
              {/* Urgência */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Nível de Urgência</label>
                <select
                  value={quickData.urgency}
                  onChange={(e) => setQuickData(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-bg-dark-tertiary text-gray-900 dark:text-gray-100"
                >
                  <option value="low">Baixa (-10%)</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta (+20%)</option>
                </select>
              </div>
              
              {/* Resultado */}
              <div className="p-4 bg-gray-50 dark:bg-bg-dark-tertiary rounded border">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Estimativa Rápida</h4>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  R$ {quickCalculation().toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Baseado em parâmetros padrão do mercado
                </div>
              </div>
              
              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    // Aplicar dados ao formulário principal
                    setValues({
                      cif: quickData.cifValue,
                      import_volume: quickData.volume,
                      service_level: 'start',
                      hours: quickData.cifValue
                    });
                    setQuickMode(false);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold text-sm"
                >
                  Usar no Formulário Completo
                </button>
                <button
                  onClick={() => setQuickMode(false)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-bold text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Linha 1: Serviços Principais (esquerda) + Resultados (direita) */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 w-full">
        <div className="flex-1 flex flex-col gap-4 sm:gap-6 lg:gap-8 min-w-0">
          {/* 1. Serviços Principais */}
          <section className="bg-olvblue dark:bg-bg-dark-secondary rounded-xl border border-ourovelho dark:border-ourovelho shadow p-3 sm:p-4 lg:p-6">
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
        <div className="flex-1 flex flex-col gap-4 sm:gap-6 lg:gap-8 min-w-0">
          {/* 4. Resultados */}
          <section className="bg-olvblue dark:bg-bg-dark-secondary rounded-xl border border-ourovelho dark:border-ourovelho shadow p-3 sm:p-4 lg:p-6">
            <h2 className="text-lg font-bold text-white dark:text-ourovelho mb-4 flex items-center gap-2">
              4. Resultados
              <Tooltip text="Veja o detalhamento do cálculo, totais, descontos e impostos da proposta.">
                <svg className="w-4 h-4 text-white dark:text-ourovelho" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
              </Tooltip>
            </h2>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-white dark:text-ourovelho mb-2">Memória de Cálculo</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm border border-ourovelho dark:border-ourovelho rounded min-w-[600px]">
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
                    const errors = validateExtra(l);
                    return (
                      <tr key={l.id} className="odd:bg-olvblue/80 dark:odd:bg-bg-dark-tertiary even:bg-olvblue dark:even:bg-bg-dark-secondary">
                        <td className="border p-1">
                          <input type="text" className={`w-full px-1 bg-transparent text-white dark:text-ourovelho ${errors.description ? 'border border-red-500' : ''}`} value={l.description} onChange={(e) => updateExtra(l.id, 'description', e.target.value)} />
                          {errors.description && <div className="text-xs text-red-400 mt-1">{errors.description}</div>}
                        </td>
                        <td className="border p-1">
                          <input type="number" className={`w-full px-1 bg-transparent text-white dark:text-ourovelho ${errors.qty ? 'border border-red-500' : ''}`} value={l.qty === 0 ? '' : l.qty} min={0} onChange={(e) => updateExtra(l.id, 'qty', Number(e.target.value))} />
                          {errors.qty && <div className="text-xs text-red-400 mt-1">{errors.qty}</div>}
                        </td>
                        <td className="border p-1">
                          <input type="number" className={`w-full px-1 bg-transparent text-white dark:text-ourovelho ${errors.unit ? 'border border-red-500' : ''}`} value={l.unit === 0 ? '' : l.unit} min={0} step={0.01} onChange={(e) => updateExtra(l.id, 'unit', Number(e.target.value))} />
                          {errors.unit && <div className="text-xs text-red-400 mt-1">{errors.unit}</div>}
                        </td>
                        <td className="border p-1 text-right">{convertToForeign(l.unit)}</td>
                        <td className="border p-1">
                          <input type="number" className={`w-full px-1 bg-transparent text-white dark:text-ourovelho ${l.discount > 20 ? 'border border-yellow-400 bg-yellow-100 text-yellow-900' : ''} ${errors.discount ? 'border border-red-500' : ''}`} value={l.discount === 0 ? '' : l.discount} min={0} max={100} onChange={(e) => updateExtra(l.id, 'discount', Number(e.target.value))} />
                          {l.discount > 20 && <div className="text-xs text-yellow-400 mt-1">Desconto alto! Confirme a política.</div>}
                          {errors.discount && <div className="text-xs text-red-400 mt-1">{errors.discount}</div>}
                        </td>
                        <td className="border p-1 text-right">{isNaN(subtotal) ? '-' : `R$ ${subtotal.toLocaleString('pt-BR')}`}</td>
                        <td className="border p-1 text-right">{convertToForeign(subtotal)}</td>
                        <td className="border p-1 text-center"><button type="button" onClick={() => removeExtra(l.id)} className="text-xs text-red-600">✕</button></td>
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
            {/* Resumo Fixo do Orçamento */}
            <div className="sticky top-8 z-30">
              <div className="bg-ourovelho/90 dark:bg-ourovelho/80 rounded-xl shadow-lg p-6 border-2 border-ourovelho flex flex-col gap-2 min-w-[260px]">
                <h3 className="text-lg font-bold text-olvblue dark:text-bg-dark-secondary mb-2">Resumo do Orçamento</h3>
                <div className="flex justify-between text-sm font-semibold text-olvblue dark:text-bg-dark-secondary">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
                </div>
                {currency !== 'BRL' && (
                  <div className="flex justify-between text-sm text-olvblue dark:text-bg-dark-secondary">
                    <span>Subtotal ({currency})</span>
                    <span>{convertToForeign(subtotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-olvblue dark:text-bg-dark-secondary">
                  <span>Descontos</span>
                  <span>- R$ {discountAmount.toLocaleString('pt-BR')}</span>
                </div>
                {currency !== 'BRL' && (
                  <div className="flex justify-between text-sm text-olvblue dark:text-bg-dark-secondary">
                    <span>Descontos ({currency})</span>
                    <span>- {convertToForeign(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-yellow-900 dark:text-yellow-800 font-semibold">
                  <span>Impostos</span>
                  <span>+ R$ {taxesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {currency !== 'BRL' && (
                  <div className="flex justify-between text-sm text-yellow-900 dark:text-yellow-800">
                    <span>Impostos ({currency})</span>
                    <span>+ {convertToForeign(taxesTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2 text-olvblue dark:text-bg-dark-secondary">
                  <span>Total Final</span>
                  <span>{currency === 'BRL' ? 'R$' : currency + ' '}{convertedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowPdfPreview(true)} className="flex-1 bg-slate-500 hover:bg-slate-700 transition-colors text-white py-2 rounded font-bold flex items-center justify-center gap-2"><FaFilePdf /> Preview PDF</button>
                  <button onClick={exportToPDF} className="flex-1 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white py-2 rounded font-bold flex items-center justify-center gap-2"><FaFilePdf /> PDF</button>
                  <button onClick={exportToExcel} className="flex-1 bg-accent-light hover:bg-accent-light-hover transition-colors text-white py-2 rounded font-bold flex items-center justify-center gap-2"><FaFileExcel /> XLSX</button>
                </div>
              </div>
            </div>
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
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border border-ourovelho dark:border-ourovelho rounded min-w-[800px]">
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
              const errors = validateExtra(l);
              return (
                <tr key={l.id} className="odd:bg-olvblue/80 dark:odd:bg-bg-dark-tertiary even:bg-olvblue dark:even:bg-bg-dark-secondary">
                  <td className="border p-1">
                    <input type="text" className={`w-full px-1 bg-transparent text-white dark:text-ourovelho ${errors.description ? 'border border-red-500' : ''}`} value={l.description} onChange={(e) => updateExtra(l.id, 'description', e.target.value)} />
                    {errors.description && <div className="text-xs text-red-400 mt-1">{errors.description}</div>}
                  </td>
                  <td className="border p-1">
                    <input type="number" className={`w-full px-1 bg-transparent text-white dark:text-ourovelho ${errors.qty ? 'border border-red-500' : ''}`} value={l.qty === 0 ? '' : l.qty} min={0} onChange={(e) => updateExtra(l.id, 'qty', Number(e.target.value))} />
                    {errors.qty && <div className="text-xs text-red-400 mt-1">{errors.qty}</div>}
                  </td>
                  <td className="border p-1">
                    <input type="number" className={`w-full px-1 bg-transparent text-white dark:text-ourovelho ${errors.unit ? 'border border-red-500' : ''}`} value={l.unit === 0 ? '' : l.unit} min={0} step={0.01} onChange={(e) => updateExtra(l.id, 'unit', Number(e.target.value))} />
                    {errors.unit && <div className="text-xs text-red-400 mt-1">{errors.unit}</div>}
                  </td>
                  <td className="border p-1 text-right">{convertToForeign(l.unit)}</td>
                  <td className="border p-1">
                    <input type="number" className={`w-full px-1 bg-transparent text-white dark:text-ourovelho ${l.discount > 20 ? 'border border-yellow-400 bg-yellow-100 text-yellow-900' : ''} ${errors.discount ? 'border border-red-500' : ''}`} value={l.discount === 0 ? '' : l.discount} min={0} max={100} onChange={(e) => updateExtra(l.id, 'discount', Number(e.target.value))} />
                    {l.discount > 20 && <div className="text-xs text-yellow-400 mt-1">Desconto alto! Confirme a política.</div>}
                    {errors.discount && <div className="text-xs text-red-400 mt-1">{errors.discount}</div>}
                  </td>
                  <td className="border p-1 text-right">{isNaN(subtotal) ? '-' : `R$ ${subtotal.toLocaleString('pt-BR')}`}</td>
                  <td className="border p-1 text-right">{convertToForeign(subtotal)}</td>
                  <td className="border p-1 text-center"><button type="button" onClick={() => removeExtra(l.id)} className="text-xs text-red-600">✕</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
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