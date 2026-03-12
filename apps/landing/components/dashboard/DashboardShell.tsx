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
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <Spinner className="h-8 w-8 text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAFAFA]" dir={dir}>
      <aside className="hidden sm:flex w-64 flex-col border-l border-[#E4D8F0] bg-white shadow-sm">
        <Sidebar />
      </aside>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAFAFA]">{children}</main>
      </div>
    </div>
  );
}
