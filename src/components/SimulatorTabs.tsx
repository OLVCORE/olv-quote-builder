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
        <Tabs.List className="flex border-b mb-4 overflow-auto">
          {allServices.map((svc) => (
            <Tabs.Trigger
              key={svc.slug}
              value={svc.slug}
              className="px-4 py-2 whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:border-emerald-600"
            >
              {svc.name}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {allServices.map((svc) => (
          <Tabs.Content key={svc.slug} value={svc.slug} className="pt-4">
            <ServiceForm config={svc} />
          </Tabs.Content>
        ))}
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