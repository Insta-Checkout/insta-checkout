"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
};

export function SidebarLink({ href, icon: Icon, label, active }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors font-cairo",
        active
          ? "bg-[#EDE9FE] text-[#7C3AED] font-semibold"
          : "text-[#6B5B7B] hover:bg-[#F3EEFA] hover:text-[#1E0A3C]"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
