"use client"

import { motion } from "framer-motion"
import { MessageCircle, Smartphone } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"

function PhoneMockup({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative mx-auto w-[260px] rounded-[2rem] border border-[var(--r-glass-border)] bg-[var(--r-glass)]/50 backdrop-blur-xl p-2 shadow-2xl ${className}`}
    >
      <div className="absolute top-0 left-1/2 h-6 w-24 -translate-x-1/2 rounded-b-xl bg-[var(--r-text)]/10" />
      <div className="overflow-hidden rounded-[1.5rem] bg-[var(--r-bg-elevated)]">
        {children}
      </div>
    </div>
  )
}

function WhatsAppChat({ t }: { t: (k: string) => string }) {
  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2 border-b border-[var(--r-border)] pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--r-cta)]">
          <MessageCircle className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-[var(--r-text)]">
            {t("landing.heroMockup.botName")}
          </p>
          <p className="text-[10px] text-[var(--r-text-muted)]">
            {t("landing.heroMockup.connected")}
          </p>
        </div>
      </div>
      <div className="self-end rounded-xl rounded-tl-sm bg-[var(--r-cta)]/20 px-3 py-2">
        <p className="text-xs text-[var(--r-text)]">
          {t("landing.heroMockup.sellerMessage")}
        </p>
      </div>
      <div className="self-start rounded-xl rounded-tr-sm bg-[var(--r-glass)] px-3 py-2 backdrop-blur-sm">
        <p className="text-xs text-[var(--r-text)]">
          {t("landing.heroMockup.botReply")}
        </p>
        <p className="mt-1 text-[10px] font-mono text-[var(--r-cta)] break-all">
          pay.instapay.co/choc-cake
        </p>
      </div>
      <div className="self-end rounded-xl rounded-tl-sm bg-[var(--r-cta)]/20 px-3 py-2">
        <p className="text-xs text-[var(--r-text-muted)]">
          {t("landing.heroMockup.sellerSends")}
        </p>
      </div>
    </div>
  )
}

function CheckoutPreview({ t }: { t: (k: string) => string }) {
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--r-primary)]">
        <Smartphone className="h-5 w-5 text-[var(--r-bg)]" />
      </div>
      <p className="text-xs font-bold text-[var(--r-text)]">Sweet Treats</p>
      <div className="w-full rounded-lg bg-[var(--r-glass)] p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--r-text-muted)]">
            {t("landing.heroMockup.productLabel")}
          </span>
          <span className="font-mono text-sm font-bold text-[var(--r-text)]">
            300 {t("common.egpShort")}
          </span>
        </div>
      </div>
      <button className="w-full rounded-lg bg-[var(--r-cta)] py-2.5 text-xs font-bold text-white shadow-lg shadow-[var(--r-cta)]/30 cursor-pointer transition-all duration-200 hover:shadow-[var(--r-cta)]/40">
        {t("landing.heroMockup.payButton")}
      </button>
      <p className="text-[10px] text-[var(--r-text-muted)]">
        {t("landing.heroMockup.secure")}
      </p>
    </div>
  )
}

export function RedesignHeroSection() {
  const { t } = useTranslations()
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-24 lg:px-8 lg:pt-24 lg:pb-32">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[var(--r-primary)]/20 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/2 -left-40 h-64 w-64 rounded-full bg-[var(--r-cta)]/15 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--r-primary)]/10 blur-[90px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col-reverse items-center gap-14 lg:flex-row lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative flex items-end justify-center gap-4 lg:w-1/2"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <PhoneMockup>
              <WhatsAppChat t={t} />
            </PhoneMockup>
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="-mb-4"
          >
            <PhoneMockup className="w-[220px] scale-90">
              <CheckoutPreview t={t} />
            </PhoneMockup>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-start"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--r-glass-border)] bg-[var(--r-glass)] px-4 py-1.5 text-xs font-medium text-[var(--r-text-muted)] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--r-primary)] animate-pulse" />
            {t("landing.hero.trust")}
          </span>
          <h1 className="text-4xl font-bold leading-tight text-[var(--r-text)] text-balance lg:text-[3.5rem] lg:leading-[1.15]">
            {t("landing.hero.headline")}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--r-text-muted)] lg:text-lg">
            {t("landing.hero.subheadline")}
          </p>
          <a
            href="/onboard"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[var(--r-cta)] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[var(--r-cta)]/30 transition-all duration-200 hover:bg-[var(--r-cta-hover)] hover:shadow-[var(--r-cta)]/40 sm:w-auto cursor-pointer"
          >
            {t("landing.hero.cta")}
          </a>
          <p className="mt-4 text-sm text-[var(--r-text-muted)]">
            {t("landing.hero.trust")}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
