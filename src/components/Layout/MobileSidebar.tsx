"use client";
import React from "react";
import Link from "next/link";
import { FaTimes, FaUser } from "react-icons/fa";

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex">
      <aside className="w-72 bg-white dark:bg-[#0A2342] h-full flex flex-col p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 font-bold text-[#185ADB] dark:text-[#FFD700] text-lg">
            <img src="/olv-logo.jpeg" alt="OLV" className="h-8 w-auto" />
            OLV Internacional
          </div>
          <button onClick={onClose}>
            <FaTimes className="text-xl" />
          </button>
        </div>
        <nav className="flex flex-col gap-4">
          <Link href="/" onClick={onClose}>Dashboard</Link>
          <Link href="/admin/simulator" onClick={onClose}>Simulador</Link>
          <Link href="/admin/quote-incompany/history" onClick={onClose}>Histórico</Link>
          <Link href="/admin/services" onClick={onClose}>Serviços</Link>
          <Link href="/admin/settings" onClick={onClose}>Configurações</Link>
          <Link href="/cadastro" onClick={onClose} className="flex items-center gap-2 mt-4 bg-[#FFD700] text-[#0A2342] px-3 py-2 rounded-lg font-bold hover:bg-[#bfa14a]">
            <FaUser /> Usuário
          </Link>
        </nav>
      </aside>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
} 