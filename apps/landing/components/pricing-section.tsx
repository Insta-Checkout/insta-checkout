"use client"

import { motion } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"

export function PricingSection() {
  const { t, get } = useTranslations()
  const freeFeatures = (get("landing.pricing.freeFeatures") ?? [
    "لينكات دفع غير محدودة",
    "أوردرات غير محدودة",
    "صفحة دفع بالبراند بتاعك",
    "لوحة تحكم كاملة",
    "تتبع الأوردرات",
    "إشعارات فورية",
  ]) as string[]

  const proFeatures = (get("landing.pricing.proFeatures") ?? [
    "كل حاجة في الخطة المجانية",
    "كتالوج منتجات كامل",
    "صفحة متجر مخصصة",
    "تقارير وإحصائيات متقدمة",
    "بدون علامة Powered by",
    "دعم أولوية",
  ]) as string[]

  return (
    <section id="pricing" className="bg-white px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-[#F97316]">{t("landing.pricing.label")}</p>
          <h2 className="text-3xl font-black text-[#1E0A3C] text-balance leading-tight md:text-5xl">
            {t("landing.pricing.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-[#64748B]">
            {t("landing.pricing.subtitle")}
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {/* Free plan — featured */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-[#F97316] bg-white p-7 shadow-[0_4px_32px_rgba(249,115,22,0.15)]"
          >
            {/* Badge */}
            <div className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#FFF7ED] px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#F97316]" />
              <span className="text-xs font-bold text-[#F97316]">
                {t("landing.pricing.currentPlan")}
              </span>
            </div>

            <h3 className="text-2xl font-black text-[#1E0A3C]">
              {t("landing.pricing.free")}
            </h3>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-mono text-5xl font-black text-[#1E0A3C]">٠</span>
              <span className="text-lg font-semibold text-[#64748B]">{t("landing.pricing.perMonth")}</span>
            </div>

            <ul className="mt-7 flex-1 space-y-3">
              {freeFeatures.map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-[#1E0A3C]">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#FFF7ED]">
                    <Check className="h-3 w-3 text-[#F97316]" />
                  </div>
                  {feat}
                </li>
              ))}
            </ul>

            <a
              href="/onboard"
              className="mt-8 flex w-full cursor-pointer items-center justify-center rounded-2xl bg-[#F97316] px-6 py-4 text-base font-bold text-white transition-all hover:bg-[#EA580C] hover:shadow-lg hover:shadow-[#F97316]/25"
            >
              {t("landing.pricing.ctaFree")}
            </a>
            <p className="mt-3 text-center text-xs text-[#64748B]">
              {t("landing.finalCta.noCard")}
            </p>
          </motion.div>

          {/* Pro plan — coming soon */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative flex flex-col rounded-3xl border border-[#E4D8F0] bg-[#FAFAFA] p-7"
          >
            {/* Badge */}
            <div className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#F3EEFA] px-3 py-1.5">
              <span className="text-xs font-bold text-[#7C3AED]">
                {t("landing.pricing.proPrice")}
              </span>
            </div>

            <h3 className="text-2xl font-black text-[#1E0A3C]">
              {t("landing.pricing.pro")}
            </h3>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-mono text-5xl font-black text-[#1E0A3C]">١٩٩</span>
              <span className="text-lg font-semibold text-[#64748B]">{t("landing.pricing.perMonth")}</span>
            </div>

            <ul className="mt-7 flex-1 space-y-3">
              {proFeatures.map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-[#64748B]">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#F3EEFA]">
                    <Check className="h-3 w-3 text-[#7C3AED]" />
                  </div>
                  {feat}
                </li>
              ))}
            </ul>

            <button
              disabled
              className="mt-8 flex w-full items-center justify-center rounded-2xl border-2 border-[#E4D8F0] px-6 py-4 text-base font-bold text-[#7C3AED] opacity-60 cursor-not-allowed"
            >
              {t("landing.pricing.ctaPro")}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
