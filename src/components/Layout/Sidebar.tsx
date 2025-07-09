import React from "react";

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0A2342] text-white flex flex-col shadow-lg z-40">
      {/* Logo OLV */}
      <div className="h-16 flex items-center justify-center border-b border-[#185ADB]">
        <img src="/olv-logo.jpeg" alt="OLV Internacional" className="h-10" />
      </div>
      {/* Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <a href="/admin/dashboard" className="block py-2 px-3 rounded hover:bg-[#185ADB] transition">Dashboard</a>
        <a href="/admin/simulator" className="block py-2 px-3 rounded hover:bg-[#185ADB] transition">Simulador</a>
        <a href="/admin/quote-incompany" className="block py-2 px-3 rounded hover:bg-[#185ADB] transition">Histórico</a>
        <a href="/admin/services" className="block py-2 px-3 rounded hover:bg-[#185ADB] transition">Serviços</a>
        <a href="/admin/settings" className="block py-2 px-3 rounded hover:bg-[#185ADB] transition">Configurações</a>
      </nav>
      {/* Rodapé/versão */}
      <div className="p-4 text-xs text-[#FFD700] border-t border-[#185ADB]">
        OLV Quote Builder<br />
        <span className="text-white/60">v1.0.0</span>
      </div>
    </aside>
  );
} 