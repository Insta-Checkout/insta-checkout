"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTranslations } from "@/lib/locale-provider";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  email: string;
  photoURL?: string | null;
};

export function UserMenu({ name, email, photoURL }: Props) {
  const { t } = useTranslations();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50 transition-colors"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={photoURL ?? undefined} alt={name} />
          <AvatarFallback className="bg-teal-100 text-teal-800 text-xs font-cairo">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline font-medium text-slate-700 font-cairo max-w-[120px] truncate">
          {name}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-slate-500 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-50">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-900 font-cairo truncate">{name}</p>
            <p className="text-xs text-slate-500 truncate">{email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 font-cairo"
          >
            <LogOut className="h-4 w-4" />
            {t("dashboard.userMenu.logout")}
          </button>
        </div>
      )}
    </div>
  );
}
