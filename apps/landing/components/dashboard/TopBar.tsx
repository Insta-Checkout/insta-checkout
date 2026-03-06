"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { UserMenu } from "./UserMenu";
import { Menu } from "lucide-react";

type Props = { onMenuToggle: () => void };

export function TopBar({ onMenuToggle }: Props) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-slate-200 bg-white">
      <button
        onClick={onMenuToggle}
        className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-50"
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <UserMenu
        name={user?.displayName || "البائع"}
        email={user?.email || ""}
        photoURL={user?.photoURL}
      />
    </header>
  );
}
