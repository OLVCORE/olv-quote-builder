"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FaTimes, FaHome, FaCalculator, FaHistory, 
  FaCogs, FaBoxOpen, FaGlobe, FaChartLine 
} from "react-icons/fa";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: FaHome,
      description: 'Visão geral da plataforma'
    },
    { 
      name: 'Simulador', 
      href: '/admin/simulator', 
      icon: FaCalculator,
      description: 'Simular produtos e serviços'
    },
    { 
      name: 'Histórico', 
      href: '/admin/quote-incompany/history', 
      icon: FaHistory,
      description: 'Simulações anteriores'
    },
    { 
      name: 'Serviços', 
      href: '/admin/services', 
      icon: FaBoxOpen,
      description: 'Gerenciar serviços'
    },
    { 
      name: 'Configurações', 
      href: '/admin/settings', 
      icon: FaCogs,
      description: 'Configurações do sistema'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-full bg-[#0A2342] text-white flex flex-col shadow-lg">
      {/* Header com botão fechar (mobile) */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#185ADB]">
        <div className="flex items-center">
          <img src="/olv-logo.jpeg" alt="OLV Internacional" className="h-8 w-auto" />
          <span className="ml-2 text-sm font-semibold">OLV</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-[#185ADB] rounded-lg transition-colors"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`
                group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                ${active 
                  ? 'bg-[#185ADB] text-white shadow-lg' 
                  : 'hover:bg-[#185ADB]/50 text-white/80 hover:text-white'
                }
              `}
              title={item.description}
            >
              <IconComponent className={`text-lg ${active ? 'text-white' : 'text-white/60'}`} />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs opacity-60 hidden lg:block">{item.description}</div>
              </div>
              {active && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div className="p-4 text-xs text-[#FFD700] border-t border-[#185ADB]">
        <div className="font-semibold">OLV Quote Builder</div>
        <div className="text-white/60">v1.0.0</div>
      </div>
    </aside>
  );
} 