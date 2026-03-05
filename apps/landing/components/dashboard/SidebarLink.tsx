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
          ? "bg-teal-50 text-[#0D9488]"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
