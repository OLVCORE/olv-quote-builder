import React from "react";
import { ThemeToggle } from "../UI/ThemeToggle";

export function Topbar() {
  return (
    <header className="fixed left-64 top-0 right-0 h-16 bg-white dark:bg-[#0A2342] border-b border-[#185ADB] flex items-center px-8 z-30">
      <div className="font-bold text-[#185ADB] dark:text-[#FFD700] text-lg">OLV Internacional</div>
      <div className="flex-1" />
      <ThemeToggle />
      <div className="ml-4 w-8 h-8 rounded-full bg-[#185ADB] dark:bg-[#FFD700] flex items-center justify-center text-white font-bold">U</div>
    </header>
  );
} 