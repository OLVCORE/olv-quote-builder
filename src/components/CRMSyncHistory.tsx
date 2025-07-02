"use client";
import React, { useState, useEffect } from 'react';
import { FaSync, FaCheck, FaTimes } from 'react-icons/fa';

interface SyncRecord {
  id: string;
  timestamp: string;
  crmType: string;
  contactName: string;
  dealTitle: string;
  amount: number;
  currency: string;
  status: 'success' | 'error' | 'pending';
  contactId?: string;
  dealId?: string;
  error?: string;
}

export default function CRMSyncHistory() {
  const [syncHistory, setSyncHistory] = useState<SyncRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('crm_sync_history');
    if (saved) {
      try {
        setSyncHistory(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const clearHistory = () => {
    if (confirm('Deseja limpar todo o histórico de sincronizações?')) {
      setSyncHistory([]);
      localStorage.removeItem('crm_sync_history');
    }
  };

  return (
    <div className="bg-white dark:bg-bg-dark-tertiary rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Histórico de Sincronizações</h3>
        <button onClick={clearHistory} className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">Limpar Histórico</button>
      </div>
      {syncHistory.length === 0 ? (
        <div className="text-center py-8">
          <FaSync className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma sincronização</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">As sincronizações com CRM aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-4">
          {syncHistory.map((record) => (
            <div key={record.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {record.status === 'success' && <FaCheck className="text-green-500" />} 
                    {record.status === 'error' && <FaTimes className="text-red-500" />} 
                    {record.status === 'pending' && <FaSync className="text-yellow-500 animate-spin" />} 
                    <span className={`text-sm font-medium ${record.status === 'success' ? 'text-green-600 dark:text-green-400' : record.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{record.status}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(record.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600 dark:text-gray-400">CRM:</span> <span className="ml-2 text-gray-900 dark:text-white capitalize">{record.crmType}</span></div>
                    <div><span className="text-gray-600 dark:text-gray-400">Valor:</span> <span className="ml-2 text-gray-900 dark:text-white font-medium">{record.amount} {record.currency}</span></div>
                    <div><span className="text-gray-600 dark:text-gray-400">Contato:</span> <span className="ml-2 text-gray-900 dark:text-white">{record.contactName}</span></div>
                    <div><span className="text-gray-600 dark:text-gray-400">Proposta:</span> <span className="ml-2 text-gray-900 dark:text-white">{record.dealTitle}</span></div>
                  </div>
                  {record.contactId && record.dealId && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Contact ID: {record.contactId}</span>
                      <span className="mx-2">•</span>
                      <span>Deal ID: {record.dealId}</span>
                    </div>
                  )}
                  {record.error && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">{record.error}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function addSyncRecordToHistory(record: Omit<SyncRecord, 'id' | 'timestamp'>) {
  const saved = localStorage.getItem('crm_sync_history');
  let history: SyncRecord[] = [];
  if (saved) {
    try { history = JSON.parse(saved); } catch {}
  }
  const newRecord: SyncRecord = {
    ...record,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  const updatedHistory = [newRecord, ...history.slice(0, 49)];
  localStorage.setItem('crm_sync_history', JSON.stringify(updatedHistory));
} 