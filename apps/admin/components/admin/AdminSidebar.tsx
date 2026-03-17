"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Home, Users, BarChart3, Settings, Zap } from "lucide-react";

import { AdminSidebarLink } from "./AdminSidebarLink";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Sellers", href: "/sellers", icon: Users, badgeKey: "pendingSellers" as const },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchCount = async (): Promise<void> => {
      try {
        const res = await fetchWithAuth(
          `${getBackendUrl()}/admin/sellers/pending/count`,
          {},
          () => user.getIdToken()
        );
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.count ?? 0);
        }
      } catch {
        // Non-critical
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, [user]);

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
            badge={"badgeKey" in item && item.badgeKey === "pendingSellers" ? pendingCount : undefined}
          />
        ))}
      </div>
    </nav>
  );
}
