'use client';
import React from 'react';
import Image from 'next/image';
import { ThemeToggle } from '../UI/ThemeToggle';
import { AuthButton } from '../UI/AuthButton';
import { LanguageSwitcher } from '../UI/LanguageSwitcher';

export const Header: React.FC = () => {
  return (
    <header className="bg-olvblue text-white shadow-lg border-b-2 border-ourovelho-dark backdrop-blur-md bg-opacity-80">
      <div className="container mx-auto px-6 py-2 flex items-center justify-between min-h-[72px]">
        {/* Logo OLV com efeito glass e borda ouro velho escura */}
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white/60 backdrop-blur-lg border-4 border-ourovelho-dark shadow-lg" style={{ boxShadow: '0 4px 24px 0 rgba(191,161,74,0.15)' }}>
            <Image 
              src="/olv-logo.jpeg" 
              alt="OLV Internacional" 
              width={56} 
              height={56}
              className="rounded-full object-contain p-2"
              priority
            />
            {/* Efeito de brilho sutil */}
            <div className="absolute inset-0 rounded-full border-2 border-ourovelho/60 pointer-events-none" />
          </div>
          <div className="ml-2">
            <h1 className="text-2xl font-extrabold text-ourovelho tracking-tight leading-tight drop-shadow-sm">
              OLV Internacional
            </h1>
            <p className="text-sm text-slate-200 font-medium opacity-80">
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
              className="text-slate-200 hover:text-ourovelho transition-colors duration-200 font-medium"
            >
              Serviços
            </a>
            <a 
              href="#sobre" 
              className="text-slate-200 hover:text-ourovelho transition-colors duration-200 font-medium"
            >
              Sobre
            </a>
            <a 
              href="#contato" 
              className="text-slate-200 hover:text-ourovelho transition-colors duration-200 font-medium"
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
    </header>
  );
}; 