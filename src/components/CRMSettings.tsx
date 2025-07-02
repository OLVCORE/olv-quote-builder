"use client";
import React, { useState, useEffect } from 'react';
import { CRMConfig, validateCRMConfig } from '@/lib/crmIntegration';
import { useCRM } from '@/lib/useCRM';

interface CRMSettingsProps {
  onConfigChange: (config: CRMConfig | null) => void;
}

export default function CRMSettings({ onConfigChange }: CRMSettingsProps) {
  const { config, isConfigured, isLoading, error, testConnection, saveConfig, clearConfig } = useCRM();
  const [localConfig, setLocalConfig] = useState<CRMConfig>({
    type: 'hubspot',
    apiKey: '',
    baseUrl: '',
    customFields: {}
  });
  const [isValid, setIsValid] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  useEffect(() => {
    const valid = validateCRMConfig(localConfig);
    setIsValid(valid);
    onConfigChange(valid ? localConfig : null);
  }, [localConfig, onConfigChange]);

  const handleSave = () => {
    saveConfig(localConfig);
    alert('Configuração do CRM salva com sucesso!');
  };

  const handleTest = async () => {
    setTestResult('idle');
    setTestMessage('');

    try {
      const success = await testConnection();
      
      if (success) {
        setTestResult('success');
        setTestMessage('Conexão com CRM estabelecida com sucesso!');
      } else {
        setTestResult('error');
        setTestMessage(error || 'Erro na conexão');
      }
    } catch (error) {
      setTestResult('error');
      setTestMessage(`Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleClear = () => {
    if (confirm('Deseja limpar a configuração do CRM?')) {
      clearConfig();
      setLocalConfig({
        type: 'hubspot',
        apiKey: '',
        baseUrl: '',
        customFields: {}
      });
    }
  };

  return (
    <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Configuração de CRM
      </h3>

      <div className="space-y-4">
        {/* CRM Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de CRM
          </label>
          <select
            value={localConfig.type}
            onChange={(e) => setLocalConfig(prev => ({ ...prev, type: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="hubspot">HubSpot</option>
            <option value="salesforce">Salesforce</option>
            <option value="pipedrive">Pipedrive</option>
          </select>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={localConfig.apiKey}
            onChange={(e) => setLocalConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            placeholder="Digite sua API Key"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Base URL (for Salesforce) */}
        {localConfig.type === 'salesforce' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL Base (Salesforce Instance)
            </label>
            <input
              type="url"
              value={localConfig.baseUrl}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
              placeholder="https://your-instance.salesforce.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Exemplo: https://your-instance.salesforce.com
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Como obter a API Key:
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            {localConfig.type === 'hubspot' && (
              <>
                <p>• Acesse o HubSpot Developer Portal</p>
                <p>• Crie um Private App</p>
                <p>• Copie o Access Token gerado</p>
              </>
            )}
            {localConfig.type === 'salesforce' && (
              <>
                <p>• Acesse Setup &gt; Users &gt; Profile</p>
                <p>• Crie um Connected App</p>
                <p>• Configure OAuth e copie o Access Token</p>
              </>
            )}
            {localConfig.type === 'pipedrive' && (
              <>
                <p>• Acesse Settings &gt; Personal Preferences</p>
                <p>• Vá para API &gt; Personal API Tokens</p>
                <p>• Gere um novo token</p>
              </>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isValid ? 'Configuração válida' : 'Configuração inválida'}
          </span>
        </div>

        {/* Test Result */}
        {testResult !== 'idle' && (
          <div className={`p-3 rounded-md ${
            testResult === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className={`text-sm ${
              testResult === 'success' 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {testMessage}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            Salvar Configuração
          </button>
          <button
            onClick={handleTest}
            disabled={!isValid || isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            {isLoading ? 'Testando...' : 'Testar Conexão'}
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
} 