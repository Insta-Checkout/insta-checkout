"use client";

import { usePathname } from "next/navigation";
import { SidebarLink } from "./SidebarLink";
import { Home, Package, Link2, Settings } from "lucide-react";

const NAV_ITEMS = [
  { label: "الرئيسية", href: "/dashboard/home", icon: Home },
  { label: "المنتجات", href: "/dashboard/products", icon: Package },
  { label: "لينكات الدفع", href: "/dashboard/links", icon: Link2 },
];

export function Sidebar() {
  const pathname = usePathname();

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
            label={item.label}
            active={pathname.startsWith(item.href)}
          />
        ))}
      </div>

      <div className="px-3 pt-4 border-t border-slate-200">
        <SidebarLink
          href="/dashboard/settings"
          icon={Settings}
          label="الإعدادات"
          active={pathname.startsWith("/dashboard/settings")}
        />
      </div>
    </nav>
  );
}
