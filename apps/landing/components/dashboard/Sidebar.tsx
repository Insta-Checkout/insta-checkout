"use client";

import { usePathname } from "next/navigation";
import { SidebarLink } from "./SidebarLink";
import { Home, Package, Link2, Settings, Languages, User, Users } from "lucide-react";
import { useTranslations } from "@/lib/locale-provider";
import { LOCALES } from "@insta-checkout/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <div className="flex items-center gap-2.5">
          <img src="/logo/logomark.svg" alt="" className="h-7 w-7" />
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
          <Languages className="h-4 w-4 text-[#6B5B7B] shrink-0" />
          <Select value={locale} onValueChange={(v) => setLocale(v as "ar" | "en")}>
            <SelectTrigger className="flex-1 h-8 text-sm font-cairo text-[#1E0A3C] border-[#E4D8F0]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((l) => (
                <SelectItem key={l} value={l} className="font-cairo text-sm">
                  {t(`dashboard.sidebar.locale${l === "ar" ? "Ar" : "En"}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
