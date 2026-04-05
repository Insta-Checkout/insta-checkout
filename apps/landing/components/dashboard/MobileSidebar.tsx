"use client";

import { X } from "lucide-react";
import { useTranslations } from "@/lib/locale-provider";
import { Sidebar } from "./Sidebar";

type Props = { open: boolean; onClose: () => void };

export function MobileSidebar({ open, onClose }: Props) {
  const { t, locale } = useTranslations();
  if (!open) return null;

  const isRtl = locale === "ar";

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <aside
        className={`absolute top-0 bottom-0 w-64 bg-white shadow-xl ${
          isRtl
            ? "right-0 border-l border-[#E4D8F0]"
            : "left-0 border-r border-[#E4D8F0]"
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 p-2 text-[#6B5B7B] hover:text-[#1E0A3C] hover:bg-[#F3EEFA] rounded-lg cursor-pointer transition-colors ${
            isRtl ? "left-4" : "right-4"
          }`}
          aria-label={t("dashboard.aria.closeMenu")}
        >
          <X className="h-5 w-5" />
        </button>
        <div className="pt-14">
          <Sidebar />
        </div>
      </aside>
    </div>
  );
}
