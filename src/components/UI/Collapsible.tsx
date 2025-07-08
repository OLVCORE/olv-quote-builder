import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface Props {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'pink' | 'indigo';
}

const colorClasses = {
  blue: {
    bg: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    header: 'from-blue-500 to-indigo-600',
    text: 'text-blue-700 dark:text-blue-400'
  },
};

export default function Collapsible({ title, children, expanded, icon, color = 'blue' }: Props) {
  const [open, setOpen] = useState(expanded ?? false);
  
  useEffect(() => {
    if (expanded !== undefined) setOpen(expanded);
  }, [expanded]);

  const classes = colorClasses.blue;

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