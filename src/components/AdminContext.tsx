"use client";
import React, { createContext, useContext, useState } from 'react';

interface AdminState {
  admin: boolean;
  enableAdmin: () => void;
}

const Ctx = createContext<AdminState | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<boolean>(typeof window !== 'undefined' ? !!sessionStorage.getItem('admin') : false);
  const enableAdmin = () => {
    setAdmin(true);
    if (typeof window !== 'undefined') sessionStorage.setItem('admin', '1');
  };
  return <Ctx.Provider value={{ admin, enableAdmin }}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdmin must be used within <AdminProvider>');
  return ctx;
} 