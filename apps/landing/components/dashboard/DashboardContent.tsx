"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, CreditCard, MessageCircle, LogOut } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { useTranslations } from "@/lib/locale-provider";
import { auth, signOutUser } from "@/lib/firebase";

export function DashboardContent() {
  const { t } = useTranslations();
  const [user, setUser] = useState<typeof auth.currentUser>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u?.email) console.log("[Dashboard] Logged in as:", u.email);
      setUser(u);
    });
    return () => unsub();
  }, []);

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <CreditCard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">{t("common.brand")}</span>
          </Link>
          {user && (
            <button
              onClick={() => signOutUser().then(() => (window.location.href = "/"))}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              {t("landing.nav.logout")}
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg sm:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <LayoutDashboard className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("dashboard.title")}
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-md mx-auto">
            {t("dashboard.subtitle")}
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            {t("dashboard.whatsappHint")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard/links"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors"
            >
              {t("dashboard.links.title")}
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || "201000000000"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-base font-bold text-white hover:bg-[#20BD5A] transition-colors"
            >
            <MessageCircle className="h-5 w-5" />
            {t("dashboard.openWhatsApp")}
          </a>
          </div>
        </div>
      </div>
    </>
  );
}
