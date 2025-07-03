import React, { useState, useEffect } from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
}

export default function Collapsible({ title, children, expanded }: Props) {
  const [open, setOpen] = useState(expanded ?? false);
  useEffect(() => {
    if (expanded !== undefined) setOpen(expanded);
  }, [expanded]);
  return (
    <div className="mb-6 border border-ourovelho rounded-xl bg-olvblue dark:bg-bg-dark-secondary shadow-lg">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-lg font-bold text-ourovelho focus:outline-none"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="ml-2 text-2xl transition-transform" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2">{children}</div>
      )}
    </div>
  );
} 