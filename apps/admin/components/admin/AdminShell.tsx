"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";
import { AdminMobileSidebar } from "./AdminMobileSidebar";
import { useAuth } from "@/lib/auth/AuthProvider";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7C3AED] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <aside className="hidden sm:flex w-64 flex-col border-r border-[#E4D8F0] bg-white shadow-sm">
        <AdminSidebar />
      </aside>

      <AdminMobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAFAFA]">{children}</main>
      </div>
    </div>
  );
}
