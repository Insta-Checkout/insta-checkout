"use client"

import { useState, useEffect } from "react"
import { Menu, X, LogOut, Zap } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { onAuthStateChanged } from "firebase/auth"
import { useTranslations } from "@/lib/locale-provider"
import { LanguageSwitcher } from "./language-switcher"
import { auth, signOutUser } from "@/lib/firebase"

export function Navbar() {
  const { t } = useTranslations()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<typeof auth.currentUser>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navLinks = [
    { label: t("landing.nav.features"), href: "#features" },
    { label: t("landing.nav.howItWorks"), href: "#how-it-works" },
    { label: t("landing.nav.pricing"), href: "#pricing" },
  ]

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`flex w-full max-w-6xl items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 shadow-lg shadow-[#2D0A4E]/10 backdrop-blur-xl border border-[#E4D8F0]"
            : "bg-white/10 backdrop-blur-md border border-white/20"
        }`}
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F97316]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className={`text-base font-bold tracking-tight transition-colors ${scrolled ? "text-[#1E0A3C]" : "text-white"}`}>
            Insta Checkout
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                scrolled
                  ? "text-[#64748B] hover:text-[#1E0A3C]"
                  : "text-white/75 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {user ? (
            <>
              <a
                href="/dashboard"
                className="rounded-xl border border-[#F97316] px-4 py-2 text-sm font-semibold text-[#F97316] transition-colors hover:bg-[#F97316] hover:text-white cursor-pointer"
              >
                {t("landing.nav.dashboard")}
              </a>
              <button
                onClick={() => signOutUser().then(() => (window.location.href = "/"))}
                className="flex items-center gap-1.5 rounded-xl border border-[#E4D8F0] px-3 py-2 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F3EEFA] cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t("landing.nav.logout")}
              </button>
            </>
          ) : (
            <a
              href="/onboard"
              className="rounded-xl bg-[#F97316] px-5 py-2 text-sm font-bold text-white transition-all hover:bg-[#EA580C] hover:shadow-md cursor-pointer"
            >
              {t("landing.nav.cta")}
            </a>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`flex h-9 w-9 items-center justify-center rounded-xl md:hidden cursor-pointer ${
            scrolled ? "text-[#1E0A3C]" : "text-white"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t("common.closeMenu") : t("common.openMenu")}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 inset-x-4 rounded-2xl border border-[#E4D8F0] bg-white shadow-xl shadow-[#2D0A4E]/10"
          >
            <div className="flex flex-col gap-1 p-4">
              <div className="mb-3 flex justify-center">
                <LanguageSwitcher />
              </div>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-[#1E0A3C] transition-colors hover:bg-[#F3EEFA] cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              {user ? (
                <>
                  <a
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 rounded-xl bg-[#F97316] px-4 py-3 text-center text-base font-bold text-white cursor-pointer"
                  >
                    {t("landing.nav.dashboard")}
                  </a>
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      signOutUser().then(() => (window.location.href = "/"))
                    }}
                    className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-[#E4D8F0] px-4 py-3 text-base font-medium text-[#64748B] hover:bg-[#F3EEFA] cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("landing.nav.logout")}
                  </button>
                </>
              ) : (
                <a
                  href="/onboard"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-xl bg-[#F97316] px-4 py-3 text-center text-base font-bold text-white cursor-pointer"
                >
                  {t("landing.nav.cta")}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
