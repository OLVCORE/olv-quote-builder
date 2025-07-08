import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface Props {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'pink' | 'indigo';
}

export default function Collapsible({ title, children, expanded, icon, color = 'blue' }: Props) {
  const [open, setOpen] = useState(expanded ?? false);
  
  useEffect(() => {
    if (expanded !== undefined) setOpen(expanded);
  }, [expanded]);

  const colorClasses = {
    blue: {
      bg: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      border: 'border-blue-200 dark:border-blue-700',
      header: 'from-blue-500 to-indigo-600',
      text: 'text-blue-700 dark:text-blue-400'
    },
    green: {
      bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      border: 'border-green-200 dark:border-green-700',
      header: 'from-green-500 to-emerald-600',
      text: 'text-green-700 dark:text-green-400'
    },
    purple: {
      bg: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      border: 'border-purple-200 dark:border-purple-700',
      header: 'from-purple-500 to-pink-600',
      text: 'text-purple-700 dark:text-purple-400'
    },
    orange: {
      bg: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
      border: 'border-orange-200 dark:border-orange-700',
      header: 'from-orange-500 to-red-600',
      text: 'text-orange-700 dark:text-orange-400'
    },
    red: {
      bg: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
      border: 'border-red-200 dark:border-red-700',
      header: 'from-red-500 to-pink-600',
      text: 'text-red-700 dark:text-red-400'
    },
    teal: {
      bg: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
      border: 'border-teal-200 dark:border-teal-700',
      header: 'from-teal-500 to-cyan-600',
      text: 'text-teal-700 dark:text-teal-400'
    },
    pink: {
      bg: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      border: 'border-pink-200 dark:border-pink-700',
      header: 'from-pink-500 to-rose-600',
      text: 'text-pink-700 dark:text-pink-400'
    },
    indigo: {
      bg: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
      border: 'border-indigo-200 dark:border-indigo-700',
      header: 'from-indigo-500 to-purple-600',
      text: 'text-indigo-700 dark:text-indigo-400'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`relative mb-6 overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${classes.bg} opacity-80`}></div>
      
      {/* Main container */}
      <div className={`relative border-2 ${classes.border} bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm`}>
        {/* Header */}
        <button
          type="button"
          className={`w-full flex items-center justify-between px-6 py-4 text-xl font-bold ${classes.text} focus:outline-none focus:ring-2 focus:ring-ourovelho focus:ring-offset-2 transition-all duration-300 hover:bg-gradient-to-r ${classes.bg}`}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
        >
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`p-2 bg-gradient-to-r ${classes.header} rounded-lg shadow-lg`}>
                {icon}
              </div>
            )}
            <span className="drop-shadow-sm">{title}</span>
          </div>
          
          <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${classes.header} shadow-lg transition-all duration-300 hover:scale-110`}>
            {open ? (
              <FaChevronDown className="text-white text-sm transition-transform duration-300" />
            ) : (
              <FaChevronRight className="text-white text-sm transition-transform duration-300" />
            )}
          </div>
        </button>
        
        {/* Content */}
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-6 pb-6 pt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 