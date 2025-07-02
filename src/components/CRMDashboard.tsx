"use client";
import React, { useState, useEffect } from 'react';
import { FaSync, FaCheck, FaTimes, FaChartLine, FaUsers, FaDollarSign } from 'react-icons/fa';

interface SyncStats {
  total: number;
  success: number;
  error: number;
  pending: number;
  totalValue: number;
  averageValue: number;
  topCRM: string;
  recentActivity: number;
}

export default function CRMDashboard() {
  const [stats, setStats] = useState<SyncStats>({
    total: 0,
    success: 0,
    error: 0,
    pending: 0,
    totalValue: 0,
    averageValue: 0,
    topCRM: '',
    recentActivity: 0
  });

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const saved = localStorage.getItem('crm_sync_history');
    if (!saved) return;

    try {
      const history = JSON.parse(saved);
      
      const total = history.length;
      const success = history.filter((h: any) => h.status === 'success').length;
      const error = history.filter((h: any) => h.status === 'error').length;
      const pending = history.filter((h: any) => h.status === 'pending').length;
      
      const totalValue = history
        .filter((h: any) => h.status === 'success')
        .reduce((sum: number, h: any) => sum + (h.amount || 0), 0);
      
      const averageValue = success > 0 ? totalValue / success : 0;
      
      // Count CRM types
      const crmCounts: Record<string, number> = {};
      history.forEach((h: any) => {
        crmCounts[h.crmType] = (crmCounts[h.crmType] || 0) + 1;
      });
      
      const topCRM = Object.entries(crmCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
      
      // Recent activity (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentActivity = history.filter((h: any) => 
        new Date(h.timestamp) > weekAgo
      ).length;

      setStats({
        total,
        success,
        error,
        pending,
        totalValue,
        averageValue,
        topCRM,
        recentActivity
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getSuccessRate = () => {
    return stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0;
  };

  const StatCard = ({ title, value, icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Dashboard CRM
        </h3>
        <button
          onClick={calculateStats}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Sincronizações"
          value={stats.total}
          icon={<FaSync className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        
        <StatCard
          title="Taxa de Sucesso"
          value={`${getSuccessRate()}%`}
          icon={<FaCheck className="h-6 w-6 text-white" />}
          color="bg-green-500"
          subtitle={`${stats.success} de ${stats.total}`}
        />
        
        <StatCard
          title="Valor Total"
          value={formatCurrency(stats.totalValue)}
          icon={<FaDollarSign className="h-6 w-6 text-white" />}
          color="bg-purple-500"
          subtitle={`Média: ${formatCurrency(stats.averageValue)}`}
        />
        
        <StatCard
          title="Atividade Recente"
          value={stats.recentActivity}
          icon={<FaChartLine className="h-6 w-6 text-white" />}
          color="bg-orange-500"
          subtitle="Últimos 7 dias"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Status das Sincronizações
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Sucesso</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {stats.success}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Erro</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {stats.error}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Pendente</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {stats.pending}
              </span>
            </div>
          </div>
        </div>

        {/* CRM Usage */}
        <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            CRM Mais Utilizado
          </h4>
          <div className="flex items-center">
            <FaUsers className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                {stats.topCRM || 'Nenhum'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                CRM com mais sincronizações
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance dos Últimos 30 Dias
        </h4>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <FaChartLine className="h-12 w-12 mx-auto mb-2" />
            <p>Gráfico de performance será implementado em breve</p>
          </div>
        </div>
      </div>
    </div>
  );
} 