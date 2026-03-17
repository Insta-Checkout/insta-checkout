"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTranslations } from "@/lib/locale-provider";
import { cn } from "@/lib/utils";

type Props = {
  businessName: string;
  userName: string | null;
  email: string;
  photoURL?: string | null;
};

export function UserMenu({ businessName, userName, email, photoURL }: Props) {
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

  const displayName = userName || businessName;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[#F3EEFA] transition-colors cursor-pointer"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={photoURL ?? undefined} alt={displayName} />
          <AvatarFallback className="bg-[#EDE9FE] text-[#7C3AED] text-xs font-cairo font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline font-medium text-[#1E0A3C] font-cairo max-w-[120px] truncate">
          {businessName}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-[#6B5B7B] transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-1 w-56 rounded-xl border border-[#E4D8F0] bg-white py-1 shadow-lg z-50">
          <div className="px-3 py-2 border-b border-[#E4D8F0]">
            <p className="text-sm font-bold text-[#1E0A3C] font-cairo truncate">{businessName}</p>
            {userName && (
              <p className="text-xs font-medium text-[#1E0A3C] font-cairo truncate mt-0.5">{userName}</p>
            )}
            <p className="text-xs text-[#6B5B7B] truncate mt-0.5">{email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#6B5B7B] hover:bg-[#F3EEFA] hover:text-[#1E0A3C] font-cairo cursor-pointer transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t("dashboard.userMenu.logout")}
          </button>
        </div>
      )}
    </div>
  );
}
