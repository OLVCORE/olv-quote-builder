import { pmeServices } from './pmeServices';

export type InputFieldBase = {
  key: string;
  label: string;
  multiplier?: number; // price for checkbox
  price?: number; // price per unit for number/select
  editablePrice?: boolean;
  /** When true, this item can receive per-item discounts */
  discountable?: boolean;
};

export type InputField =
  | (InputFieldBase & { type: 'number'; default: number; min?: number; max?: number })
  | (InputFieldBase & { type: 'select'; options: { value: string; label: string }[]; default: string })
  | (InputFieldBase & { type: 'checkbox'; default: boolean });

export interface ServiceConfig {
  slug: string;
  name: string;
  description: string;
  inputs: InputField[];
  calculate: (values: Record<string, any>) => { total: number; breakdown: Record<string, number> };
}

export const services: ServiceConfig[] = [
  {
    slug: 'pme-comex',
    name: 'Programa PME COMEX Ready',
    description: 'Internacionalize em até 90 dias com baixo risco',
    inputs: [
      { key: 'cif', label: 'CIF anual (R$)', type: 'number', default: 500000 },
      { key: 'import_volume', label: 'TEU por ano', type: 'number', default: 50 },
      {
        key: 'support_plan',
        label: 'Adicionar suporte continuado (PME Growth)',
        type: 'checkbox',
        default: false,
        multiplier: 5000,
      },
    ],
    calculate(values) {
      const base = 15000; // exemplo book + setup
      const retainer = 7000;
      const extras = values.support_plan ? 5000 : 0;
      const total = base + retainer + extras;
      return {
        total,
        breakdown: { base, retainer, extras },
      };
    },
  },
  {
    slug: 'comex-on-demand',
    name: 'Especialistas COMEX On-Demand',
    description: 'Contratação pay-as-you-go de especialistas',
    inputs: [
      {
        key: 'service_level',
        label: 'Escolha o SLA',
        type: 'select',
        default: 'start',
        options: [
          { value: 'start', label: 'Start (R$ 390/h)' },
          { value: 'pro', label: 'Pro (R$ 490/h)' },
          { value: 'critical', label: 'Critical (R$ 650/h)' },
        ],
      },
      { key: 'hours', label: 'Horas estimadas', type: 'number', default: 5 },
    ],
    calculate(values) {
      const rates: Record<string, number> = { start: 390, pro: 490, critical: 650 };
      const total = rates[values.service_level] * values.hours;
      return { total, breakdown: { horas: values.hours, rate: rates[values.service_level] } };
    },
  },
  {
    slug: '3pl-turnkey',
    name: 'Logística 3PL Turnkey',
    description: 'Solução completa de armazenagem, transporte e desembaraço',
    inputs: [
      { key: 'cif_mensal', label: 'Valor CIF mensal (R$)', type: 'number', default: 100000 },
      { key: 'volume', label: 'TEU/toneladas por mês', type: 'number', default: 10 },
      {
        key: 'operation_type',
        label: 'Tipo de operação',
        type: 'select',
        default: 'maritimo',
        options: [
          { value: 'maritimo', label: 'Marítimo' },
          { value: 'aereo', label: 'Aéreo' },
          { value: 'multimodal', label: 'Multimodal' },
        ],
      },
      { key: 'performance_pack', label: 'Ativar performance pack (-15%)', type: 'checkbox', default: false },
    ],
    calculate(v) {
      const retainer = 7000;
      const variable = (v.cif_mensal || 0) * 0.01; // 1%
      let total = retainer + variable;
      if (v.performance_pack) total *= 0.85;
      return { total: Math.round(total), breakdown: { retainer, variable } };
    },
  },
  {
    slug: 'end-to-end',
    name: 'Logística Internacional End-to-End',
    description: 'Metodologia OLV 4D',
    inputs: [
      { key: 'erp', label: 'Integração ERP', type: 'checkbox', default: false, multiplier: 1500 },
      { key: 'esg', label: 'Consultoria ESG', type: 'checkbox', default: false, multiplier: 900 },
      { key: 'cif_anual', label: 'Valor CIF anual (R$)', type: 'number', default: 3000000 },
    ],
    calculate(v) {
      const setup = 6500;
      const retainer = 2900 * 12; // anualizado
      const extras = ['erp', 'esg'].filter((k) => v[k]).reduce((s, k) => s + (this.inputs.find(i=>i.key===k)?.multiplier||0), 0);
      return { total: setup + retainer + extras, breakdown: { setup, retainer, extras } };
    },
  },
  {
    slug: 'in-house',
    name: 'Implantação COMEX In-House',
    description: 'Projeto turnkey em 90 dias',
    inputs: [
      { key: 'bonus', label: 'Ativar bônus de performance', type: 'checkbox', default: false },
      { key: 'treinamento', label: 'Treinamento interno', type: 'checkbox', default: false, multiplier: 2000 },
      { key: 'custom_erp', label: 'Customização ERP', type: 'checkbox', default: false, multiplier: 4500 },
    ],
    calculate(v) {
      const setup = 35000;
      const fee12m = 9500 * 12;
      const extras = ['treinamento', 'custom_erp'].filter((k)=>v[k]).reduce((s,k)=> s + (this.inputs.find(i=>i.key===k)?.multiplier||0),0);
      const total = setup + fee12m + extras;
      return { total, breakdown: { setup, fee12m, extras } };
    },
  },
  {
    slug: 'nova-rota-importacao',
    name: 'Nova Rota de Importação',
    description: 'Modelo OLV em 6 etapas',
    inputs: [
      { key: 'etapa1', label: 'Diagnóstico estratégico', type: 'checkbox', default: true, multiplier: 4500 },
      { key: 'etapa2', label: 'Modelagem da cadeia logística', type: 'checkbox', default: true, multiplier: 3800 },
      { key: 'etapa3', label: 'Abertura de canal na origem', type: 'checkbox', default: true, multiplier: 5200 },
      { key: 'etapa4', label: 'Estruturação operacional', type: 'checkbox', default: true, multiplier: 4800 },
      { key: 'etapa5', label: 'Validação e testes', type: 'checkbox', default: true, multiplier: 3200 },
      { key: 'etapa6', label: 'Início da operação', type: 'checkbox', default: true, multiplier: 2500 },
    ],
    calculate(v) {
      const etapas = ['etapa1','etapa2','etapa3','etapa4','etapa5','etapa6'];
      const total = etapas.reduce((sum, k) => sum + (v[k] ? (this.inputs.find(i=>i.key===k)?.multiplier||0) : 0), 0);
      return { total, breakdown: etapas.reduce((acc, k) => { acc[k] = v[k] ? (this.inputs.find(i=>i.key===k)?.multiplier||0) : 0; return acc; }, {}) };
    },
  },
  {
    slug: 'consultoria',
    name: 'Consultoria Especializada',
    description: 'Soluções customizadas para desafios específicos',
    inputs: [
      { key: 'estrategica', label: 'Consultoria estratégica (R$ 800/h)', type: 'number', default: 0 },
      { key: 'auditoria', label: 'Auditoria COMEX (R$ 650/h)', type: 'number', default: 0 },
      { key: 'otimizacao', label: 'Otimização de custos (R$ 1200/h)', type: 'number', default: 0 },
      { key: 'compliance', label: 'Compliance digital (R$ 950/h)', type: 'number', default: 0 },
    ],
    calculate(v) {
      const estrategica = (v.estrategica || 0) * 800;
      const auditoria = (v.auditoria || 0) * 650;
      const otimizacao = (v.otimizacao || 0) * 1200;
      const compliance = (v.compliance || 0) * 950;
      const total = estrategica + auditoria + otimizacao + compliance;
      return { total, breakdown: { estrategica, auditoria, otimizacao, compliance } };
    },
  },
  {
    slug: 'servicos-adicionais',
    name: 'Serviços Adicionais',
    description: 'Soluções complementares para operações COMEX',
    inputs: [
      { key: 'iso', label: 'Certificação ISO 9001', type: 'checkbox', default: false, multiplier: 12000 },
      { key: 'treinamento', label: 'Treinamento especializado (R$ 350/h)', type: 'number', default: 0 },
      { key: 'software', label: 'Software COMEX (R$ 1200/mês)', type: 'number', default: 0 },
      { key: 'seguro', label: 'Seguro cargo (% sobre valor)', type: 'number', default: 0 },
    ],
    calculate(v) {
      const iso = v.iso ? 12000 : 0;
      const treinamento = (v.treinamento || 0) * 350;
      const software = (v.software || 0) * 1200;
      const seguro = (v.seguro || 0) * 0.008;
      const total = iso + treinamento + software + seguro;
      return { total, breakdown: { iso, treinamento, software, seguro } };
    },
  },
];

export const allServices: ServiceConfig[] = [...services, ...pmeServices]; 