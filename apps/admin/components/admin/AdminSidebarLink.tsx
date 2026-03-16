"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
};

export function AdminSidebarLink({ href, icon: Icon, label, active }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-[#7C3AED] text-white shadow-sm"
          : "text-[#6B5B7B] hover:bg-[#F3EEFA] hover:text-[#1E0A3C]"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
