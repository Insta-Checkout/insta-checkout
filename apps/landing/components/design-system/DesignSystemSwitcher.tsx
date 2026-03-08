"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Palette, ChevronDown } from "lucide-react"
import { useState } from "react"

const SYSTEMS = [
  { id: "hub", path: "/design-system", label: "All Systems" },
  { id: "1", path: "/design-system/1", label: "DS 1", desc: "Sky blue + orange" },
  { id: "2", path: "/design-system/2", label: "DS 2", desc: "Purple + orange" },
  { id: "3", path: "/design-system/3", label: "DS 3", desc: "Purple glass" },
  { id: "4", path: "/design-system/4", label: "DS 4", desc: "Teal glass" },
] as const

export function DesignSystemSwitcher() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const current = SYSTEMS.find((s) => pathname === s.path || pathname?.startsWith(s.path + "/"))
    ?? SYSTEMS.find((s) => pathname?.startsWith("/design-system/"))
    ?? SYSTEMS[0]

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-xl border border-[var(--r-glass-border)] bg-[var(--r-bg-elevated)]/95 px-4 py-2.5 shadow-xl backdrop-blur-xl transition-all hover:bg-[var(--r-glass)] cursor-pointer"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label="Switch design system"
        >
          <Palette className="h-4 w-4 text-[var(--r-primary)]" />
          <span className="text-sm font-medium text-[var(--r-text)]">
            {current?.label ?? "Design Systems"}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[var(--r-text-muted)] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <ul
              role="listbox"
              className="absolute bottom-full left-1/2 mb-2 w-56 -translate-x-1/2 rounded-xl border border-[var(--r-glass-border)] bg-[var(--r-bg-elevated)]/98 p-2 shadow-xl backdrop-blur-xl"
            >
              {SYSTEMS.map((sys) => (
                <li key={sys.id} role="option">
                  <Link
                    href={sys.path}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                      pathname === sys.path
                        ? "bg-[var(--r-primary)]/20 text-[var(--r-primary)] font-medium"
                        : "text-[var(--r-text)] hover:bg-[var(--r-glass)]"
                    }`}
                  >
                    <span className="font-medium">{sys.label}</span>
                    {sys.desc && (
                      <span className="ml-2 text-xs text-[var(--r-text-muted)]">
                        {sys.desc}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
