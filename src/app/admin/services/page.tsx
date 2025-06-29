import { allServices } from '@/lib/services';
import Link from 'next/link';

export default function ServicesIndex() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Serviços</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {allServices.map((s) => (
          <Link key={s.slug} href={`/admin/services/${s.slug}`} className="border p-4 rounded hover:bg-slate-50">
            <h2 className="text-xl font-semibold mb-2">{s.name}</h2>
            <p className="text-sm text-slate-600">{s.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
} 