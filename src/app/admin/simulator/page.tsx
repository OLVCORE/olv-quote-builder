"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import SimulatorTabs from '@/components/SimulatorTabs';
import { FaCalculator, FaChartLine, FaGlobe, FaUser } from 'react-icons/fa';
import { useAuth } from '@/components/AuthContext';

export default function SimulatorPage() {
  const { user, openAuthModal } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header Premium com Gradiente */}
        <div className="relative mb-8 overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-r from-olvblue via-blue-800 to-olvblue opacity-90"></div>
          <div className="relative z-10 p-8 md:p-12 rounded-2xl">
            <div className="flex items-center gap-4 mb-6 animate-slide-in-left">
              <div className="p-3 bg-ourovelho/20 rounded-xl hover-lift">
                <FaCalculator className="text-3xl text-ourovelho" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg font-display">
                  Simulador Inteligente
                </h1>
                <h2 className="text-xl md:text-2xl font-bold text-ourovelho font-display">
                  OLV Internacional
                </h2>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl backdrop-blur-sm hover-lift animate-slide-in-left" style={{animationDelay: '0.1s'}}>
                <FaGlobe className="text-2xl text-ourovelho" />
                <div>
                  <p className="text-white font-semibold">Multi-Moeda</p>
                  <p className="text-ourovelho/80 text-sm">USD, EUR, GBP, CNY</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl backdrop-blur-sm hover-lift animate-slide-in-left" style={{animationDelay: '0.2s'}}>
                <FaChartLine className="text-2xl text-ourovelho" />
                <div>
                  <p className="text-white font-semibold">Cálculos Dinâmicos</p>
                  <p className="text-ourovelho/80 text-sm">Impostos em cascata</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl backdrop-blur-sm hover-lift animate-slide-in-left" style={{animationDelay: '0.3s'}}>
                <FaCalculator className="text-2xl text-ourovelho" />
                <div>
                  <p className="text-white font-semibold">8 Serviços</p>
                  <p className="text-ourovelho/80 text-sm">COMEX & Logística</p>
                </div>
              </div>
            </div>
            
            <p className="text-lg text-white/90 max-w-4xl leading-relaxed animate-slide-in-right font-body">
              Simule todos os serviços OLV para importação, exportação, logística e consultoria. 
              Preços dinâmicos, campos editáveis, conversão de moedas, breakdown detalhado, 
              PDF profissional e experiência premium.
            </p>
            
            {/* Botão de Teste de Autenticação */}
            <div className="mt-6 flex gap-4 animate-slide-in-right" style={{animationDelay: '0.4s'}}>
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-2 px-6 py-3 bg-ourovelho hover:bg-ourovelho-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <FaUser size={16} />
                {user ? 'Usuário Logado' : 'Testar Login'}
              </button>
              {!user && (
                <button
                  onClick={() => openAuthModal('signup')}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  <FaUser size={16} />
                  Criar Conta
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Simulador */}
        <div className="relative animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-3xl blur-3xl"></div>
          <div className="relative z-10">
            <SimulatorTabs />
          </div>
        </div>
      </main>
    </div>
  );
} 