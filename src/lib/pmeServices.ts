import { InputField, ServiceConfig } from './services';

const makeNumber = (key: string, label: string, def: number, min = 0): InputField => ({
  key,
  label,
  type: 'number',
  default: def,
  min,
});

export const pmeServices: ServiceConfig[] = [
  {
    slug: 'comex-ready',
    name: 'PME COMEX Ready',
    description: 'Internacionalize em 90 dias com baixo risco',
    inputs: [
      // implantação guiada
      { key: 'radar', label: 'Habilitação RADAR Expresso', type: 'checkbox', default: false, multiplier: 2500 },
      { key: 'onboarding', label: 'Onboarding Freight', type: 'checkbox', default: false, multiplier: 1900 },
      { key: 'contract_template', label: 'Template contrato internacional', type: 'checkbox', default: false, multiplier: 490 },
      { key: 'core_dashboard', label: 'Ativação CORE + dashboard', type: 'checkbox', default: false, multiplier: 980 },
      makeNumber('assisted', 'Quantidade de embarques assistidos', 3, 0),
      { key: 'pme_growth', label: 'Plano PME Growth (mensal)', type: 'checkbox', default: false, multiplier: 5000 },
      { key: 'adhoc', label: 'Plano Ad-hoc', type: 'checkbox', default: false, multiplier: 0 },
      makeNumber('adhoc_hours', 'Horas Ad-hoc', 0, 0),
    ],
    calculate(v) {
      const setup = 1900; // diagnóstico
      const assisted = (v.assisted || 0) * 2500;
      const extras = ['radar', 'onboarding', 'contract_template', 'core_dashboard']
        .filter((k) => v[k])
        .reduce((sum, k) => sum + (Number(this.inputs.find((i) => i.key === k)?.multiplier) || 0), 0);
      const pmeGrowth = v.pme_growth ? 5000 : 0;
      const adhoc = v.adhoc ? (v.adhoc_hours || 0) * 450 : 0;
      const total = setup + assisted + extras + pmeGrowth + adhoc;
      return {
        total,
        breakdown: { setup, assisted, extras, pmeGrowth, adhoc },
      };
    },
  },
  {
    slug: 'comex-on-demand',
    name: 'Especialistas COMEX On-Demand',
    description: 'Serviço pay-as-you-go de especialistas',
    inputs: [
      {
        key: 'sla',
        label: 'Nível de urgência',
        type: 'select',
        default: 'start',
        options: [
          { value: 'start', label: 'Start (R$ 390/h)' },
          { value: 'pro', label: 'Pro (R$ 490/h)' },
          { value: 'critical', label: 'Critical (R$ 650/h)' },
        ],
      },
      makeNumber('hours', 'Horas contratadas', 3, 1),
      { key: 'rep_legal', label: 'Representação legal administrativa', type: 'checkbox', default: false, multiplier: 400 },
      { key: 'juridic_report', label: 'Relatório com parecer jurídico', type: 'checkbox', default: false, multiplier: 350 },
    ],
    calculate(v) {
      const rateMap = { start: 390, pro: 490, critical: 650 } as Record<string, number>;
      const base = (v.hours || 0) * rateMap[v.sla];
      const extras = ['rep_legal', 'juridic_report'].filter((k) => v[k]).reduce((s, k) => s + (this.inputs.find((i)=>i.key===k)?.multiplier||0), 0);
      return { total: base + extras, breakdown: { base, extras } };
    },
  },
  {
    slug: '3pl-turnkey',
    name: 'Logística 3PL Turnkey',
    description: 'Armazenagem + transporte + desembaraço',
    inputs: [
      makeNumber('cif_mensal', 'Valor CIF mensal (R$)', 100000),
      makeNumber('volume', 'TEU/toneladas por mês', 10),
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
      makeNumber('cif_anual', 'Valor CIF anual (R$)', 3000000),
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
]; 