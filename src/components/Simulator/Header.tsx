'use client';
import React from 'react';
import Image from 'next/image';
import { ThemeToggle } from '../UI/ThemeToggle';
import { AuthButton } from '../UI/AuthButton';
import { LanguageSwitcher } from '../UI/LanguageSwitcher';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg border-b-4 border-yellow-400 relative">
      {/* Banner OLV */}
      <div className="absolute left-0 right-0 top-0 z-0 h-2 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400" />
      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo OLV */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-yellow-400 bg-white flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,215,0,0.6)] hover:scale-110">
                <Image 
                  src="/olv-logo.jpeg" 
                  alt="OLV Internacional" 
                  width={40} 
                  height={40}
                  className="rounded-full"
                  priority
                />
              </div>
              {/* Efeito de brilho */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 animate-pulse"></div>
            </div>
            
            <div className="ml-3">
              <h1 className="text-xl font-bold text-yellow-400 tracking-tight">
                OLV Internacional
              </h1>
              <p className="text-sm text-slate-300 font-medium">
                Simulador de Propostas
              </p>
            </div>
          </div>
          
          {/* Menu Superior */}
          <nav className="flex items-center space-x-6">
            {/* Links de navegação */}
            <div className="hidden md:flex items-center space-x-6">
              <a 
                href="#servicos" 
                className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 font-medium"
              >
                Serviços
              </a>
              <a 
                href="#sobre" 
                className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 font-medium"
              >
                Sobre
              </a>
              <a 
                href="#contato" 
                className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 font-medium"
              >
                Contato
              </a>
            </div>
            
            {/* Controles */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <AuthButton />
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      </div>
      {/* Barra de progresso sutil */}
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 animate-pulse" />
    </header>
  );
}; 