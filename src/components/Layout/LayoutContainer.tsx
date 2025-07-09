import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function LayoutContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A2342] flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Topbar />
        <main className="pt-20 px-8 pb-8">{children}</main>
      </div>
    </div>
  );
} 