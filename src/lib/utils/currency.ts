import React from 'react';
import { Currency, ExchangeRates } from '../types/simulator';

// Cache para taxas de câmbio (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000;
let ratesCache: { rates: ExchangeRates; timestamp: number } | null = null;

// Taxas de câmbio padrão (fallback)
const DEFAULT_RATES: ExchangeRates = {
  BRL: 1,
  USD: 0.18, // 1 BRL = 0.18 USD (aproximadamente)
  EUR: 0.17, // 1 BRL = 0.17 EUR (aproximadamente)
  CNY: 1.30  // 1 BRL = 1.30 CNY (aproximadamente)
};

// Função para buscar taxas de câmbio em tempo real
export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    // Verificar cache primeiro
    if (ratesCache && Date.now() - ratesCache.timestamp < CACHE_DURATION) {
      return ratesCache.rates;
    }

    // Tentar API gratuita (exchangerate.host)
    const response = await fetch('https://api.exchangerate.host/latest?base=BRL&symbols=USD,EUR,CNY');
    
    if (response.ok) {
      const data = await response.json();
      
      const rates: ExchangeRates = {
        BRL: 1,
        USD: data.rates?.USD || DEFAULT_RATES.USD,
        EUR: data.rates?.EUR || DEFAULT_RATES.EUR,
        CNY: data.rates?.CNY || DEFAULT_RATES.CNY
      };
      
      // Atualizar cache
      ratesCache = {
        rates,
        timestamp: Date.now()
      };
      
      return rates;
    }
  } catch (error) {
    console.warn('Erro ao buscar taxas de câmbio:', error);
  }
  
  // Fallback para taxas padrão
  return DEFAULT_RATES;
};

// Função para converter valor entre moedas
export const convertValue = (
  value: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: ExchangeRates
): number => {
  if (fromCurrency === toCurrency) return value;
  
  // Converter para BRL primeiro (moeda base)
  const valueInBRL = fromCurrency === 'BRL' ? value : value / rates[fromCurrency];
  
  // Converter de BRL para moeda destino
  return toCurrency === 'BRL' ? valueInBRL : valueInBRL * rates[toCurrency];
};

// Função para formatar moeda
export const formatCurrency = (value: number, currency: Currency): string => {
  const formatters: Record<Currency, Intl.NumberFormat> = {
    BRL: new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    USD: new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    EUR: new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    CNY: new Intl.NumberFormat('zh-CN', { 
      style: 'currency', 
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  };
  
  return formatters[currency].format(value);
};

// Função para obter símbolo da moeda
export const getCurrencySymbol = (currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    BRL: 'R$',
    USD: '$',
    EUR: '€',
    CNY: '¥'
  };
  
  return symbols[currency];
};

// Função para validar se a moeda é válida
export const isValidCurrency = (currency: string): currency is Currency => {
  return ['BRL', 'USD', 'EUR', 'CNY'].includes(currency);
};

// Hook personalizado para taxas de câmbio (para uso em componentes React)
export const useExchangeRates = () => {
  const [rates, setRates] = React.useState<ExchangeRates>(DEFAULT_RATES);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);
        const newRates = await fetchExchangeRates();
        setRates(newRates);
      } catch (err) {
        setError('Erro ao carregar taxas de câmbio');
        console.error('Erro ao buscar taxas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchRates, CACHE_DURATION);
    
    return () => clearInterval(interval);
  }, []);

  return { rates, loading, error };
};

// Função para limpar cache (útil para testes)
export const clearRatesCache = (): void => {
  ratesCache = null;
}; 