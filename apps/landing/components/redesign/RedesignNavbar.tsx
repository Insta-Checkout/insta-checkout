"use client"

import { useState, useEffect } from "react"
import { Menu, X, Zap, LogOut } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { onAuthStateChanged } from "firebase/auth"
import { useTranslations } from "@/lib/locale-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import { auth, signOutUser } from "@/lib/firebase"

export function RedesignNavbar() {
  const { t } = useTranslations()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<typeof auth.currentUser>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const navLinks = [
    { label: t("landing.nav.features"), href: "#features" },
    { label: t("landing.nav.howItWorks"), href: "#how-it-works" },
    { label: t("landing.nav.pricing"), href: "#pricing" },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--r-bg)]/80 backdrop-blur-xl border-b border-[var(--r-glass-border)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8 lg:py-5">
        <a
          href="#"
          className="flex items-center gap-2.5 cursor-pointer transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--r-primary)] to-[var(--r-secondary)] shadow-lg shadow-[var(--r-primary)]/20">
            <Zap className="h-5 w-5 text-[var(--r-bg)]" />
          </div>
          <span className="text-lg font-bold text-[var(--r-text)]">
            InstaPay Checkout
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--r-text-muted)] transition-colors duration-200 hover:text-[var(--r-text)] cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {user ? (
            <>
              <a
                href="/dashboard"
                className="rounded-xl border border-[var(--r-cta)] px-5 py-2.5 text-sm font-semibold text-[var(--r-cta)] transition-all duration-200 hover:bg-[var(--r-cta)] hover:text-white cursor-pointer"
              >
                {t("landing.nav.dashboard")}
              </a>
              <button
                onClick={() => signOutUser().then(() => (window.location.href = "/"))}
                className="flex items-center gap-2 rounded-xl border border-[var(--r-border)] px-4 py-2.5 text-sm font-medium text-[var(--r-text-muted)] transition-colors duration-200 hover:bg-[var(--r-glass)] hover:text-[var(--r-text)] cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                {t("landing.nav.logout")}
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="rounded-xl bg-[var(--r-cta)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--r-cta)]/30 transition-all duration-200 hover:bg-[var(--r-cta-hover)] hover:shadow-[var(--r-cta)]/40 cursor-pointer"
            >
              {t("landing.nav.login")}
            </a>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--r-text)] md:hidden cursor-pointer transition-colors hover:bg-[var(--r-glass)]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t("common.closeMenu") : t("common.openMenu")}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[var(--r-border)] bg-[var(--r-bg-elevated)]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              <div className="mb-2 flex justify-center md:hidden">
                <LanguageSwitcher />
              </div>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-[var(--r-text)] transition-colors hover:bg-[var(--r-glass)] cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              {user ? (
                <>
                  <a
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 rounded-xl bg-[var(--r-cta)] px-4 py-3 text-center text-base font-semibold text-white cursor-pointer"
                  >
                    {t("landing.nav.dashboard")}
                  </a>
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      signOutUser().then(() => (window.location.href = "/"))
                    }}
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-[var(--r-border)] px-4 py-3 text-base font-medium text-[var(--r-text-muted)] hover:bg-[var(--r-glass)] cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("landing.nav.logout")}
                  </button>
                </>
              ) : (
                <a
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-xl bg-[var(--r-cta)] px-4 py-3 text-center text-base font-semibold text-white cursor-pointer"
                >
                  {t("landing.nav.login")}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
