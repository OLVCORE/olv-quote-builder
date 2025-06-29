import dynamic from 'next/dynamic';

const SimulatorTabs = dynamic(() => import('@/components/SimulatorTabs'), {
  ssr: false,
});

export default function SimulatorPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Simulador OLV PME Consult</h1>
      <SimulatorTabs />
    </main>
  );
} 