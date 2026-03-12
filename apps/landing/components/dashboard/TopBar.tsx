"use client";

import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTranslations } from "@/lib/locale-provider";
import { UserMenu } from "./UserMenu";

type Props = { onMenuToggle: () => void };

export function TopBar({ onMenuToggle }: Props) {
  const { t } = useTranslations();
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-[#E4D8F0] bg-white">
      <button
        onClick={onMenuToggle}
        className="sm:hidden p-2 rounded-lg text-[#6B5B7B] hover:bg-[#F3EEFA] cursor-pointer"
        aria-label={t("dashboard.aria.openMenu")}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <UserMenu
        name={user?.displayName || t("dashboard.aria.seller")}
        email={user?.email || ""}
        photoURL={user?.photoURL}
      />
    </header>
  );
}
