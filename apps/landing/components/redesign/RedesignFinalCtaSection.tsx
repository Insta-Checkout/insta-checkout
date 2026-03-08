"use client"

import { motion } from "framer-motion"
import { useTranslations } from "@/lib/locale-provider"

export function RedesignFinalCtaSection() {
  const { t } = useTranslations()
  return (
    <section
      id="cta"
      className="relative overflow-hidden px-4 py-24 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--r-cta)] via-[var(--r-cta)] to-[#6D28D9]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto flex max-w-2xl flex-col items-center text-center"
      >
        <h2 className="text-2xl font-bold text-white text-balance md:text-[2.5rem] md:leading-tight">
          {t("landing.finalCta.title")}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/90">
          {t("landing.finalCta.subtitle")}
        </p>
        <a
          href="/onboard"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-bold text-[var(--r-cta)] shadow-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
        >
          {t("landing.finalCta.cta")}
        </a>
        <p className="mt-4 text-sm text-white/70">
          {t("landing.finalCta.noCard")}
        </p>
      </motion.div>
    </section>
  )
}
