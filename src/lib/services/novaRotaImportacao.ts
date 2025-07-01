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

export const novaRotaImportacaoServices: ServiceConfig[] = [
  // 1. Diagnóstico Estratégico
  {
    id: 'diagnostico_estrategico',
    name: '01 - Diagnóstico Estratégico',
    description: 'Estudo de viabilidade do produto, margem e potencial de exclusividade',
    category: 'import',
    basePrice: 3900,
    type: 'fixed',
    duration: '1 semana',
    deliverables: [
      'Análise de viabilidade do produto',
      'Estudo de margem e rentabilidade',
      'Análise de potencial de exclusividade',
      'Book diagnóstico com SWOT',
      'Matriz de riscos',
      'Roadmap estratégico'
    ],
    inputs: [
      makeNumber('segmentos_mercado', 'Segmentos de mercado analisados', 3, 1, 10),
      makeSelect('tipo_produto', 'Tipo de produto', [
        { value: 'eletronicos', label: 'Eletrônicos' },
        { value: 'textil', label: 'Têxtil' },
        { value: 'automotivo', label: 'Automotivo' },
        { value: 'alimenticio', label: 'Alimentício' },
        { value: 'cosmeticos', label: 'Cosméticos' },
        { value: 'outros', label: 'Outros' }
      ], 'eletronicos'),
      makeCheckbox('analise_concorrencia', 'Análise de concorrência detalhada', 2500, false),
      makeCheckbox('estudo_viabilidade', 'Estudo de viabilidade econômica', 3500, false),
      makeCheckbox('relatorio_executivo', 'Relatório executivo com roadmap', 1500, true),
      makeCheckbox('promocao_gratuita', 'Promoção gratuita (limitada)', 0, false)
    ],
    calculate: (values: Record<string, any>) => {
      const base = 3900;
      const segmentos = (values.segmentos_mercado || 3) * 800;
      const concorrencia = values.analise_concorrencia ? 2500 : 0;
      const viabilidade = values.estudo_viabilidade ? 3500 : 0;
      const relatorio = values.relatorio_executivo ? 1500 : 0;
      const promocao = values.promocao_gratuita ? -base : 0; // Gratuito se selecionado
      
      const total = base + segmentos + concorrencia + viabilidade + relatorio + promocao;
      
      return {
        total: Math.max(0, total),
        breakdown: {
          base,
          segmentos,
          concorrencia,
          viabilidade,
          relatorio,
          promocao
        }
      };
    }
  },

  // 2. Modelagem Logística sob Medida
  {
    id: 'modelagem_logistica',
    name: '02 - Modelagem Logística sob Medida',
    description: 'Seleção de modais, agentes, fiscais e estrutura ideal por UF',
    category: 'import',
    basePrice: 4200,
    type: 'fixed',
    duration: '2 semanas',
    deliverables: [
      'Seleção de modais otimizada',
      'Definição de agentes exclusivos',
      'Estrutura fiscal otimizada',
      'Simulação com SC/SP/CE',
      'Roteirização tributária',
      'Plano de contingência'
    ],
    inputs: [
      makeSelect('modal_principal', 'Modal principal', [
        { value: 'maritimo', label: 'Marítimo (FCL/LCL)' },
        { value: 'aereo', label: 'Aéreo' },
        { value: 'multimodal', label: 'Multimodal' }
      ], 'maritimo'),
      makeNumber('volume_mensal', 'Volume mensal estimado (TEU/ton)', 20, 1),
      makeSelect('estado_principal', 'Estado principal', [
        { value: 'sc', label: 'Santa Catarina (SC)' },
        { value: 'sp', label: 'São Paulo (SP)' },
        { value: 'ce', label: 'Ceará (CE)' },
        { value: 'outros', label: 'Outros' }
      ], 'sc'),
      makeCheckbox('cobertura_fiscal', 'Cobertura fiscal otimizada (SC/SP/CE)', 3200, true),
      makeCheckbox('agente_exclusivo', 'Definição de agente exclusivo', 2800, true),
      makeCheckbox('base_logistica', 'Definição de base logística', 2200, true),
      makeCheckbox('roteirizacao_tributaria', 'Roteirização tributária avançada', 1800, false)
    ],
    calculate: (values: Record<string, any>) => {
      const base = 4200;
      const volume = (values.volume_mensal || 20) * 150;
      const cobertura = values.cobertura_fiscal ? 3200 : 0;
      const agente = values.agente_exclusivo ? 2800 : 0;
      const baseLog = values.base_logistica ? 2200 : 0;
      const roteirizacao = values.roteirizacao_tributaria ? 1800 : 0;
      
      const total = base + volume + cobertura + agente + baseLog + roteirizacao;
      
      return {
        total: Math.round(total),
        breakdown: {
          base,
          volume: Math.round(volume),
          cobertura,
          agente,
          baseLog,
          roteirizacao
        }
      };
    }
  },

  // 3. Curadoria e Abertura de Canal na Origem
  {
    id: 'curadoria_origem',
    name: '03 - Curadoria e Abertura de Canal na Origem',
    description: 'Mapeamento de fornecedores + contato via OLV Connecta',
    category: 'import',
    basePrice: 6500,
    type: 'variable',
    duration: '3 semanas',
    deliverables: [
      'Mapeamento de fornecedores',
      'Contato via OLV Connecta',
      'Negociação direta com agentes',
      'Curadoria de produtos',
      'Visitas à origem (opcional)',
      'Relatório de fornecedores'
    ],
    inputs: [
      makeNumber('fornecedores_origem', 'Fornecedores na origem', 5, 2, 20),
      makeSelect('pais_origem', 'País de origem', [
        { value: 'china', label: 'China' },
        { value: 'eua', label: 'Estados Unidos' },
        { value: 'europa', label: 'Europa' },
        { value: 'asia', label: 'Ásia' },
        { value: 'outros', label: 'Outros' }
      ], 'china'),
      makeCheckbox('olv_connecta', 'Ativação OLV Connecta', 4200, true),
      makeCheckbox('negociacao_direta', 'Negociação direta com agentes', 3800, true),
      makeCheckbox('curadoria_produtos', 'Curadoria de produtos', 2900, false),
      makeNumber('visitas_origem', 'Visitas à origem (opcional)', 0, 0, 5),
      makeCheckbox('pais_adicional', 'País adicional (+R$ 2.000)', 2000, false)
    ],
    calculate: (values: Record<string, any>) => {
      const base = 6500;
      const fornecedores = (values.fornecedores_origem || 5) * 600;
      const visitas = (values.visitas_origem || 0) * 3500;
      const connecta = values.olv_connecta ? 4200 : 0;
      const negociacao = values.negociacao_direta ? 3800 : 0;
      const curadoria = values.curadoria_produtos ? 2900 : 0;
      const paisAdicional = values.pais_adicional ? 2000 : 0;
      
      const total = base + fornecedores + visitas + connecta + negociacao + curadoria + paisAdicional;
      
      return {
        total: Math.round(total),
        breakdown: {
          base,
          fornecedores: Math.round(fornecedores),
          visitas: Math.round(visitas),
          connecta,
          negociacao,
          curadoria,
          paisAdicional
        }
      };
    }
  },

  // 4. Execução com Proteção Avançada
  {
    id: 'execucao_protecao',
    name: '04 - Execução com Proteção Avançada',
    description: 'Embarque sob identidade exclusiva, documentação blindada',
    category: 'import',
    basePrice: 5800,
    type: 'variable',
    duration: '4 semanas',
    deliverables: [
      'Embarque sob identidade exclusiva',
      'Documentação blindada',
      'Controle total da operação',
      'Proteção da carga (seguro)',
      'Contrato com 3PL homologado',
      'Sistema de rastreamento'
    ],
    inputs: [
      makeNumber('embarques_mensais', 'Embarques mensais', 3, 1, 20),
      makeSelect('tipo_carga', 'Tipo de carga', [
        { value: 'geral', label: 'Carga Geral' },
        { value: 'perigosa', label: 'Carga Perigosa' },
        { value: 'refrigerada', label: 'Carga Refrigerada' },
        { value: 'fragil', label: 'Carga Frágil' }
      ], 'geral'),
      makeCheckbox('documentacao_blindada', 'Documentação blindada', 2800, true),
      makeCheckbox('controle_total', 'Controle total da operação', 3200, true),
      makeCheckbox('protecao_carga', 'Proteção da carga (seguro)', 1800, true),
      makeCheckbox('identidade_exclusiva', 'Embarque sob identidade exclusiva', 2500, true),
      makeCheckbox('3pl_homologado', 'Contrato com 3PL homologado', 1500, false)
    ],
    calculate: (values: Record<string, any>) => {
      const base = 5800;
      const embarques = (values.embarques_mensais || 3) * 1200;
      const documentacao = values.documentacao_blindada ? 2800 : 0;
      const controle = values.controle_total ? 3200 : 0;
      const protecao = values.protecao_carga ? 1800 : 0;
      const identidade = values.identidade_exclusiva ? 2500 : 0;
      const homologado = values['3pl_homologado'] ? 1500 : 0;
      
      const total = base + embarques + documentacao + controle + protecao + identidade + homologado;
      
      return {
        total: Math.round(total),
        breakdown: {
          base,
          embarques: Math.round(embarques),
          documentacao,
          controle,
          protecao,
          identidade,
          homologado
        }
      };
    }
  },

  // 5. Nacionalização Estratégica
  {
    id: 'nacionalizacao_estrategica',
    name: '05 - Nacionalização Estratégica',
    description: 'Simulação fiscal e escolha de UF conforme mercado-alvo',
    category: 'import',
    basePrice: 3600,
    type: 'fixed',
    duration: '2 semanas',
    deliverables: [
      'Simulação fiscal completa',
      'Escolha de UF otimizada',
      'Roteirização tributária',
      'Estrutura fiscal sob medida',
      'Análise de mercado-alvo',
      'Plano de nacionalização'
    ],
    inputs: [
      makeSelect('estado_destino', 'Estado de destino', [
        { value: 'sc', label: 'Santa Catarina (SC)' },
        { value: 'sp', label: 'São Paulo (SP)' },
        { value: 'ce', label: 'Ceará (CE)' },
        { value: 'rs', label: 'Rio Grande do Sul (RS)' },
        { value: 'pr', label: 'Paraná (PR)' },
        { value: 'outros', label: 'Outros' }
      ], 'sc'),
      makeNumber('volume_distribuicao', 'Volume de distribuição mensal', 50, 10),
      makeCheckbox('estrutura_fiscal', 'Estrutura fiscal otimizada', 3800, true),
      makeCheckbox('armazenagem_exclusiva', 'Armazenagem exclusiva', 4200, true),
      makeCheckbox('distribuicao_b2b', 'Distribuição B2B', 2900, true),
      makeCheckbox('analise_mercado', 'Análise de mercado-alvo', 2200, false)
    ],
    calculate: (values: Record<string, any>) => {
      const base = 3600;
      const volume = (values.volume_distribuicao || 50) * 80;
      const estrutura = values.estrutura_fiscal ? 3800 : 0;
      const armazenagem = values.armazenagem_exclusiva ? 4200 : 0;
      const distribuicao = values.distribuicao_b2b ? 2900 : 0;
      const analise = values.analise_mercado ? 2200 : 0;
      
      const total = base + volume + estrutura + armazenagem + distribuicao + analise;
      
      return {
        total: Math.round(total),
        breakdown: {
          base,
          volume: Math.round(volume),
          estrutura,
          armazenagem,
          distribuicao,
          analise
        }
      };
    }
  },

  // 6. Aceleração Comercial
  {
    id: 'aceleracao_comercial',
    name: '06 - Aceleração Comercial',
    description: 'Estruturação de canais de venda: B2B, marketplaces, canal próprio',
    category: 'import',
    basePrice: 7200,
    type: 'fixed',
    duration: '4 semanas',
    deliverables: [
      'Estruturação de canais B2B',
      'Setup em marketplaces',
      'Canal próprio',
      'Marketing digital integrado',
      'Estratégia de vendas',
      'Plano de aceleração'
    ],
    inputs: [
      makeNumber('canais_venda', 'Canais de venda ativados', 3, 1, 10),
      makeSelect('tipo_venda', 'Tipo de venda principal', [
        { value: 'b2b', label: 'B2B' },
        { value: 'marketplace', label: 'Marketplace' },
        { value: 'canal_proprio', label: 'Canal Próprio' },
        { value: 'multiplos', label: 'Múltiplos Canais' }
      ], 'b2b'),
      makeCheckbox('marketplaces', 'Integração marketplaces', 3200, true),
      makeCheckbox('marketing_digital', 'Marketing digital integrado', 2800, true),
      makeCheckbox('venda_b2b', 'Venda B2B', 2500, true),
      makeCheckbox('acompanhamento_estrategico', 'Acompanhamento estratégico contínuo', 3500, true),
      makeCheckbox('estrategia_vendas', 'Estratégia de vendas personalizada', 1800, false)
    ],
    calculate: (values: Record<string, any>) => {
      const base = 7200;
      const canais = (values.canais_venda || 3) * 800;
      const marketplaces = values.marketplaces ? 3200 : 0;
      const marketing = values.marketing_digital ? 2800 : 0;
      const b2b = values.venda_b2b ? 2500 : 0;
      const acompanhamento = values.acompanhamento_estrategico ? 3500 : 0;
      const estrategia = values.estrategia_vendas ? 1800 : 0;
      
      const total = base + canais + marketplaces + marketing + b2b + acompanhamento + estrategia;
      
      return {
        total: Math.round(total),
        breakdown: {
          base,
          canais: Math.round(canais),
          marketplaces,
          marketing,
          b2b,
          acompanhamento,
          estrategia
        }
      };
    }
  },

  // 7. Suporte Tático
  {
    id: 'suporte_tatico',
    name: '07 - Suporte Tático',
    description: 'Acompanhamento de 90 dias pós-implantação (2h/sem)',
    category: 'import',
    basePrice: 3900,
    type: 'monthly',
    duration: '90 dias',
    deliverables: [
      'Acompanhamento estratégico',
      'Suporte operacional',
      'Monitoramento de KPIs',
      'Ajustes e otimizações',
      'Relatórios semanais',
      'Plano de melhoria contínua'
    ],
    inputs: [
      makeNumber('meses_suporte', 'Meses de suporte', 3, 1, 12),
      makeSelect('tipo_suporte', 'Tipo de suporte', [
        { value: 'basico', label: 'Básico (2h/sem)' },
        { value: 'intermediario', label: 'Intermediário (4h/sem)' },
        { value: 'premium', label: 'Premium (8h/sem)' }
      ], 'basico'),
      makeCheckbox('suporte_extra', 'Suporte extra 30 dias', 1500, false),
      makeCheckbox('relatorios_detalhados', 'Relatórios detalhados', 800, false),
      makeCheckbox('consultoria_especializada', 'Consultoria especializada', 1200, false)
    ],
    calculate: (values: Record<string, any>) => {
      const base = 3900;
      const meses = values.meses_suporte || 3;
      const tipoMultiplier = { basico: 1, intermediario: 1.5, premium: 2 };
      const multiplier = tipoMultiplier[values.tipo_suporte as keyof typeof tipoMultiplier] || 1;
      
      const suporteExtra = values.suporte_extra ? 1500 : 0;
      const relatorios = values.relatorios_detalhados ? 800 : 0;
      const consultoria = values.consultoria_especializada ? 1200 : 0;
      
      const total = (base * meses * multiplier) + suporteExtra + relatorios + consultoria;
      
      return {
        total: Math.round(total),
        breakdown: {
          base: Math.round(base * meses * multiplier),
          suporteExtra,
          relatorios,
          consultoria
        }
      };
    }
  },

  // 8. Documentação e Relatório Técnico
  {
    id: 'documentacao_relatorio',
    name: '08 - Documentação e Relatório Técnico',
    description: 'Entrega de book completo com viabilidade, margem, fornecedores, riscos',
    category: 'import',
    basePrice: 2900,
    type: 'fixed',
    duration: '1 semana',
    deliverables: [
      'Book completo de viabilidade',
      'Análise de margem detalhada',
      'Catálogo de fornecedores',
      'Matriz de riscos',
      'PDF + dashboard interativo',
      'Relatório executivo'
    ],
    inputs: [
      makeSelect('tipo_relatorio', 'Tipo de relatório', [
        { value: 'basico', label: 'Básico' },
        { value: 'executivo', label: 'Executivo' },
        { value: 'completo', label: 'Completo' },
        { value: 'premium', label: 'Premium' }
      ], 'executivo'),
      makeCheckbox('dashboard_interativo', 'Dashboard interativo', 1200, true),
      makeCheckbox('pdf_editavel', 'PDF editável', 800, true),
      makeCheckbox('apresentacao_executiva', 'Apresentação executiva', 1500, false),
      makeCheckbox('video_explicativo', 'Vídeo explicativo', 2000, false)
    ],
    calculate: (values: Record<string, any>) => {
      const base = 2900;
      const tipoMultiplier = { basico: 0.8, executivo: 1, completo: 1.3, premium: 1.5 };
      const multiplier = tipoMultiplier[values.tipo_relatorio as keyof typeof tipoMultiplier] || 1;
      
      const dashboard = values.dashboard_interativo ? 1200 : 0;
      const pdf = values.pdf_editavel ? 800 : 0;
      const apresentacao = values.apresentacao_executiva ? 1500 : 0;
      const video = values.video_explicativo ? 2000 : 0;
      
      const total = (base * multiplier) + dashboard + pdf + apresentacao + video;
      
      return {
        total: Math.round(total),
        breakdown: {
          base: Math.round(base * multiplier),
          dashboard,
          pdf,
          apresentacao,
          video
        }
      };
    }
  }
];

// Serviços adicionais opcionais
export const servicosAdicionais: ServiceConfig[] = [
  {
    id: 'add_marca',
    name: 'Registro de Marca no Brasil + China',
    description: 'Integração com INPI e China IP',
    category: 'import',
    basePrice: 1990,
    type: 'fixed',
    duration: '6 meses',
    deliverables: [
      'Registro no INPI',
      'Registro na China IP',
      'Acompanhamento do processo',
      'Documentação completa'
    ],
    inputs: [
      makeSelect('tipo_marca', 'Tipo de marca', [
        { value: 'produto', label: 'Produto' },
        { value: 'servico', label: 'Serviço' },
        { value: 'ambos', label: 'Produto e Serviço' }
      ], 'produto')
    ],
    calculate: (values: Record<string, any>) => ({
      total: 1990,
      breakdown: { registro: 1990 }
    })
  },
  
  {
    id: 'add_li',
    name: 'Análise Técnica de LI ANVISA ou MAPA',
    description: '72h com parecer técnico',
    category: 'import',
    basePrice: 790,
    type: 'fixed',
    duration: '72h',
    deliverables: [
      'Análise técnica completa',
      'Parecer técnico',
      'Recomendações',
      'Documentação necessária'
    ],
    inputs: [
      makeSelect('orgao', 'Órgão regulador', [
        { value: 'anvisa', label: 'ANVISA' },
        { value: 'mapa', label: 'MAPA' }
      ], 'anvisa')
    ],
    calculate: (values: Record<string, any>) => ({
      total: 790,
      breakdown: { analise: 790 }
    })
  },
  
  {
    id: 'add_contrato',
    name: 'Contrato internacional bilíngue (INCOTERMS® 2020)',
    description: 'PDF editável + cláusulas revisadas',
    category: 'import',
    basePrice: 1150,
    type: 'fixed',
    duration: '1 semana',
    deliverables: [
      'Contrato bilíngue',
      'Cláusulas INCOTERMS® 2020',
      'PDF editável',
      'Revisão jurídica'
    ],
    inputs: [
      makeSelect('incoterm', 'INCOTERM principal', [
        { value: 'fob', label: 'FOB' },
        { value: 'cif', label: 'CIF' },
        { value: 'ddp', label: 'DDP' },
        { value: 'exw', label: 'EXW' }
      ], 'fob')
    ],
    calculate: (values: Record<string, any>) => ({
      total: 1150,
      breakdown: { contrato: 1150 }
    }))
  }
]; 