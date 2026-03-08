"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, CheckCircle2, Link2, BarChart3, Bell } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"

function DashboardPreview() {
  return (
    <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-[#F97316] flex items-center justify-center">
            <BarChart3 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold text-white/90">Sweet Treats</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#10B981]" />
          <span className="text-[10px] text-white/50">مباشر</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: "أوردرات", value: "24" },
          { label: "دفع مؤكد", value: "19" },
          { label: "الإجمالي", value: "5,700" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white/8 px-2 py-2.5 text-center">
            <p className="font-mono text-sm font-bold text-white">{s.value}</p>
            <p className="mt-0.5 text-[9px] text-white/50">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Order list */}
      <div className="space-y-2">
        {[
          { name: "سارة م.", product: "شوكولاتة كيك", amount: "300", status: "paid" },
          { name: "أحمد ر.", product: "كنافة", amount: "150", status: "paid" },
          { name: "نور ع.", product: "بسبوسة", amount: "120", status: "pending" },
        ].map((order, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7C3AED]/30 text-[9px] font-bold text-[#C4B5FD]">
                {order.name[0]}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white/90">{order.product}</p>
                <p className="text-[9px] text-white/40">{order.name}</p>
              </div>
            </div>
            <div className="text-left rtl:text-right">
              <p className="font-mono text-xs font-bold text-white">{order.amount} ج.م</p>
              <p className={`text-[9px] ${order.status === "paid" ? "text-[#10B981]" : "text-[#F59E0B]"}`}>
                {order.status === "paid" ? "✓ مؤكد" : "⏳ انتظار"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Create link button */}
      <button className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#F97316] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#EA580C]">
        <Link2 className="h-3 w-3" />
        أنشئ لينك دفع جديد
      </button>

      {/* Notification toast */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute -bottom-4 -end-4 flex items-center gap-2 rounded-xl border border-white/10 bg-[#10B981] px-3 py-2 shadow-lg shadow-[#10B981]/20"
      >
        <Bell className="h-3.5 w-3.5 text-white" />
        <p className="text-[10px] font-semibold text-white">تأكيد دفع جديد!</p>
      </motion.div>
    </div>
  )
}

export function HeroSection() {
  const { t, locale } = useTranslations()
  const isRTL = locale === "ar"
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#2D0A4E]">
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0">
        {/* Radial gradient glow */}
        <div className="absolute top-1/4 start-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/20 blur-[120px]" />
        <div className="absolute bottom-1/4 end-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-[#F97316]/10 blur-[120px]" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 pb-20 pt-32 lg:flex-row lg:gap-16 lg:px-8 lg:pt-24">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-start"
        >
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#F97316]/30 bg-[#F97316]/10 px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
            <span className="text-sm font-semibold text-[#FB923C]">{t("landing.hero.badge")}</span>
          </motion.div>

          {/* Main headline */}
          <h1 className="text-4xl font-black leading-[1.1] text-white text-balance lg:text-6xl xl:text-7xl">
            {(() => {
              const headline = t("landing.hero.headline")
              const parts = headline.split("—")
              if (parts.length > 1) {
                return (
                  <>
                    {parts[0].trim()}
                    <br />
                    <span className="bg-gradient-to-r from-[#F97316] to-[#FBBF24] bg-clip-text text-transparent">
                      {parts[1].trim()}
                    </span>
                  </>
                )
              }
              return headline
            })()}
          </h1>

          {/* Sub-headline */}
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/60 lg:text-lg">
            {t("landing.hero.subheadline")}
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href="/onboard"
              className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-7 py-4 text-base font-bold text-white transition-all hover:bg-[#EA580C] hover:shadow-lg hover:shadow-[#F97316]/25"
            >
              {t("landing.hero.cta")}
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/20 px-7 py-4 text-base font-semibold text-white/80 transition-all hover:border-white/40 hover:text-white"
            >
              {t("landing.nav.howItWorks")}
            </a>
          </div>

          {/* Trust row */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
            {[
              t("landing.hero.trust").split("·")[0],
              t("landing.hero.trust").split("·")[1],
              t("landing.hero.trust").split("·")[2],
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] flex-shrink-0" />
                <span className="text-sm text-white/50">{item?.trim()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="relative mt-12 flex flex-1 items-center justify-center lg:mt-0"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <DashboardPreview />
          </motion.div>

          {/* Floating link card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="absolute -start-4 top-1/4 hidden rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm lg:block"
          >
            <p className="text-[10px] text-white/50">لينك دفع جاهز</p>
            <p className="mt-0.5 font-mono text-xs font-bold text-[#F97316]">pay.co/sweet-treats</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 inset-x-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 30C1200 70 960 10 720 40C480 70 240 0 0 30L0 80Z" fill="#FAFAFA" />
        </svg>
      </div>
    </section>
  )
}
