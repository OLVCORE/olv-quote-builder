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

  // Lista de abas (garantir espaço para 8 serviços)
  const tabList = [
    { value: 'pme-comex', label: 'PME COMEX Ready' },
    { value: 'comex-on-demand', label: 'COMEX On-Demand' },
    { value: '3pl-turnkey', label: '3PL Turnkey' },
    { value: 'end-to-end', label: 'End-to-End' },
    { value: 'in-house', label: 'In-House' },
    { value: 'nova-rota-importacao', label: 'Nova Rota de Importação' },
    { value: 'consultoria', label: 'Consultoria Especializada' },
    { value: 'servicos-adicionais', label: 'Serviços Adicionais' },
  ];

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
      <Tabs.Root defaultValue={tabList[0].value} className="w-full">
        <Tabs.List className="flex flex-wrap gap-2 bg-slate-100 dark:bg-olvblue p-2 rounded-xl mb-6 shadow-inner">
          {tabList.map(tab => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="flex-1 min-w-[120px] px-4 py-2 text-base font-semibold rounded-lg shadow-md border border-ourovelho-dark bg-white dark:bg-[#181f33] text-slate-700 dark:text-slate-200 transition-all duration-200 data-[state=active]:bg-olvblue data-[state=active]:text-ourovelho data-[state=active]:shadow-lg data-[state=active]:border-ourovelho-dark data-[state=active]:scale-105 hover:bg-ourovelho/10 dark:hover:bg-ourovelho/20 cursor-pointer"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {/* Conteúdo das abas - exemplo para 8 abas, ajuste conforme necessário */}
        <Tabs.Content value="pme-comex" className="pt-4">
          <ServiceForm config={allServices[0]} />
        </Tabs.Content>
        <Tabs.Content value="comex-on-demand" className="pt-4">
          <ServiceForm config={allServices[1]} />
        </Tabs.Content>
        <Tabs.Content value="3pl-turnkey" className="pt-4">
          <ServiceForm config={allServices[2]} />
        </Tabs.Content>
        <Tabs.Content value="end-to-end" className="pt-4">
          <ServiceForm config={allServices[3]} />
        </Tabs.Content>
        <Tabs.Content value="in-house" className="pt-4">
          <ServiceForm config={allServices[4]} />
        </Tabs.Content>
        <Tabs.Content value="nova-rota-importacao" className="pt-4">
          <ServiceForm config={allServices[5]} />
        </Tabs.Content>
        <Tabs.Content value="consultoria" className="pt-4">
          <ServiceForm config={allServices[6]} />
        </Tabs.Content>
        <Tabs.Content value="servicos-adicionais" className="pt-4">
          <ServiceForm config={allServices[7]} />
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