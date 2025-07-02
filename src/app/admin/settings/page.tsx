"use client";
import React from 'react';
import CRMSettings from '@/components/CRMSettings';
import CRMSyncHistory from '@/components/CRMSyncHistory';
import CRMDashboard from '@/components/CRMDashboard';
import { CRMConfig } from '@/lib/crmIntegration';

export default function SettingsPage() {
  const handleCRMConfigChange = (config: CRMConfig | null) => {
    console.log('CRM config changed:', config);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Configurações
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie as configurações do sistema e integrações
          </p>
        </div>

        <div className="space-y-8">
          {/* CRM Dashboard */}
          <CRMDashboard />

          {/* CRM Settings */}
          <CRMSettings onConfigChange={handleCRMConfigChange} />

          {/* CRM Sync History */}
          <CRMSyncHistory />

          {/* Other Settings */}
          <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Configurações Gerais
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moeda Padrão
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="BRL">Real Brasileiro (BRL)</option>
                  <option value="USD">Dólar Americano (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="CNY">Yuan Chinês (CNY)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fuso Horário
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                  <option value="America/New_York">Nova York (GMT-5)</option>
                  <option value="Europe/London">Londres (GMT+0)</option>
                  <option value="Asia/Shanghai">Xangai (GMT+8)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Idioma
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                  <option value="zh-CN">中文</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifications"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Ativar notificações por e-mail
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="backup"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="backup" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Backup automático diário
                </label>
              </div>
            </div>

            <div className="mt-6">
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors">
                Salvar Configurações
              </button>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Informações do Sistema
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Versão:</span>
                <span className="ml-2 text-gray-900 dark:text-white">1.0.0</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Última atualização:</span>
                <span className="ml-2 text-gray-900 dark:text-white">02/07/2025</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="ml-2 text-green-600 dark:text-green-400">Online</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Modo:</span>
                <span className="ml-2 text-gray-900 dark:text-white">Produção</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 