"use client";

import { usePathname } from "next/navigation";
import { Home, Users, BarChart3, Settings, Zap } from "lucide-react";

import { AdminSidebarLink } from "./AdminSidebarLink";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Sellers", href: "/sellers", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full py-6">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <h2 className="text-base font-bold text-[#1E0A3C]">IC Admin</h2>
        </div>
      </div>

      <div className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => (
          <AdminSidebarLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            }
          />
        ))}
      </div>
    </nav>
  );
}
