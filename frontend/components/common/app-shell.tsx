"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/common/navbar";
import { Sidebar } from "@/components/common/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 via-zinc-50 to-zinc-100 text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-black">
      <Navbar />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-4 px-4 pb-8 pt-4 sm:px-6">
        <Sidebar />
        <main className="flex-1 rounded-3xl border border-zinc-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-zinc-900 dark:bg-zinc-950/70 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
