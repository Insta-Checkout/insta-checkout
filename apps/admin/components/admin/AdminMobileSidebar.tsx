"use client";

import { X } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AdminMobileSidebar({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 sm:hidden"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 start-0 z-50 w-64 bg-white shadow-xl sm:hidden">
        <div className="flex items-center justify-end p-4">
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#6B5B7B] hover:bg-[#F3EEFA] cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <AdminSidebar />
      </div>
    </>
  );
}
