"use client";
import React from 'react';
import { allServices } from '@/lib/services';
import { useParams } from 'next/navigation';
import ServiceForm from '@/components/ServiceForm';

export default function ServiceFormPage() {
  const { slug } = useParams();
  const service = allServices.find((s) => s.slug === slug);
  if (!service) return <p className="p-6">Serviço não encontrado.</p>;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
      <p className="text-sm text-slate-600 mb-6 max-w-2xl">{service.description}</p>
      <ServiceForm config={service} />
    </main>
  );
} 