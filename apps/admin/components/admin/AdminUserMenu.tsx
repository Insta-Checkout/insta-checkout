"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth/AuthProvider";

export function AdminUserMenu() {
  const { user, signOut } = useAuth();
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

  const email = user?.email || "Admin";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[#F3EEFA] transition-colors cursor-pointer"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline font-medium text-[#1E0A3C] max-w-[160px] truncate">
          {email}
        </span>
        <ChevronDown className={`h-4 w-4 text-[#6B5B7B] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-1 w-56 rounded-xl border border-[#E4D8F0] bg-white py-1 shadow-lg z-50">
          <div className="px-3 py-2 border-b border-[#E4D8F0]">
            <p className="text-sm font-medium text-[#1E0A3C] truncate">{email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#6B5B7B] hover:bg-[#F3EEFA] hover:text-[#1E0A3C] cursor-pointer transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
