"use client";
import React, { useState } from "react";
import { Topbar } from "./Topbar";
import { MobileSidebar } from "./MobileSidebar";

export function LayoutContainer({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A2342]">
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-16 px-4 sm:px-8">{children}</main>
    </div>
  );
} 