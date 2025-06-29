"use client";
import React from 'react';
import dynamic from 'next/dynamic';

const SimulatorTabs = dynamic(() => import('@/components/SimulatorTabs'), { ssr: false });

export default function QuoteInCompany() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Simuladores OLV</h1>
      <SimulatorTabs />
    </main>
  );
} 