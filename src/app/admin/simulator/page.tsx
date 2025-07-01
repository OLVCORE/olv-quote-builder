import React from 'react';
import dynamic from 'next/dynamic';
import SimulatorTabs from '@/components/SimulatorTabs';

export default function SimulatorPage() {
  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-yellow-500 drop-shadow-sm">
        Simulador Inteligente OLV Internacional
      </h1>
      <p className="mb-8 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
        Simule todos os serviços OLV para importação, exportação, logística e consultoria. Preços dinâmicos, campos editáveis, conversão de moedas, breakdown detalhado, PDF profissional e experiência premium.
      </p>
      <SimulatorTabs />
    </main>
  );
} 