"use client";

import { Menu } from "lucide-react";
import { AdminUserMenu } from "./AdminUserMenu";

type Props = { onMenuToggle: () => void };

export function AdminTopBar({ onMenuToggle }: Props) {
  return (
    <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-[#E4D8F0] bg-white">
      <button
        onClick={onMenuToggle}
        className="sm:hidden p-2 rounded-lg text-[#6B5B7B] hover:bg-[#F3EEFA] cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <AdminUserMenu />
    </header>
  );
}
