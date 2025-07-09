"use client";
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { FaBars, FaTimes } from "react-icons/fa";

export function LayoutContainer({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A2342]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile: Overlay, Desktop: Fixed */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:relative lg:z-auto
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="pt-16 lg:pt-20 px-4 sm:px-6 lg:px-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
} 