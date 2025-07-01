"use client";
import React from 'react';
import { allServices } from '@/lib/services';
import ServiceForm from '@/components/ServiceForm';
import * as Tabs from '@radix-ui/react-tabs';
import { AdminProvider, useAdmin } from './AdminContext';

function TabsWithAdmin() {
  const { admin, enableAdmin } = useAdmin();
  function handleClick() {
    const pwd = prompt('Senha de gerente:');
    if (pwd === 'olvadmin') enableAdmin();
    else alert('Senha incorreta');
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-slate-500">{admin ? 'Modo gerente ativo' : 'Usuário'}</span>
        {!admin && (
          <button onClick={handleClick} className="text-emerald-600 text-sm underline">
            🔒 Admin
          </button>
        )}
      </div>
      <Tabs.Root defaultValue={allServices[0].slug} className="w-full">
        <Tabs.List className="flex space-x-1 bg-slate-100 dark:bg-[#1a2338] p-1 rounded-lg mb-6">
          <Tabs.Trigger
            value="pme-comex"
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-[#141c2f] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            PME COMEX Ready
          </Tabs.Trigger>
          <Tabs.Trigger
            value="comex-on-demand"
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-[#141c2f] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            COMEX On-Demand
          </Tabs.Trigger>
          <Tabs.Trigger
            value="3pl-turnkey"
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-[#141c2f] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            3PL Turnkey
          </Tabs.Trigger>
          <Tabs.Trigger
            value="end-to-end"
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-[#141c2f] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            End-to-End
          </Tabs.Trigger>
          <Tabs.Trigger
            value="in-house"
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-[#141c2f] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            In-House
          </Tabs.Trigger>
          <Tabs.Trigger
            value="nova-rota-importacao"
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-[#141c2f] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm border-l border-slate-300 dark:border-slate-600"
          >
            Nova Rota de Importação
          </Tabs.Trigger>
        </Tabs.List>
        {allServices.map((svc) => (
          <Tabs.Content key={svc.slug} value={svc.slug} className="pt-4">
            <ServiceForm config={svc} />
          </Tabs.Content>
        ))}
        <Tabs.Content value="in-house" className="space-y-4">
          <ServiceForm config={allServices.find((s) => s.slug === 'in-house')!} />
        </Tabs.Content>
        <Tabs.Content value="nova-rota-importacao" className="space-y-4">
          <div className="mb-6 p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-[#1a2338] dark:to-[#141c2f] rounded-xl border-l-4 border-[#d4af37]">
            <h2 className="text-2xl font-bold mb-2 text-[#d4af37]">Domine Sua Rota de Importação</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Pare de importar junto com seus concorrentes. Comece a importar para vencê-los. Transforme sua PME de dependente para dominante com inteligência e exclusividade.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              <strong>Você compartilha sua importação... ou domina sua rota?</strong><br />
              Na OLV Internacional, ajudamos PMEs a sair da dependência de operadores logísticos compartilhados para criar operações exclusivas e blindadas.
            </p>
          </div>
          <div className="grid gap-4">
            {allServices.filter(s => s.slug.startsWith('modelo-olv-')).map((service) => (
              <ServiceForm key={service.slug} config={service} />
            ))}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}

export default function SimulatorTabs() {
  return (
    <AdminProvider>
      <TabsWithAdmin />
    </AdminProvider>
  );
} 