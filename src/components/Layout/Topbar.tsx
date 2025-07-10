"use client";
import React from "react";
import Link from "next/link";
import { FaBars, FaUser, FaMoon, FaSun } from "react-icons/fa";
import { ThemeToggle } from "../UI/ThemeToggle";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0A2342] border-b border-[#185ADB] flex items-center px-4 z-30">
      {/* Mobile menu button */}
      <button className="lg:hidden mr-3" onClick={onMenuClick}>
        <FaBars className="text-xl text-[#185ADB] dark:text-[#FFD700]" />
      </button>
      {/* Logo/Brand */}
      <Link href="/" className="flex items-center gap-2 font-bold text-[#185ADB] dark:text-[#FFD700] text-lg">
        <img src="/olv-logo.jpeg" alt="OLV" className="h-8 w-auto" />
        OLV Internacional <span className="font-normal text-gray-500 dark:text-gray-300">Quote Builder</span>
      </Link>
      {/* Navigation */}
      <nav className="hidden lg:flex gap-6 ml-10">
        <Link href="/" className="hover:text-[#185ADB] dark:hover:text-[#FFD700]">Dashboard</Link>
        <Link href="/admin/simulator" className="hover:text-[#185ADB] dark:hover:text-[#FFD700]">Simulador</Link>
        <Link href="/admin/quote-incompany/history" className="hover:text-[#185ADB] dark:hover:text-[#FFD700]">Histórico</Link>
        <Link href="/admin/services" className="hover:text-[#185ADB] dark:hover:text-[#FFD700]">Serviços</Link>
        <Link href="/admin/settings" className="hover:text-[#185ADB] dark:hover:text-[#FFD700]">Configurações</Link>
      </nav>
      <div className="flex-1" />
      {/* Actions */}
      <ThemeToggle />
      <Link href="/cadastro" className="ml-4 flex items-center gap-2 bg-[#FFD700] text-[#0A2342] px-3 py-1 rounded-lg font-bold hover:bg-[#bfa14a]">
        <FaUser /> Usuário
      </Link>
    </header>
  );
} 