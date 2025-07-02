"use client";
import React, { useState } from 'react';
import { allServices } from '@/lib/services';
import ServiceForm from '@/components/ServiceForm';
import * as Tabs from '@radix-ui/react-tabs';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { AdminProvider } from './AdminContext';

function TabsWithAdmin() {
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
  const [selectedTab, setSelectedTab] = useState(tabList[0].value);
  const selectedServiceIdx = tabList.findIndex(tab => tab.value === selectedTab);
  const selectedService = allServices[selectedServiceIdx];

  // Estado global de moeda/cotação
  const [currency, setCurrency] = useState('BRL');
  const [customRate, setCustomRate] = useState('');
  const [loadingRate, setLoadingRate] = useState(false);
  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);
    setLoadingRate(true);
    if (newCurrency !== 'BRL') {
      try {
        const res = await fetch(`https://api.exchangerate.host/latest?base=BRL&symbols=${newCurrency}`);
        const data = await res.json();
        setCustomRate(data.rates[newCurrency]?.toString() || '');
      } catch {
        setCustomRate('');
      }
    } else {
      setCustomRate('');
    }
    setLoadingRate(false);
  };
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => setCustomRate(e.target.value);

  // Exportação PDF de toda a proposta
  const exportToPDF = () => {
    window.print();
  };
  // Exportação XLSX de toda a proposta (placeholder, implementar integração real se necessário)
  const exportToExcel = () => {
    alert('Exportação XLSX de toda a proposta ainda não implementada.');
  };

  return (
    <>
      <Tabs.Root value={selectedTab} onValueChange={setSelectedTab} className="w-full">
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
        {/* Bloco global de câmbio/ícones ao lado do nome do serviço */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {selectedService && (
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-accent-dark mb-1">{selectedService.name}</h2>
              <p className="text-base text-txt-light dark:text-txt-dark opacity-90">{selectedService.description}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 bg-olvblue/80 dark:bg-bg-dark-tertiary border border-ourovelho dark:border-ourovelho rounded-lg px-4 py-2">
            <label className="text-white dark:text-ourovelho text-sm font-semibold">Moeda:</label>
            <select
              className="border border-ourovelho dark:border-ourovelho rounded px-2 py-1 bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
              value={currency}
              onChange={handleCurrencyChange}
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CNY">CNY</option>
            </select>
            <input
              type="number"
              inputMode="numeric"
              className="w-24 border border-ourovelho dark:border-ourovelho rounded px-2 py-1 bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
              placeholder="Cotação"
              value={customRate}
              onChange={handleRateChange}
              min={0}
              step={0.0001}
              disabled={currency === 'BRL'}
            />
            {loadingRate && <span className="ml-2 text-xs text-white">Buscando...</span>}
            <button className="ml-4" title="Visualizar Proposta" onClick={exportToPDF}><FaFilePdf size={20} color="#E53935" /></button>
            <button className="ml-2" title="Exportar Excel" onClick={exportToExcel}><FaFileExcel size={20} color="#43A047" /></button>
          </div>
        </div>
        {/* Conteúdo das abas - exemplo para 8 abas, ajuste conforme necessário */}
        <Tabs.Content value="pme-comex" className="pt-4">
          <ServiceForm config={allServices[0]} currency={currency} customRate={customRate} />
        </Tabs.Content>
        <Tabs.Content value="comex-on-demand" className="pt-4">
          <ServiceForm config={allServices[1]} currency={currency} customRate={customRate} />
        </Tabs.Content>
        <Tabs.Content value="3pl-turnkey" className="pt-4">
          <ServiceForm config={allServices[2]} currency={currency} customRate={customRate} />
        </Tabs.Content>
        <Tabs.Content value="end-to-end" className="pt-4">
          <ServiceForm config={allServices[3]} currency={currency} customRate={customRate} />
        </Tabs.Content>
        <Tabs.Content value="in-house" className="pt-4">
          <ServiceForm config={allServices[4]} currency={currency} customRate={customRate} />
        </Tabs.Content>
        <Tabs.Content value="nova-rota-importacao" className="pt-4">
          <ServiceForm config={allServices[5]} currency={currency} customRate={customRate} />
        </Tabs.Content>
        <Tabs.Content value="consultoria" className="pt-4">
          <ServiceForm config={allServices[6]} currency={currency} customRate={customRate} />
        </Tabs.Content>
        <Tabs.Content value="servicos-adicionais" className="pt-4">
          <ServiceForm config={allServices[7]} currency={currency} customRate={customRate} />
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