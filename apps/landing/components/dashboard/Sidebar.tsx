"use client";

import { usePathname } from "next/navigation";
import { SidebarLink } from "./SidebarLink";
import { Home, Package, Link2, Settings, Languages, User, Users } from "lucide-react";
import { useTranslations } from "@/lib/locale-provider";
import { LOCALES } from "@insta-checkout/i18n";

const NAV_ITEMS = [
  { labelKey: "dashboard.sidebar.home", href: "/dashboard/home", icon: Home },
  { labelKey: "dashboard.sidebar.products", href: "/dashboard/products", icon: Package },
  { labelKey: "dashboard.sidebar.links", href: "/dashboard/links", icon: Link2 },
  { labelKey: "dashboard.sidebar.profile", href: "/dashboard/profile", icon: User },
  { labelKey: "dashboard.sidebar.team", href: "/dashboard/team", icon: Users },
];


export function Sidebar() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useTranslations();

  return (
    <nav className="flex flex-col h-full py-6">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center">
            <span className="text-white text-xs font-bold">IC</span>
          </div>
          <h2 className="text-base font-bold text-[#1E0A3C] font-cairo">Insta Checkout</h2>
        </div>
      </div>

      <div className="flex-1 space-y-0.5 px-3">
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

      <div className="px-3 pt-4 border-t border-[#E4D8F0] space-y-0.5">
        <div className="flex items-center gap-2 px-3 py-2">
          <Languages className="h-4 w-4 text-[#6B5B7B]" />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as "ar" | "en")}
            className="flex-1 rounded-lg border border-[#E4D8F0] bg-white px-2 py-1.5 text-sm font-cairo text-[#1E0A3C]"
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
