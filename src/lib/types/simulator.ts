export type Currency = 'BRL' | 'USD' | 'EUR' | 'CNY';

export type InputFieldType = 'number' | 'select' | 'checkbox';

export interface InputFieldOption {
  value: string;
  label: string;
}

export interface InputField {
  key: string;
  label: string;
  type: InputFieldType;
  default: number | string | boolean;
  min?: number;
  max?: number;
  multiplier?: number;
  options?: InputFieldOption[];
}

export type ServiceType = 'fixed' | 'variable' | 'mixed' | 'hourly' | 'setup_monthly' | 'tiered' | 'monthly';

export interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  category: 'comex' | 'logistics' | 'import' | 'export';
  basePrice: number;
  type: ServiceType;
  duration: string;
  deliverables: string[];
  inputs: InputField[];
  calculate: (values: Record<string, any>) => {
    total: number;
    breakdown: Record<string, number>;
  };
}

export interface CalculationItem {
  id: string;
  name: string;
  description: string;
  valueBRL: number;
  valueForeign: number;
  duration: string;
  type: ServiceType;
  breakdown: Record<string, number>;
}

export interface CalculationResult {
  items: CalculationItem[];
  totalBRL: number;
  totalForeign: number;
  totalDuration: string;
  currency: Currency;
  exchangeRate: number;
}

export interface ClientData {
  nome: string;
  email: string;
  empresa: string;
  cnpj: string;
  telefone?: string;
  setor?: string;
  nicho?: string;
  produto_interesse?: string;
  investimento_inicial?: number;
  previsao_inicio?: string;
  observacoes?: string;
}

export interface ProposalData {
  id: string;
  clientData: ClientData;
  calculations: CalculationResult;
  selectedServices: string[];
  createdAt: Date;
  expiresAt: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

export interface ExchangeRates {
  BRL: number;
  USD: number;
  EUR: number;
  CNY: number;
}

export interface SimulatorState {
  selectedServices: Set<string>;
  formData: Record<string, any>;
  calculations: CalculationResult | null;
  currency: Currency;
  exchangeRates: ExchangeRates;
  clientData: Partial<ClientData>;
  isLoading: boolean;
  error: string | null;
}

export type UF =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA'
  | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN'
  | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface TaxConfig {
  name: string;
  code: string;
  description: string;
  defaultRate: number;
  ufRates?: Partial<Record<UF, number>>;
  enabled: boolean;
}

export interface SelectedTax {
  code: string;
  rate: number;
  enabled: boolean;
}

export interface UniversalItem {
  id: string;
  label: string;
  value: number;
  type: 'percent' | 'fixed';
  description?: string;
}

export interface ProposalTaxes {
  uf: UF;
  taxes: SelectedTax[];
  subtotal: number;
  total: number;
}

export interface ProposalUniversal {
  items: UniversalItem[];
  subtotal: number;
}

export type TipoSimulacao = 'servico' | 'produto';

export type RegimeTributario = 'simples' | 'presumido' | 'real';

export interface ItemSimulacao {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  quantidade: number;
  custoUnitario: number;
  precoUnitario: number;
  unidade?: string;
}

export interface ImpostoSimulacao {
  id: string;
  nome: string;
  percentual: number;
  valor: number;
  tipo: 'federal' | 'estadual' | 'municipal';
  codigo?: string; // NCM, CNAE, etc
}

export interface DespesaSimulacao {
  id: string;
  nome: string;
  valor: number;
  tipo: 'fixa' | 'variavel';
}

export interface Simulacao {
  id: string;
  tipo: TipoSimulacao;
  nome: string;
  descricao?: string;
  itens: ItemSimulacao[];
  impostos: ImpostoSimulacao[];
  despesas: DespesaSimulacao[];
  markup: number;
  precoCusto: number;
  precoVenda: number;
  margemBruta: number;
  margemLiquida: number;
  regimeTributario: RegimeTributario;
  ncmOuCnae?: string;
  criadoEm: string;
  atualizadoEm: string;
} 