"use client"

import { useState, useEffect } from "react"
import { Menu, X, Zap, LogOut, Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { onAuthStateChanged } from "firebase/auth"
import { useTranslations } from "@/lib/locale-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import { auth, signOutUser } from "@/lib/firebase"

export function RedesignNavbar() {
  const { t, locale, setLocale, locales } = useTranslations()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileLangOpen, setMobileLangOpen] = useState(false)
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
            <Zap className="h-5 w-5 text-[var(--r-on-primary)]" />
          </div>
          <span className="text-lg font-bold text-[var(--r-text)]">
            Insta Checkout
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

        {/* Mobile pill: Globe + Burger */}
        <div className="flex items-center gap-0.5 rounded-xl border border-[var(--r-glass-border)] bg-[var(--r-glass)] px-1 py-1 md:hidden">
          <div className="relative">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--r-text-muted)] cursor-pointer transition-colors hover:bg-[var(--r-bg-elevated)] hover:text-[var(--r-text)]"
              onClick={() => setMobileLangOpen(!mobileLangOpen)}
              aria-label="Select language"
            >
              <Globe className="h-5 w-5" />
            </button>
            <AnimatePresence>
              {mobileLangOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute end-0 top-11 z-50 min-w-[120px] rounded-xl border border-[var(--r-glass-border)] bg-[var(--r-bg-elevated)] p-1 shadow-xl"
                >
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => { setLocale(loc); setMobileLangOpen(false) }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        locale === loc
                          ? "bg-[var(--r-primary)] text-[var(--r-on-primary)]"
                          : "text-[var(--r-text-muted)] hover:text-[var(--r-text)] hover:bg-[var(--r-glass)]"
                      }`}
                    >
                      {loc === "ar" ? "العربية" : "English"}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--r-text)] cursor-pointer transition-colors hover:bg-[var(--r-bg-elevated)]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t("common.closeMenu") : t("common.openMenu")}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
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
