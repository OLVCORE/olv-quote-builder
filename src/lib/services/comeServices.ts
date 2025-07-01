import { ServiceConfig, InputField } from '../types/simulator';

// Função utilitária para criar campos numéricos
const makeNumber = (key: string, label: string, def: number, min = 0, max?: number): InputField => ({
  key,
  label,
  type: 'number',
  default: def,
  min,
  max,
});

// Função utilitária para criar campos de seleção
const makeSelect = (key: string, label: string, options: { value: string; label: string }[], defaultVal: string): InputField => ({
  key,
  label,
  type: 'select',
  options,
  default: defaultVal,
});

// Função utilitária para criar checkboxes
const makeCheckbox = (key: string, label: string, multiplier: number, defaultVal = false): InputField => ({
  key,
  label,
  type: 'checkbox',
  default: defaultVal,
  multiplier,
});

export const comeServices: ServiceConfig[] = [
  // 1. PME COMEX READY
  {
    id: 'pme_comex_ready',
    name: 'PME COMEX Ready',
    description: 'Internacionalize em 90 dias com baixo risco',
    category: 'comex',
    basePrice: 4500,
    type: 'mixed',
    duration: '90 dias',
    deliverables: [
      'Diagnóstico 360º completo',
      'Habilitação RADAR Expresso',
      'Onboarding Freight',
      '3 embarques assistidos',
      'Template contrato internacional',
      'Sistema CORE + dashboard'
    ],
    inputs: [
      makeNumber('cif_anual', 'CIF anual (R$)', 500000, 10000),
      makeNumber('teu_ano', 'TEU por ano', 50, 1),
      makeSelect('modal_preferencial', 'Modal preferencial', [
        { value: 'maritimo', label: 'Marítimo' },
        { value: 'aereo', label: 'Aéreo' },
        { value: 'multimodal', label: 'Multimodal' }
      ], 'maritimo'),
      makeCheckbox('radar_expresso', 'Habilitação RADAR Expresso', 3200, true),
      makeCheckbox('onboarding_freight', 'Onboarding Freight', 1900, true),
      makeCheckbox('contract_template', 'Template contrato internacional', 490, true),
      makeCheckbox('core_dashboard', 'Ativação CORE + dashboard', 980, true),
      makeNumber('embarques_assistidos', 'Quantidade de embarques assistidos', 3, 1, 10),
      makeCheckbox('pme_growth', 'Plano PME Growth (mensal)', 5000, false),
      makeCheckbox('adhoc', 'Plano Ad-hoc', 0, false),
      makeNumber('adhoc_hours', 'Horas Ad-hoc', 0, 0, 100)
    ],
    calculate: (values) => {
      const setup = 1900; // Diagnóstico base
      const radar = values.radar_expresso ? 3200 : 0;
      const onboarding = values.onboarding_freight ? 1900 : 0;
      const contract = values.contract_template ? 490 : 0;
      const core = values.core_dashboard ? 980 : 0;
      const embarques = (values.embarques_assistidos || 3) * 2500;
      const pmeGrowth = values.pme_growth ? 5000 : 0;
      const adhoc = values.adhoc ? (values.adhoc_hours || 0) * 450 : 0;
      
      const total = setup + radar + onboarding + contract + core + embarques + pmeGrowth + adhoc;
      
      return {
        total,
        breakdown: {
          setup,
          radar,
          onboarding,
          contract,
          core,
          embarques,
          pmeGrowth,
          adhoc
        }
      };
    }
  },

  // 2. Especialistas COMEX On-Demand
  {
    id: 'comex_on_demand',
    name: 'Especialistas COMEX On-Demand',
    description: 'Força-tarefa para destravar operações urgentes',
    category: 'comex',
    basePrice: 0,
    type: 'hourly',
    duration: '72h SLA',
    deliverables: [
      'Resposta em até 2h',
      'Match de especialista',
      'Kick-off de 15 min',
      'Relatório ISO 9001',
      'Handover com checklist'
    ],
    inputs: [
      makeSelect('sla_level', 'Nível de urgência', [
        { value: 'start', label: 'Start (4h - R$ 390/h)' },
        { value: 'pro', label: 'Pro (2h - R$ 490/h)' },
        { value: 'critical', label: 'Critical (1h - R$ 650/h + hotline)' }
      ], 'start'),
      makeNumber('hours', 'Horas contratadas', 5, 1, 100),
      makeSelect('tipo_urgencia', 'Tipo de urgência', [
        { value: 'multa', label: 'Multa AFRMM' },
        { value: 'li_anvisa', label: 'LI ANVISA bloqueada' },
        { value: 'ncm', label: 'Reclassificação NCM' },
        { value: 'bl_divergente', label: 'Draft BL divergente' },
        { value: 'outro', label: 'Outro' }
      ], 'multa'),
      makeCheckbox('rep_legal', 'Representação legal administrativa', 400, false),
      makeCheckbox('juridic_report', 'Relatório com parecer jurídico', 350, false)
    ],
    calculate: (values) => {
      const rates = { start: 390, pro: 490, critical: 650 };
      const rate = rates[values.sla_level as keyof typeof rates] || 390;
      const base = (values.hours || 5) * rate;
      const repLegal = values.rep_legal ? 400 : 0;
      const juridicReport = values.juridic_report ? 350 : 0;
      
      const total = base + repLegal + juridicReport;
      
      return {
        total,
        breakdown: {
          horas: values.hours || 5,
          rate,
          repLegal,
          juridicReport
        }
      };
    }
  },

  // 3. Logística 3PL Exportação
  {
    id: '3pl_export',
    name: 'Logística 3PL Exportação',
    description: 'Solução turnkey para exportação com redução de 18% no custo',
    category: 'logistics',
    basePrice: 7000,
    type: 'mixed',
    duration: '4 semanas onboarding',
    deliverables: [
      'Armazenagem bonded (OTIF 99%)',
      'Freight management (redução 8%)',
      'Desembaraço (liberação < 24h)',
      'WMS-OLV Cloud',
      'RateOptimizer®',
      'ComplianceHub'
    ],
    inputs: [
      makeNumber('cif_mensal', 'Valor CIF mensal (R$)', 100000, 10000),
      makeNumber('volume_mensal', 'Volume mensal (TEU/ton)', 10, 1),
      makeSelect('modal', 'Modal principal', [
        { value: 'maritimo', label: 'Marítimo (FCL/LCL)' },
        { value: 'aereo', label: 'Aéreo' },
        { value: 'multimodal', label: 'Multimodal' }
      ], 'maritimo'),
      makeSelect('destino', 'Destino principal', [
        { value: 'eua', label: 'Estados Unidos' },
        { value: 'europa', label: 'Europa' },
        { value: 'asia', label: 'Ásia' },
        { value: 'america_latina', label: 'América Latina' }
      ], 'eua'),
      makeCheckbox('performance_pack', 'Performance pack (-15%)', 0, false),
      makeCheckbox('edi_integration', 'Integração EDI', 1500, false)
    ],
    calculate: (values) => {
      const retainer = 7000;
      const variable = (values.cif_mensal || 100000) * 0.012; // 1.2% do CIF
      let total = retainer + variable;
      
      if (values.performance_pack) {
        total *= 0.85; // 15% desconto
      }
      
      const ediIntegration = values.edi_integration ? 1500 : 0;
      total += ediIntegration;
      
      return {
        total: Math.round(total),
        breakdown: {
          retainer,
          variable: Math.round(variable),
          ediIntegration
        }
      };
    }
  },

  // 4. Logística 3PL Importação (NOVO)
  {
    id: '3pl_import',
    name: 'Logística 3PL Importação',
    description: 'Solução turnkey para importação exclusiva com redução de 20%',
    category: 'logistics',
    basePrice: 8500,
    type: 'mixed',
    duration: '4 semanas onboarding',
    deliverables: [
      'Pré-embarque e planejamento',
      'Armazenagem exclusiva',
      'Desembaraço blindado',
      'Entrega nacional',
      'Controle total da operação',
      'Proteção documental'
    ],
    inputs: [
      makeNumber('cif_mensal', 'Valor CIF mensal (R$)', 150000, 10000),
      makeNumber('volume_mensal', 'Volume mensal (TEU/ton)', 15, 1),
      makeSelect('pais_origem', 'País de origem', [
        { value: 'china', label: 'China' },
        { value: 'eua', label: 'Estados Unidos' },
        { value: 'europa', label: 'Europa' },
        { value: 'outros', label: 'Outros' }
      ], 'china'),
      makeSelect('estado_destino', 'Estado de destino', [
        { value: 'sc', label: 'Santa Catarina (SC)' },
        { value: 'sp', label: 'São Paulo (SP)' },
        { value: 'ce', label: 'Ceará (CE)' },
        { value: 'outros', label: 'Outros' }
      ], 'sc'),
      makeCheckbox('armazenagem_exclusiva', 'Armazenagem exclusiva', 4200, true),
      makeCheckbox('documentacao_blindada', 'Documentação blindada', 2800, true),
      makeCheckbox('agente_exclusivo', 'Agente exclusivo', 3800, true),
      makeCheckbox('protecao_carga', 'Proteção da carga (seguro)', 1800, true)
    ],
    calculate: (values) => {
      const retainer = 8500;
      const variable = (values.cif_mensal || 150000) * 0.015; // 1.5% do CIF
      let total = retainer + variable;
      
      const armazenagem = values.armazenagem_exclusiva ? 4200 : 0;
      const documentacao = values.documentacao_blindada ? 2800 : 0;
      const agente = values.agente_exclusivo ? 3800 : 0;
      const protecao = values.protecao_carga ? 1800 : 0;
      
      total += armazenagem + documentacao + agente + protecao;
      
      return {
        total: Math.round(total),
        breakdown: {
          retainer,
          variable: Math.round(variable),
          armazenagem,
          documentacao,
          agente,
          protecao
        }
      };
    }
  },

  // 5. Operação COMEX In-House
  {
    id: 'comex_in_house',
    name: 'Operação COMEX In-House',
    description: 'Célula COMEX completa em 90 dias com garantia de ROI',
    category: 'comex',
    basePrice: 35000,
    type: 'setup_monthly',
    duration: '90 dias',
    deliverables: [
      'Assessment completo (AS-IS + TO-BE)',
      'Setup sistemas (OLV CORE + WMS + fiscal)',
      'Staffing e treinamento',
      'Go-live com SOP assinado',
      'Core Dashboard + 80 SOPs',
      'Playbook AI'
    ],
    inputs: [
      makeNumber('embarques_mensais', 'Embarques mensais', 10, 1),
      makeSelect('tipo_operacao', 'Tipo de operação', [
        { value: 'importacao', label: 'Importação' },
        { value: 'exportacao', label: 'Exportação' },
        { value: 'ambos', label: 'Ambos' }
      ], 'importacao'),
      makeCheckbox('bonus_performance', 'Bônus de performance', 0, false),
      makeCheckbox('treinamento', 'Treinamento interno', 2000, false),
      makeCheckbox('custom_erp', 'Customização ERP', 4500, false),
      makeCheckbox('build_operate_transfer', 'Build-Operate-Transfer', 5000, false)
    ],
    calculate: (values) => {
      const setup = 35000;
      const fee12m = 9500 * 12; // Anualizado
      
      const bonus = values.bonus_performance ? 5000 : 0;
      const treinamento = values.treinamento ? 2000 : 0;
      const customErp = values.custom_erp ? 4500 : 0;
      const bot = values.build_operate_transfer ? 5000 : 0;
      
      const total = setup + fee12m + bonus + treinamento + customErp + bot;
      
      return {
        total,
        breakdown: {
          setup,
          fee12m,
          bonus,
          treinamento,
          customErp,
          bot
        }
      };
    }
  },

  // 6. Logística Internacional E2E
  {
    id: 'logistics_e2e',
    name: 'Logística Internacional E2E',
    description: 'Metodologia OLV 4D com torre de controle e IA',
    category: 'logistics',
    basePrice: 6500,
    type: 'mixed',
    duration: 'Contínuo',
    deliverables: [
      'Design: Supply Blueprint',
      'Deploy: Integração EDI',
      'Drive: IA + chatbot Oliver',
      'Deliver: Kaizen + RPA',
      'KPI real-time',
      'Benchmark vs peers'
    ],
    inputs: [
      makeNumber('fornecedores', 'Número de fornecedores', 5, 1),
      makeNumber('modais', 'Modais utilizados', 2, 1),
      makeSelect('origem_destino', 'Origem/Destino', [
        { value: 'china_brasil', label: 'China → Brasil' },
        { value: 'eua_brasil', label: 'EUA → Brasil' },
        { value: 'europa_brasil', label: 'Europa → Brasil' },
        { value: 'multiplos', label: 'Múltiplos' }
      ], 'china_brasil'),
      makeCheckbox('erp_integration', 'Integração ERP', 1500, false),
      makeCheckbox('esg_consulting', 'Consultoria ESG', 900, false),
      makeCheckbox('ia_optimization', 'IA de otimização de rotas', 1200, false)
    ],
    calculate: (values) => {
      const setup = 6500;
      const retainer = 2900 * 12; // Anualizado
      
      const erp = values.erp_integration ? 1500 : 0;
      const esg = values.esg_consulting ? 900 : 0;
      const ia = values.ia_optimization ? 1200 : 0;
      
      const total = setup + retainer + erp + esg + ia;
      
      return {
        total,
        breakdown: {
          setup,
          retainer,
          erp,
          esg,
          ia
        }
      };
    }
  },

  // 7. 4PL Torre de Controle
  {
    id: '4pl_control_tower',
    name: '4PL Torre de Controle',
    description: 'Gestão 100% da cadeia COMEX com IA integrada',
    category: 'logistics',
    basePrice: 12000,
    type: 'tiered',
    duration: 'Contínuo',
    deliverables: [
      'Plan & Source: Sourcing global',
      'Move: Booking multimodal',
      'Clear: Desembaraço full',
      'Deliver: Última milha',
      'Improve: Kaizen contínuo',
      'KPI real-time'
    ],
    inputs: [
      makeSelect('volume_tier', 'Volume anual (TEU)', [
        { value: '50-200', label: '50-200 TEU/ano' },
        { value: '201-500', label: '201-500 TEU/ano' },
        { value: '500+', label: '500+ TEU/ano' }
      ], '50-200'),
      makeNumber('paises', 'Países envolvidos', 3, 1),
      makeCheckbox('sistemas_existentes', 'Integração sistemas existentes', 2000, false),
      makeCheckbox('relatorios_esg', 'Relatórios ESG incluídos', 1500, false),
      makeCheckbox('hotline_24h', 'Hotline 24/7', 3000, false)
    ],
    calculate: (values) => {
      const tiers = {
        '50-200': { retainer: 12000, savingsRate: 0.20 },
        '201-500': { retainer: 22000, savingsRate: 0.18 },
        '500+': { retainer: 35000, savingsRate: 0.15 }
      };
      
      const tier = tiers[values.volume_tier as keyof typeof tiers] || tiers['50-200'];
      const retainer = tier.retainer;
      
      const sistemas = values.sistemas_existentes ? 2000 : 0;
      const esg = values.relatorios_esg ? 1500 : 0;
      const hotline = values.hotline_24h ? 3000 : 0;
      
      const total = retainer + sistemas + esg + hotline;
      
      return {
        total,
        breakdown: {
          retainer,
          sistemas,
          esg,
          hotline
        }
      };
    }
  }
]; 