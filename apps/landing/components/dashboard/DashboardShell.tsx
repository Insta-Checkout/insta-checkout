"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileSidebar } from "./MobileSidebar";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLocale } from "@/lib/locale-provider";
import { Spinner } from "@/components/ui/spinner";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const { dir } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAF9]">
        <Spinner className="h-8 w-8 text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAFAF9]" dir={dir}>
      <aside className="hidden sm:flex w-64 flex-col border-l border-slate-200 bg-white">
        <Sidebar />
      </aside>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
