"use client";

import { usePathname } from "next/navigation";
import { SidebarLink } from "./SidebarLink";
import { Home, Package, Link2, Settings, Languages } from "lucide-react";
import { useTranslations } from "@/lib/locale-provider";
import { LOCALES } from "@insta-checkout/i18n";

const NAV_ITEMS = [
  { labelKey: "dashboard.sidebar.home", href: "/dashboard/home", icon: Home },
  { labelKey: "dashboard.sidebar.products", href: "/dashboard/products", icon: Package },
  { labelKey: "dashboard.sidebar.links", href: "/dashboard/links", icon: Link2 },
];


export function Sidebar() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useTranslations();

  return (
    <nav className="flex flex-col h-full py-6">
      <div className="px-6 mb-8">
        <h2 className="text-lg font-bold text-[#0D9488] font-cairo">Insta Checkout</h2>
      </div>

      <div className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={t(item.labelKey)}
            active={pathname.startsWith(item.href)}
          />
        ))}
      </div>

      <div className="px-3 pt-4 border-t border-slate-200 space-y-1">
        <div className="flex items-center gap-2 px-3 py-2">
          <Languages className="h-4 w-4 text-slate-400" />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as "ar" | "en")}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-cairo"
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {t(`dashboard.sidebar.locale${l === "ar" ? "Ar" : "En"}`)}
              </option>
            ))}
          </select>
        </div>
        <SidebarLink
          href="/dashboard/settings"
          icon={Settings}
          label={t("dashboard.sidebar.settings")}
          active={pathname.startsWith("/dashboard/settings")}
        />
      </div>
    </nav>
  );
}
