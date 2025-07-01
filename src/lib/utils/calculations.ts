import { ServiceConfig, CalculationResult, CalculationItem, Currency, ExchangeRates } from '../types/simulator';
import { comeServices } from '../services/comeServices';
import { novaRotaImportacaoServices, servicosAdicionais } from '../services/novaRotaImportacao';

// Função para obter todos os serviços disponíveis
export const getAllServices = (): ServiceConfig[] => {
  return [...comeServices, ...novaRotaImportacaoServices, ...servicosAdicionais];
};

// Função para buscar serviço por ID
export const getServiceById = (serviceId: string): ServiceConfig | undefined => {
  const allServices = getAllServices();
  return allServices.find(service => service.id === serviceId);
};

// Função para converter valores entre moedas
export const convertCurrency = (value: number, fromCurrency: Currency, toCurrency: Currency, rates: ExchangeRates): number => {
  if (fromCurrency === toCurrency) return value;
  
  // Converter para BRL primeiro (moeda base)
  const valueInBRL = fromCurrency === 'BRL' ? value : value * rates[fromCurrency];
  
  // Converter de BRL para moeda destino
  return toCurrency === 'BRL' ? valueInBRL : valueInBRL / rates[toCurrency];
};

// Função para calcular duração total
export const calculateTotalDuration = (items: CalculationItem[]): string => {
  const durations = items.map(item => {
    const duration = item.duration;
    if (duration.includes('dias')) {
      return parseInt(duration.match(/\d+/)?.[0] || '0');
    } else if (duration.includes('semanas')) {
      return parseInt(duration.match(/\d+/)?.[0] || '0') * 7;
    } else if (duration.includes('meses')) {
      return parseInt(duration.match(/\d+/)?.[0] || '0') * 30;
    }
    return 0;
  });
  
  const totalDays = durations.reduce((sum, days) => sum + days, 0);
  
  if (totalDays >= 365) {
    const years = Math.floor(totalDays / 365);
    const remainingDays = totalDays % 365;
    return `${years} ano${years > 1 ? 's' : ''}${remainingDays > 0 ? ` e ${remainingDays} dias` : ''}`;
  } else if (totalDays >= 30) {
    const months = Math.floor(totalDays / 30);
    const remainingDays = totalDays % 30;
    return `${months} mes${months > 1 ? 'es' : ''}${remainingDays > 0 ? ` e ${remainingDays} dias` : ''}`;
  } else if (totalDays >= 7) {
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;
    return `${weeks} semana${weeks > 1 ? 's' : ''}${remainingDays > 0 ? ` e ${remainingDays} dias` : ''}`;
  } else {
    return `${totalDays} dia${totalDays > 1 ? 's' : ''}`;
  }
};

// Função principal de cálculo
export const calculateTotal = (
  selectedServices: Set<string>,
  formData: Record<string, any>,
  currency: Currency,
  rates: ExchangeRates
): CalculationResult => {
  let totalBRL = 0;
  let items: CalculationItem[] = [];
  
  selectedServices.forEach(serviceId => {
    const service = getServiceById(serviceId);
    if (!service) return;
    
    const itemCalculation = calculateServiceItem(service, formData);
    
    totalBRL += itemCalculation.valueBRL;
    items.push(itemCalculation);
  });
  
  const totalForeign = currency === 'BRL' ? totalBRL : convertCurrency(totalBRL, 'BRL', currency, rates);
  
  return {
    items,
    totalBRL,
    totalForeign,
    totalDuration: calculateTotalDuration(items),
    currency,
    exchangeRate: rates[currency] || 1
  };
};

// Função para calcular item individual
const calculateServiceItem = (service: ServiceConfig, formData: Record<string, any>): CalculationItem => {
  const result = service.calculate(formData);
  const valueBRL = result.total;
  
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    valueBRL,
    valueForeign: valueBRL, // Será convertido no componente principal
    duration: service.duration,
    type: service.type,
    breakdown: result.breakdown
  };
};

// Função para aplicar descontos
export const applyDiscounts = (
  total: number,
  discountPercentage: number = 0,
  discountAmount: number = 0
): { finalTotal: number; discountApplied: number } => {
  const percentageDiscount = total * (discountPercentage / 100);
  const totalDiscount = percentageDiscount + discountAmount;
  const finalTotal = Math.max(0, total - totalDiscount);
  
  return {
    finalTotal,
    discountApplied: totalDiscount
  };
};

// Função para calcular ROI estimado
export const calculateROI = (
  investment: number,
  monthlyRevenue: number,
  monthlyCosts: number,
  months: number = 12
): {
  totalInvestment: number;
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  roiPercentage: number;
  paybackMonths: number;
} => {
  const totalInvestment = investment;
  const totalRevenue = monthlyRevenue * months;
  const totalCosts = monthlyCosts * months;
  const netProfit = totalRevenue - totalCosts - totalInvestment;
  const roiPercentage = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
  const paybackMonths = monthlyRevenue > monthlyCosts ? 
    totalInvestment / (monthlyRevenue - monthlyCosts) : Infinity;
  
  return {
    totalInvestment,
    totalRevenue,
    totalCosts,
    netProfit,
    roiPercentage,
    paybackMonths
  };
};

// Função para formatar valores monetários
export const formatCurrency = (value: number, currency: Currency): string => {
  const formatters: Record<Currency, Intl.NumberFormat> = {
    BRL: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
    CNY: new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' })
  };
  
  return formatters[currency].format(value);
};

// Função para validar dados do formulário
export const validateFormData = (formData: Record<string, any>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validações básicas
  if (!formData.nome || formData.nome.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }
  
  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push('E-mail inválido');
  }
  
  if (!formData.empresa || formData.empresa.trim().length < 2) {
    errors.push('Empresa deve ter pelo menos 2 caracteres');
  }
  
  if (!formData.cnpj || formData.cnpj.replace(/\D/g, '').length !== 14) {
    errors.push('CNPJ deve ter 14 dígitos');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Função para gerar ID único de proposta
export const generateProposalId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `OLV-${timestamp}-${random}`.toUpperCase();
};

// Função para calcular economia estimada
export const calculateSavings = (
  currentCost: number,
  newCost: number
): { savings: number; percentage: number } => {
  const savings = currentCost - newCost;
  const percentage = currentCost > 0 ? (savings / currentCost) * 100 : 0;
  
  return {
    savings: Math.max(0, savings),
    percentage: Math.max(0, percentage)
  };
}; 