"use client";
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'indigo' | 'pink';
}

export default function Collapsible({ title, children, expanded = false, icon, color = 'blue' }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(expanded);

  // PADRONIZADO: Sempre usar azul oficial OLV
  const colorClasses = {
    bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    border: 'border-blue-200 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-400',
    hover: 'hover:bg-blue-50/50 dark:hover:bg-blue-900/20',
    iconBg: 'bg-gradient-to-r from-blue-500 to-indigo-600'
  };

  return (
    <div className="relative mb-6">
      {/* PADRONIZADO: Azul oficial */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/30 dark:to-slate-600/30 rounded-2xl blur-xl"></div>
      <div className="relative bg-white/95 dark:bg-slate-800/95 border-2 border-blue-200 dark:border-blue-700 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between p-6 text-left transition-all duration-300 ${colorClasses.hover}`}
        >
          <div className="flex items-center gap-4">
            {/* PADRONIZADO: Azul oficial */}
            <div className={`p-3 ${colorClasses.iconBg} rounded-xl shadow-lg`}>
              {icon || <div className="w-6 h-6 text-white" />}
            </div>
            {/* PADRONIZADO: Azul oficial */}
            <h3 className={`text-2xl font-bold ${colorClasses.text}`}>
              {title}
            </h3>
          </div>
          {/* PADRONIZADO: Azul oficial */}
          <div className={`p-2 ${colorClasses.iconBg} rounded-lg shadow-lg transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            {isOpen ? (
              <FaChevronUp className="text-white text-lg" />
            ) : (
              <FaChevronDown className="text-white text-lg" />
            )}
          </div>
        </button>

        {/* Content */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-6 pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 