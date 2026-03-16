"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTranslations } from "@/lib/locale-provider";
import { auth } from "@/lib/firebase";
import { fetchWithAuth, getBackendUrl } from "@/lib/api";
import { UserMenu } from "./UserMenu";

type Props = { onMenuToggle: () => void };

export function TopBar({ onMenuToggle }: Props) {
  const { t } = useTranslations();
  const { user } = useAuth();
  const [sellerName, setSellerName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    const getToken = (): Promise<string | null> =>
      auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);

    fetchWithAuth(`${getBackendUrl()}/sellers/me`, { signal: controller.signal }, getToken)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.businessName) setSellerName(data.businessName);
      })
      .catch((e) => {
        if (e instanceof Error && e.name === "AbortError") return;
      });

    return () => controller.abort();
  }, [user]);

  const displayName = sellerName || user?.displayName || t("dashboard.aria.seller");

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
        name={displayName}
        email={user?.email || ""}
        photoURL={user?.photoURL}
      />
    </header>
  );
}
