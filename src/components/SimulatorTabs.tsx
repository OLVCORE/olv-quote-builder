"use client";
import React, { useState } from 'react';
import { allServices } from '@/lib/services';
import ServiceForm from '@/components/ServiceForm';
import * as Tabs from '@radix-ui/react-tabs';
import { FaFilePdf, FaFileExcel, FaChevronDown, FaChevronUp, FaIndustry, FaShip, FaTruck, FaRoute, FaBuilding, FaGlobe, FaUsers, FaPlus } from 'react-icons/fa';
import { AdminProvider } from './AdminContext';
import Collapsible from './UI/Collapsible';
import * as XLSX from 'xlsx';

function TabsWithAdmin() {
  // Lista de abas com ícones - PADRONIZADO para azul/ouro oficial
  const tabList = [
    { value: 'pme-comex', label: 'PME COMEX Ready', icon: FaIndustry, color: 'from-blue-500 to-indigo-600' },
    { value: 'comex-on-demand', label: 'COMEX On-Demand', icon: FaShip, color: 'from-blue-500 to-indigo-600' },
    { value: '3pl-turnkey', label: '3PL Turnkey', icon: FaTruck, color: 'from-blue-500 to-indigo-600' },
    { value: 'end-to-end', label: 'End-to-End', icon: FaRoute, color: 'from-blue-500 to-indigo-600' },
    { value: 'in-house', label: 'In-House', icon: FaBuilding, color: 'from-blue-500 to-indigo-600' },
    { value: 'nova-rota-importacao', label: 'Nova Rota de Importação', icon: FaGlobe, color: 'from-blue-500 to-indigo-600' },
    { value: 'consultoria', label: 'Consultoria Especializada', icon: FaUsers, color: 'from-blue-500 to-indigo-600' },
    { value: 'servicos-adicionais', label: 'Serviços Adicionais', icon: FaPlus, color: 'from-blue-500 to-indigo-600' },
  ];
  const [selectedTab, setSelectedTab] = useState(tabList[0].value);
  const selectedServiceIdx = tabList.findIndex(tab => tab.value === selectedTab);
  const selectedService = allServices[selectedServiceIdx];

  // Estado global de moeda/cotação
  const [currency, setCurrency] = useState('BRL');
  const [customRate, setCustomRate] = useState('');
  const [loadingRate, setLoadingRate] = useState(false);
  const [exporting, setExporting] = useState(false);
  
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
  
  // Exportação XLSX funcional
  const exportToExcel = () => {
    if (!selectedService) return;
    
    setExporting(true);
    
    try {
      // Criar dados da proposta
      const proposalData = [
        ['PROPOSTA OLV INTERNACIONAL'],
        [''],
        ['Serviço:', selectedService.name],
        ['Descrição:', selectedService.description],
        ['Moeda:', currency],
        ['Cotação:', customRate || '1.00'],
        ['Data:', new Date().toLocaleDateString('pt-BR')],
        [''],
        ['DETALHAMENTO DOS CUSTOS'],
        ['Item', 'Descrição', `Valor (${currency})`, 'Observações']
      ];

      // Adicionar campos do serviço
      selectedService.inputs.forEach(input => {
        proposalData.push([
          input.key,
          input.label,
          '', // Valor será preenchido pelo usuário
          input.type === 'checkbox' ? 'Sim/Não' : 'Valor numérico'
        ]);
      });

      // Adicionar seções de cálculo
      proposalData.push(['', '', '', '']);
      proposalData.push(['SUBTOTAIS']);
      proposalData.push(['Serviços Principais', '', '', '']);
      proposalData.push(['Serviços Adicionais', '', '', '']);
      proposalData.push(['Impostos', '', '', '']);
      proposalData.push(['TOTAL GERAL', '', '', '']);

      // Criar planilha
      const worksheet = XLSX.utils.aoa_to_sheet(proposalData);
      
      // Ajustar larguras das colunas
      worksheet['!cols'] = [
        { width: 25 },
        { width: 40 },
        { width: 15 },
        { width: 30 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Proposta OLV');
      
      // Salvar arquivo
      const fileName = `proposta_olv_${selectedService.slug}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      // Feedback visual
      setTimeout(() => {
        setExporting(false);
        // Mostrar notificação de sucesso
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up';
        notification.textContent = '✅ Proposta exportada com sucesso!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }, 500);
      
    } catch (error) {
      console.error('Erro na exportação:', error);
      setExporting(false);
      alert('Erro ao exportar proposta. Tente novamente.');
    }
  };

  const [expandAll, setExpandAll] = useState(true);

  return (
    <>
      <Tabs.Root value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        {/* Container das abas com gradiente de fundo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-2xl shadow-lg"></div>
          <div className="relative p-4 rounded-2xl">
            <div className="flex flex-wrap gap-2 sm:gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-xl shadow-inner">
              <Tabs.List className="flex-1 flex flex-wrap gap-2 sm:gap-3">
                {tabList.map(tab => {
                  const IconComponent = tab.icon;
                  return (
                    <Tabs.Trigger
                      key={tab.value}
                      value={tab.value}
                      className="group flex-1 min-w-[120px] sm:min-w-[140px] px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold rounded-xl shadow-lg border-2 border-transparent bg-white/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 transition-all duration-300 hover:scale-105 hover:shadow-xl data-[state=active]:bg-gradient-to-r data-[state=active]:border-white dark:data-[state=active]:border-slate-600 data-[state=active]:shadow-2xl data-[state=active]:scale-105 cursor-pointer"
                      style={{
                        backgroundImage: `var(--tw-gradient-stops)`,
                        '--tw-gradient-from': tab.color.split(' ')[1],
                        '--tw-gradient-to': tab.color.split(' ')[3],
                      } as any}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <IconComponent className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-center leading-tight">{tab.label}</span>
                      </div>
                    </Tabs.Trigger>
                  );
                })}
              </Tabs.List>
              
              {/* Botão Expandir/Recolher com visual premium */}
              <button
                className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-ourovelho bg-gradient-to-r from-ourovelho to-ourovelho-dark text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                title={expandAll ? 'Recolher todas as seções' : 'Expandir todas as seções'}
                onClick={() => setExpandAll(e => !e)}
              >
                {expandAll ? <FaChevronUp /> : <FaChevronDown />} 
                <span className="hidden sm:inline">{expandAll ? 'Recolher Tudo' : 'Expandir Tudo'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bloco de informações do serviço com visual premium */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-blue-50/80 dark:from-slate-800/80 dark:to-slate-700/80 rounded-2xl shadow-lg"></div>
          <div className="relative p-6 rounded-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {selectedService && (
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-olvblue to-blue-800 rounded-lg">
                      {React.createElement(tabList[selectedServiceIdx]?.icon || FaIndustry, { 
                        className: "text-2xl text-ourovelho" 
                      })}
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-olvblue dark:text-ourovelho mb-1">
                        {selectedService.name}
                      </h2>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 opacity-90 max-w-2xl">
                        {selectedService.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Controles de moeda e exportação com visual premium */}
              <div className="flex flex-wrap items-center gap-3 bg-gradient-to-r from-olvblue/90 to-blue-800/90 dark:from-slate-700/90 dark:to-slate-600/90 border-2 border-ourovelho/30 rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <label className="text-white dark:text-ourovelho text-sm font-bold">Moeda:</label>
                  <select
                    className="border-2 border-ourovelho/50 rounded-lg px-3 py-2 bg-white/90 dark:bg-slate-800/90 text-olvblue dark:text-ourovelho text-sm font-semibold shadow-inner focus:ring-2 focus:ring-ourovelho focus:border-transparent"
                    value={currency}
                    onChange={handleCurrencyChange}
                  >
                    <option value="BRL">🇧🇷 BRL</option>
                    <option value="USD">🇺🇸 USD</option>
                    <option value="EUR">🇪🇺 EUR</option>
                    <option value="GBP">🇬🇧 GBP</option>
                    <option value="CNY">🇨🇳 CNY</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    className="w-24 sm:w-28 border-2 border-ourovelho/50 rounded-lg px-3 py-2 bg-white/90 dark:bg-slate-800/90 text-olvblue dark:text-ourovelho text-sm font-semibold shadow-inner focus:ring-2 focus:ring-ourovelho focus:border-transparent"
                    placeholder="Cotação"
                    value={customRate}
                    onChange={handleRateChange}
                    min={0}
                    step={0.0001}
                    disabled={currency === 'BRL'}
                  />
                  {loadingRate && <span className="text-xs text-white animate-pulse">⏳</span>}
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110" 
                    title="Visualizar Proposta PDF" 
                    onClick={exportToPDF}
                  >
                    <FaFilePdf size={18} color="white" />
                  </button>
                  <button 
                    className={`p-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 ${exporting ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                    title={exporting ? 'Exportando...' : 'Exportar Excel'} 
                    onClick={exportToExcel}
                    disabled={exporting}
                  >
                    {exporting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaFileExcel size={18} color="white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo das abas com animação */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl blur-2xl"></div>
          <div className="relative">
            <Tabs.Content value="pme-comex" className="pt-4 animate-in fade-in duration-300">
              <ServiceForm config={allServices[0]} currency={currency} customRate={customRate} expandAll={expandAll} />
            </Tabs.Content>
            <Tabs.Content value="comex-on-demand" className="pt-4 animate-in fade-in duration-300">
              <ServiceForm config={allServices[1]} currency={currency} customRate={customRate} expandAll={expandAll} />
            </Tabs.Content>
            <Tabs.Content value="3pl-turnkey" className="pt-4 animate-in fade-in duration-300">
              <ServiceForm config={allServices[2]} currency={currency} customRate={customRate} expandAll={expandAll} />
            </Tabs.Content>
            <Tabs.Content value="end-to-end" className="pt-4 animate-in fade-in duration-300">
              <ServiceForm config={allServices[3]} currency={currency} customRate={customRate} expandAll={expandAll} />
            </Tabs.Content>
            <Tabs.Content value="in-house" className="pt-4 animate-in fade-in duration-300">
              <ServiceForm config={allServices[4]} currency={currency} customRate={customRate} expandAll={expandAll} />
            </Tabs.Content>
            <Tabs.Content value="nova-rota-importacao" className="pt-4 animate-in fade-in duration-300">
              <ServiceForm config={allServices[5]} currency={currency} customRate={customRate} expandAll={expandAll} />
            </Tabs.Content>
            <Tabs.Content value="consultoria" className="pt-4 animate-in fade-in duration-300">
              <ServiceForm config={allServices[6]} currency={currency} customRate={customRate} expandAll={expandAll} />
            </Tabs.Content>
            <Tabs.Content value="servicos-adicionais" className="pt-4 animate-in fade-in duration-300" style={{display: selectedTab === 'servicos-adicionais' ? 'block' : 'none'}}>
              {allServices[7].inputs && allServices[7].inputs.length > 0 ? (
                <ServiceForm config={allServices[7]} currency={currency} customRate={customRate} expandAll={expandAll} />
              ) : null}
            </Tabs.Content>
          </div>
        </div>
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