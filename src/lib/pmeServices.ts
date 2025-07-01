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
  {
    slug: 'modelo-olv-01',
    name: '01 - Diagnóstico Estratégico',
    description: 'Análise de viabilidade e oportunidade comercial do seu segmento',
    inputs: [
      makeNumber('segmento_mercado', 'Segmentos de mercado analisados', 3, 1),
      { key: 'analise_concorrencia', label: 'Análise de concorrência detalhada', type: 'checkbox', default: false, multiplier: 2500 },
      { key: 'estudo_viabilidade', label: 'Estudo de viabilidade econômica', type: 'checkbox', default: false, multiplier: 3500 },
      { key: 'relatorio_executivo', label: 'Relatório executivo com roadmap', type: 'checkbox', default: true, multiplier: 1500 },
    ],
    calculate(v) {
      const base = 4500; // Diagnóstico base
      const segmentos = (v.segmento_mercado || 3) * 800;
      const extras = ['analise_concorrencia', 'estudo_viabilidade', 'relatorio_executivo']
        .filter((k) => v[k])
        .reduce((sum, k) => sum + (Number(this.inputs.find((i) => i.key === k)?.multiplier) || 0), 0);
      const total = base + segmentos + extras;
      return { total, breakdown: { base, segmentos, extras } };
    },
  },
  {
    slug: 'modelo-olv-02',
    name: '02 - Modelagem da Cadeia Logística',
    description: 'Definição de agente, base, modais e cobertura fiscal otimizada',
    inputs: [
      {
        key: 'modal_principal',
        label: 'Modal principal',
        type: 'select',
        default: 'maritimo',
        options: [
          { value: 'maritimo', label: 'Marítimo (FCL/LCL)' },
          { value: 'aereo', label: 'Aéreo' },
          { value: 'multimodal', label: 'Multimodal' },
        ],
      },
      makeNumber('volume_mensal', 'Volume mensal estimado (TEU/ton)', 20),
      { key: 'cobertura_fiscal', label: 'Cobertura fiscal otimizada (SC/SP/CE)', type: 'checkbox', default: true, multiplier: 3200 },
      { key: 'agente_exclusivo', label: 'Definição de agente exclusivo', type: 'checkbox', default: true, multiplier: 2800 },
      { key: 'base_logistica', label: 'Definição de base logística', type: 'checkbox', default: true, multiplier: 2200 },
    ],
    calculate(v) {
      const base = 3800; // Modelagem base
      const volume = (v.volume_mensal || 20) * 150;
      const extras = ['cobertura_fiscal', 'agente_exclusivo', 'base_logistica']
        .filter((k) => v[k])
        .reduce((sum, k) => sum + (Number(this.inputs.find((i) => i.key === k)?.multiplier) || 0), 0);
      const total = base + volume + extras;
      return { total, breakdown: { base, volume, extras } };
    },
  },
  {
    slug: 'modelo-olv-03',
    name: '03 - Abertura de Canal na Origem',
    description: 'Interação com parceiros locais via OLV Connecta',
    inputs: [
      makeNumber('fornecedores_origem', 'Fornecedores na origem', 5, 2),
      { key: 'olv_connecta', label: 'Ativação OLV Connecta', type: 'checkbox', default: true, multiplier: 4200 },
      { key: 'negociacao_direta', label: 'Negociação direta com agentes', type: 'checkbox', default: true, multiplier: 3800 },
      { key: 'curadoria_produtos', label: 'Curadoria de produtos', type: 'checkbox', default: false, multiplier: 2900 },
      makeNumber('visitas_origem', 'Visitas à origem (opcional)', 0, 0),
    ],
    calculate(v) {
      const base = 5200; // Abertura de canal base
      const fornecedores = (v.fornecedores_origem || 5) * 600;
      const visitas = (v.visitas_origem || 0) * 3500;
      const extras = ['olv_connecta', 'negociacao_direta', 'curadoria_produtos']
        .filter((k) => v[k])
        .reduce((sum, k) => sum + (Number(this.inputs.find((i) => i.key === k)?.multiplier) || 0), 0);
      const total = base + fornecedores + visitas + extras;
      return { total, breakdown: { base, fornecedores, visitas, extras } };
    },
  },
  {
    slug: 'modelo-olv-04',
    name: '04 - Execução e Proteção da Carga',
    description: 'Embarque protegido, documentação blindada e controle total',
    inputs: [
      makeNumber('embarques_mensais', 'Embarques mensais', 3, 1),
      { key: 'documentacao_blindada', label: 'Documentação blindada', type: 'checkbox', default: true, multiplier: 2800 },
      { key: 'controle_total', label: 'Controle total da operação', type: 'checkbox', default: true, multiplier: 3200 },
      { key: 'protecao_carga', label: 'Proteção da carga (seguro)', type: 'checkbox', default: true, multiplier: 1800 },
      { key: 'identidade_exclusiva', label: 'Embarque sob identidade exclusiva', type: 'checkbox', default: true, multiplier: 2500 },
    ],
    calculate(v) {
      const base = 4200; // Execução base
      const embarques = (v.embarques_mensais || 3) * 1200;
      const extras = ['documentacao_blindada', 'controle_total', 'protecao_carga', 'identidade_exclusiva']
        .filter((k) => v[k])
        .reduce((sum, k) => sum + (Number(this.inputs.find((i) => i.key === k)?.multiplier) || 0), 0);
      const total = base + embarques + extras;
      return { total, breakdown: { base, embarques, extras } };
    },
  },
  {
    slug: 'modelo-olv-05',
    name: '05 - Recepção e Distribuição no Brasil',
    description: 'SC, SP ou CE conforme mercado-alvo com estrutura fiscal otimizada',
    inputs: [
      {
        key: 'estado_principal',
        label: 'Estado principal',
        type: 'select',
        default: 'sc',
        options: [
          { value: 'sc', label: 'Santa Catarina (SC)' },
          { value: 'sp', label: 'São Paulo (SP)' },
          { value: 'ce', label: 'Ceará (CE)' },
        ],
      },
      makeNumber('volume_distribuicao', 'Volume de distribuição mensal', 50),
      { key: 'estrutura_fiscal', label: 'Estrutura fiscal otimizada', type: 'checkbox', default: true, multiplier: 3800 },
      { key: 'armazenagem_exclusiva', label: 'Armazenagem exclusiva', type: 'checkbox', default: true, multiplier: 4200 },
      { key: 'distribuicao_b2b', label: 'Distribuição B2B', type: 'checkbox', default: true, multiplier: 2900 },
    ],
    calculate(v) {
      const base = 4800; // Recepção base
      const volume = (v.volume_distribuicao || 50) * 80;
      const extras = ['estrutura_fiscal', 'armazenagem_exclusiva', 'distribuicao_b2b']
        .filter((k) => v[k])
        .reduce((sum, k) => sum + (Number(this.inputs.find((i) => i.key === k)?.multiplier) || 0), 0);
      const total = base + volume + extras;
      return { total, breakdown: { base, volume, extras } };
    },
  },
  {
    slug: 'modelo-olv-06',
    name: '06 - Aceleração Comercial',
    description: 'Venda B2B, marketplaces e marketing digital para escala',
    inputs: [
      makeNumber('canais_venda', 'Canais de venda ativados', 3, 1),
      { key: 'marketplaces', label: 'Integração marketplaces', type: 'checkbox', default: true, multiplier: 3200 },
      { key: 'marketing_digital', label: 'Marketing digital integrado', type: 'checkbox', default: true, multiplier: 2800 },
      { key: 'venda_b2b', label: 'Venda B2B', type: 'checkbox', default: true, multiplier: 2500 },
      { key: 'acompanhamento_estrategico', label: 'Acompanhamento estratégico contínuo', type: 'checkbox', default: true, multiplier: 3500 },
    ],
    calculate(v) {
      const base = 3800; // Aceleração base
      const canais = (v.canais_venda || 3) * 800;
      const extras = ['marketplaces', 'marketing_digital', 'venda_b2b', 'acompanhamento_estrategico']
        .filter((k) => v[k])
        .reduce((sum, k) => sum + (Number(this.inputs.find((i) => i.key === k)?.multiplier) || 0), 0);
      const total = base + canais + extras;
      return { total, breakdown: { base, canais, extras } };
    },
  },
]; 