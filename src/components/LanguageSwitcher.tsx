"use client";

import React, { useEffect, useState } from 'react';

const options = [
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'zh', label: '中文' },
];

export default function LanguageSwitcher() {
  const [lang, setLang] = useState('pt');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
    if (saved) setLang(saved);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setLang(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', value);
      // no i18n yet; future: route to /en etc.
    }
  }

  return (
    <select
      value={lang}
      onChange={handleChange}
      className="bg-transparent text-slate-200 border border-slate-400 px-1 py-0.5 text-xs rounded"
    >
      {options.map((o) => (
        <option key={o.code} value={o.code} className="text-slate-900">
          {o.label}
        </option>
      ))}
    </select>
  );
} 