"use client";
import React, { useState } from 'react';
import { services, InputField } from '@/lib/services';
import { useParams } from 'next/navigation';

export default function ServiceFormPage() {
  const { slug } = useParams();
  const service = services.find((s) => s.slug === slug);
  if (!service) return <p>Serviço não encontrado.</p>;

  const [values, setValues] = useState<Record<string, any>>(
    Object.fromEntries(service.inputs.map((i) => [i.key, i.default]))
  );
  const result = service.calculate(values);

  function handleChange(field: InputField, value: any) {
    setValues((v) => ({ ...v, [field.key]: value }));
  }

  return (
    <main className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">{service.name}</h1>
      <p className="text-sm text-slate-600">{service.description}</p>
      <form className="space-y-4">
        {service.inputs.map((field) => {
          if (field.type === 'number')
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-1">{field.label}</label>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  value={values[field.key]}
                  onChange={(e) => handleChange(field, Number(e.target.value))}
                />
              </div>
            );
          if (field.type === 'select')
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-1">{field.label}</label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={values[field.key]}
                  onChange={(e) => handleChange(field, e.target.value)}
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          if (field.type === 'checkbox')
            return (
              <label key={field.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={values[field.key] as boolean}
                  onChange={(e) => handleChange(field, e.target.checked)}
                />
                {field.label}
              </label>
            );
        })}
      </form>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold">Total estimado: R$ {result.total.toLocaleString('pt-BR')}</h2>
      </div>
    </main>
  );
} 