"use client"

import { motion } from "framer-motion"
import { useTranslations } from "@/lib/locale-provider"
import { ArrowLeft, ArrowRight } from "lucide-react"

export function FinalCtaSection() {
  const { t, locale } = useTranslations()
  const isRTL = locale === "ar"
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  return (
    <section className="relative overflow-hidden bg-[#2D0A4E] px-4 py-20 lg:px-8 lg:py-28">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-24 -end-24 h-64 w-64 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-16 -start-16 h-48 w-48 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute top-1/2 start-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/30 blur-[80px]" />

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-black leading-tight text-white text-balance md:text-5xl lg:text-6xl">
            {t("landing.finalCta.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base text-white/75 lg:text-lg">
            {t("landing.finalCta.subtitle")}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="/onboard"
              className="group inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EA580C] px-8 py-4 text-base font-bold text-white transition-all hover:from-[#6D28D9] hover:to-[#C2410C] hover:shadow-xl hover:shadow-[#7C3AED]/25"
            >
              {t("landing.finalCta.cta")}
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </a>
          </div>

          <p className="mt-4 text-sm text-white/60">
            {t("landing.finalCta.noCard")}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
