import { useState, useEffect } from 'react';
import { CRMConfig, CRMContact, CRMDeal } from './crmIntegration';

interface CRMSyncResult {
  contactId: string;
  dealId: string;
}

interface UseCRMReturn {
  config: CRMConfig | null;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  testConnection: () => Promise<boolean>;
  syncQuote: (contact: CRMContact, deal: CRMDeal) => Promise<CRMSyncResult>;
  saveConfig: (config: CRMConfig) => void;
  clearConfig: () => void;
}

export function useCRM(): UseCRMReturn {
  const [config, setConfig] = useState<CRMConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load config from localStorage on mount
    const savedConfig = localStorage.getItem('crm_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (error) {
        console.error('Error loading CRM config:', error);
        setError('Erro ao carregar configuração do CRM');
      }
    }
  }, []);

  const isConfigured = config !== null;

  const testConnection = async (): Promise<boolean> => {
    if (!config) {
      setError('CRM não configurado');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        type: config.type,
        apiKey: config.apiKey,
        ...(config.baseUrl && { baseUrl: config.baseUrl })
      });

      const response = await fetch(`/api/crm/sync?${params}`);
      const data = await response.json();

      if (response.ok) {
        return true;
      } else {
        setError(data.error || 'Erro ao testar conexão');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro de conexão: ${errorMessage}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const syncQuote = async (contact: CRMContact, deal: CRMDeal): Promise<CRMSyncResult> => {
    if (!config) {
      throw new Error('CRM não configurado');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/crm/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crmConfig: config,
          contact,
          deal
        })
      });

      const data = await response.json();

      if (response.ok) {
        return data.data;
      } else {
        throw new Error(data.error || 'Erro ao sincronizar com CRM');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro de sincronização: ${errorMessage}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = (newConfig: CRMConfig) => {
    try {
      localStorage.setItem('crm_config', JSON.stringify(newConfig));
      setConfig(newConfig);
      setError(null);
    } catch (error) {
      setError('Erro ao salvar configuração');
    }
  };

  const clearConfig = () => {
    try {
      localStorage.removeItem('crm_config');
      setConfig(null);
      setError(null);
    } catch (error) {
      setError('Erro ao limpar configuração');
    }
  };

  return {
    config,
    isConfigured,
    isLoading,
    error,
    testConnection,
    syncQuote,
    saveConfig,
    clearConfig
  };
} 