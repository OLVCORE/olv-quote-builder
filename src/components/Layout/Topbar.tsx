"use client";
import React from "react";
import { FaBars, FaBell, FaUser } from "react-icons/fa";
import { ThemeToggle } from "../UI/ThemeToggle";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-white dark:bg-[#0A2342] border-b border-[#185ADB] flex items-center px-4 sm:px-6 lg:px-8 z-30">
      {/* Menu Button (Mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mr-3"
      >
        <FaBars className="text-lg text-gray-600 dark:text-gray-300" />
      </button>

      {/* Logo/Brand */}
      <div className="flex items-center">
        <div className="font-bold text-[#185ADB] dark:text-[#FFD700] text-lg">
          OLV Internacional
        </div>
        <div className="ml-2 text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
          Quote Builder
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative">
          <FaBell className="text-lg text-gray-600 dark:text-gray-300" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <button className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-[#185ADB] dark:bg-[#FFD700] flex items-center justify-center text-white font-bold text-sm">
            U
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
            Usuário
          </span>
        </button>
      </div>
    </header>
  );
} 