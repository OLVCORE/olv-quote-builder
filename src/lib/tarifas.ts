export interface TarifaItem {
  item: string;
  descricao: string;
  valor: string;
  condicoes: string;
  observacoes?: string;
}

export interface TabelaTarifas {
  titulo: string;
  subtitulo?: string;
  items: TarifaItem[];
  observacoesGerais?: string[];
}

export const TABELAS_TARIFAS: Record<string, TabelaTarifas> = {
  'pme-comex': {
    titulo: 'PME COMEX Ready - Tabela de Tarifas',
    subtitulo: 'Internacionalização em 90 dias com baixo risco',
    items: [
      {
        item: 'Diagnóstico 360º',
        descricao: 'Análise completa de viabilidade e oportunidades',
        valor: 'R$ 1.900',
        condicoes: 'Incluso no pacote base',
        observacoes: 'Relatório executivo com roadmap de 90 dias'
      },
      {
        item: 'Habilitação RADAR Expresso',
        descricao: 'Processo acelerado de habilitação Siscomex',
        valor: 'R$ 3.200',
        condicoes: 'Prazo: 15 dias úteis',
        observacoes: 'Inclui assessoria completa e documentação'
      },
      {
        item: 'Onboarding Freight',
        descricao: 'Configuração e treinamento em sistemas de frete',
        valor: 'R$ 1.900',
        condicoes: '2 sessões de 4h cada',
        observacoes: 'Inclui acesso aos principais marketplaces'
      },
      {
        item: 'Template Contrato Internacional',
        descricao: 'Modelo personalizado para operações internacionais',
        valor: 'R$ 490',
        condicoes: 'Revisão jurídica inclusa',
        observacoes: 'Adaptável ao seu segmento e modal'
      },
      {
        item: 'Sistema CORE + Dashboard',
        descricao: 'Plataforma de gestão COMEX integrada',
        valor: 'R$ 980',
        condicoes: 'Licença anual inclusa',
        observacoes: 'Integração com principais sistemas'
      },
      {
        item: 'Embarques Assistidos',
        descricao: 'Acompanhamento completo de embarques',
        valor: 'R$ 2.500/embarque',
        condicoes: 'Mínimo 3 embarques',
        observacoes: 'Inclui documentação e follow-up'
      },
      {
        item: 'Plano PME Growth',
        descricao: 'Suporte continuado mensal',
        valor: 'R$ 5.000/mês',
        condicoes: 'Contrato mínimo 12 meses',
        observacoes: 'Inclui consultoria e monitoramento'
      },
      {
        item: 'Plano Ad-hoc',
        descricao: 'Horas avulsas de especialistas',
        valor: 'R$ 450/hora',
        condicoes: 'Pacotes de 10h ou 20h',
        observacoes: 'Especialistas certificados'
      }
    ],
    observacoesGerais: [
      'Todos os valores são em Reais (BRL) e não incluem impostos',
      'Prazo de implementação: 90 dias corridos',
      'Garantia de satisfação: 30 dias após conclusão',
      'Suporte técnico: 8h às 18h, segunda a sexta'
    ]
  },

  'comex-on-demand': {
    titulo: 'Especialistas COMEX On-Demand - Tabela de Tarifas',
    subtitulo: 'Força-tarefa para destravar operações urgentes',
    items: [
      {
        item: 'SLA Start',
        descricao: 'Resposta em até 4 horas',
        valor: 'R$ 390/hora',
        condicoes: 'Horário comercial (8h-18h)',
        observacoes: 'Especialista nível pleno'
      },
      {
        item: 'SLA Pro',
        descricao: 'Resposta em até 2 horas',
        valor: 'R$ 490/hora',
        condicoes: 'Plantão estendido (6h-22h)',
        observacoes: 'Especialista sênior + backup'
      },
      {
        item: 'SLA Critical',
        descricao: 'Resposta em até 1 hora + hotline',
        valor: 'R$ 650/hora',
        condicoes: 'Plantão 24h',
        observacoes: 'Especialista sênior + gerente de conta'
      },
      {
        item: 'Representação Legal',
        descricao: 'Atuação administrativa e legal',
        valor: 'R$ 400/ocorrência',
        condicoes: 'Prazo: 24h para resposta',
        observacoes: 'Advogado especializado em COMEX'
      },
      {
        item: 'Parecer Jurídico',
        descricao: 'Relatório com análise jurídica',
        valor: 'R$ 350/documento',
        condicoes: 'Prazo: 48h para entrega',
        observacoes: 'Inclui recomendações práticas'
      }
    ],
    observacoesGerais: [
      'Cobrança por hora efetiva de trabalho',
      'Relatório ISO 9001 incluso em todos os serviços',
      'Handover com checklist de ações',
      'Garantia de resolução ou devolução proporcional'
    ]
  },

  '3pl-turnkey': {
    titulo: 'Logística 3PL Turnkey - Tabela de Tarifas',
    subtitulo: 'Solução completa de armazenagem e transporte',
    items: [
      {
        item: 'Retainer Mensal',
        descricao: 'Custo fixo de operação',
        valor: 'R$ 7.000/mês',
        condicoes: 'Inclui estrutura básica',
        observacoes: 'Independente do volume'
      },
      {
        item: 'Taxa Variável',
        descricao: 'Percentual sobre valor CIF',
        valor: '1,2% do CIF mensal',
        condicoes: 'Mínimo R$ 1.000/mês',
        observacoes: 'Aplicável sobre mercadorias'
      },
      {
        item: 'Armazenagem Bonded',
        descricao: 'Estocagem em área alfandegada',
        valor: 'R$ 15/m²/mês',
        condicoes: 'OTIF 99% garantido',
        observacoes: 'Inclui seguro básico'
      },
      {
        item: 'Freight Management',
        descricao: 'Gestão de fretes internacionais',
        valor: 'Redução de 8% no frete',
        condicoes: 'RateOptimizer® incluso',
        observacoes: 'Comparativo de 3 cotações'
      },
      {
        item: 'Desembaraço',
        descricao: 'Processo de liberação aduaneira',
        valor: 'R$ 250/declaração',
        condicoes: 'Liberação < 24h',
        observacoes: 'Inclui follow-up completo'
      },
      {
        item: 'Performance Pack',
        descricao: 'Desconto por performance',
        valor: '-15% no total',
        condicoes: 'Volume mínimo 20 TEU/mês',
        observacoes: 'Aplicável após 3 meses'
      },
      {
        item: 'Integração EDI',
        descricao: 'Conexão com sistemas cliente',
        valor: 'R$ 1.500/setup',
        condicoes: 'Prazo: 15 dias úteis',
        observacoes: 'Inclui testes e homologação'
      }
    ],
    observacoesGerais: [
      'Todos os valores são em Reais (BRL) e não incluem impostos',
      'Contrato mínimo: 12 meses',
      'SLA de performance: 99% OTIF',
      'WMS-OLV Cloud incluso no retainer'
    ]
  },

  'end-to-end': {
    titulo: 'Logística Internacional End-to-End - Tabela de Tarifas',
    subtitulo: 'Metodologia OLV 4D - Do diagnóstico à operação',
    items: [
      {
        item: 'Setup Inicial',
        descricao: 'Configuração da operação completa',
        valor: 'R$ 6.500',
        condicoes: 'Prazo: 30 dias úteis',
        observacoes: 'Inclui mapeamento de processos'
      },
      {
        item: 'Retainer Anual',
        descricao: 'Gestão contínua da operação',
        valor: 'R$ 2.900/mês',
        condicoes: 'Contrato anual',
        observacoes: 'Inclui monitoramento 24/7'
      },
      {
        item: 'Integração ERP',
        descricao: 'Conexão com sistema cliente',
        valor: 'R$ 1.500',
        condicoes: 'Prazo: 20 dias úteis',
        observacoes: 'Inclui testes e documentação'
      },
      {
        item: 'Consultoria ESG',
        descricao: 'Adequação ambiental e social',
        valor: 'R$ 900/mês',
        condicoes: 'Relatório mensal',
        observacoes: 'Inclui auditoria e certificação'
      }
    ],
    observacoesGerais: [
      'Metodologia OLV 4D: Diagnóstico, Design, Deploy, Drive',
      'KPI de redução de custos: mínimo 15%',
      'SLA de performance: 99,5%',
      'Suporte dedicado incluído'
    ]
  },

  'in-house': {
    titulo: 'Implantação COMEX In-House - Tabela de Tarifas',
    subtitulo: 'Projeto turnkey em 90 dias',
    items: [
      {
        item: 'Setup Inicial',
        descricao: 'Implantação completa da operação',
        valor: 'R$ 35.000',
        condicoes: 'Prazo: 90 dias corridos',
        observacoes: 'Inclui toda infraestrutura'
      },
      {
        item: 'Fee Anual',
        descricao: 'Gestão e manutenção contínua',
        valor: 'R$ 9.500/mês',
        condicoes: 'Contrato mínimo 24 meses',
        observacoes: 'Inclui suporte dedicado'
      },
      {
        item: 'Bônus Performance',
        descricao: 'Incentivo por resultados',
        valor: 'R$ 5.000/mês',
        condicoes: 'Meta: redução 20% custos',
        observacoes: 'Aplicável após 6 meses'
      },
      {
        item: 'Treinamento Interno',
        descricao: 'Capacitação da equipe',
        valor: 'R$ 2.000',
        condicoes: '20h de treinamento',
        observacoes: 'Inclui material didático'
      },
      {
        item: 'Customização ERP',
        descricao: 'Adaptação do sistema',
        valor: 'R$ 4.500',
        condicoes: 'Prazo: 30 dias úteis',
        observacoes: 'Inclui testes e homologação'
      }
    ],
    observacoesGerais: [
      'Projeto turnkey com garantia de resultado',
      'Equipe dedicada durante implantação',
      'Transferência de conhecimento incluída',
      'SLA de performance: 99,8%'
    ]
  },

  'nova-rota-importacao': {
    titulo: 'Nova Rota de Importação - Tabela de Tarifas',
    subtitulo: 'Modelo OLV em 6 etapas',
    items: [
      {
        item: 'Etapa 1 - Diagnóstico',
        descricao: 'Análise de viabilidade e oportunidade',
        valor: 'R$ 4.500',
        condicoes: 'Prazo: 15 dias úteis',
        observacoes: 'Inclui análise de 3 segmentos'
      },
      {
        item: 'Etapa 2 - Modelagem',
        descricao: 'Definição de cadeia logística',
        valor: 'R$ 3.800',
        condicoes: 'Prazo: 20 dias úteis',
        observacoes: 'Inclui cobertura fiscal otimizada'
      },
      {
        item: 'Etapa 3 - Abertura Canal',
        descricao: 'Interação com parceiros origem',
        valor: 'R$ 5.200',
        condicoes: 'Prazo: 25 dias úteis',
        observacoes: 'Inclui OLV Connecta'
      },
      {
        item: 'Etapa 4 - Estruturação',
        descricao: 'Montagem da operação',
        valor: 'R$ 4.800',
        condicoes: 'Prazo: 30 dias úteis',
        observacoes: 'Inclui documentação completa'
      },
      {
        item: 'Etapa 5 - Validação',
        descricao: 'Testes e homologação',
        valor: 'R$ 3.200',
        condicoes: 'Prazo: 15 dias úteis',
        observacoes: 'Inclui embarque piloto'
      },
      {
        item: 'Etapa 6 - Operação',
        descricao: 'Início da operação comercial',
        valor: 'R$ 2.500',
        condicoes: 'Prazo: 10 dias úteis',
        observacoes: 'Inclui acompanhamento inicial'
      }
    ],
    observacoesGerais: [
      'Modelo exclusivo OLV com garantia de resultado',
      'Prazo total: 115 dias úteis',
      'Inclui exclusividade de rota por 12 meses',
      'Suporte pós-implantação: 6 meses'
    ]
  },

  'consultoria': {
    titulo: 'Consultoria Especializada - Tabela de Tarifas',
    subtitulo: 'Soluções customizadas para desafios específicos',
    items: [
      {
        item: 'Consultoria Estratégica',
        descricao: 'Planejamento de longo prazo',
        valor: 'R$ 800/hora',
        condicoes: 'Mínimo 20h',
        observacoes: 'Consultor sênior'
      },
      {
        item: 'Auditoria COMEX',
        descricao: 'Análise de conformidade',
        valor: 'R$ 650/hora',
        condicoes: 'Prazo: 30 dias úteis',
        observacoes: 'Relatório executivo incluso'
      },
      {
        item: 'Otimização de Custos',
        descricao: 'Redução de despesas operacionais',
        valor: 'R$ 1.200/hora',
        condicoes: 'Meta: redução 15%',
        observacoes: 'Inclui implementação'
      },
      {
        item: 'Compliance Digital',
        descricao: 'Adequação à LGPD e regulamentações',
        valor: 'R$ 950/hora',
        condicoes: 'Prazo: 45 dias úteis',
        observacoes: 'Certificação inclusa'
      }
    ],
    observacoesGerais: [
      'Consultores certificados e experientes',
      'Relatórios executivos inclusos',
      'Acompanhamento pós-consultoria',
      'Garantia de satisfação'
    ]
  },

  'servicos-adicionais': {
    titulo: 'Serviços Adicionais - Tabela de Tarifas',
    subtitulo: 'Soluções complementares para operações COMEX',
    items: [
      {
        item: 'Certificação ISO 9001',
        descricao: 'Implementação de qualidade',
        valor: 'R$ 12.000',
        condicoes: 'Prazo: 6 meses',
        observacoes: 'Inclui auditoria e certificação'
      },
      {
        item: 'Treinamento Especializado',
        descricao: 'Capacitação em COMEX',
        valor: 'R$ 350/hora',
        condicoes: 'Mínimo 8h',
        observacoes: 'Material didático incluso'
      },
      {
        item: 'Software COMEX',
        descricao: 'Licença de sistema especializado',
        valor: 'R$ 1.200/mês',
        condicoes: 'Contrato anual',
        observacoes: 'Inclui suporte técnico'
      },
      {
        item: 'Seguro Cargo',
        descricao: 'Cobertura de riscos',
        valor: '0,8% do valor da mercadoria',
        condicoes: 'Cobertura total',
        observacoes: 'Inclui assistência 24h'
      }
    ],
    observacoesGerais: [
      'Serviços complementares aos principais',
      'Descontos para clientes OLV',
      'Personalização conforme necessidade',
      'Suporte técnico incluído'
    ]
  }
};

export function getTabelaTarifas(serviceSlug: string): TabelaTarifas | null {
  return TABELAS_TARIFAS[serviceSlug] || null;
}
