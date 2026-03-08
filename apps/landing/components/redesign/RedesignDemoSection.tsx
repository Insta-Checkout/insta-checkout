"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { RedesignDemoForm } from "./RedesignDemoForm"
import { BUSINESS_TYPES, type BusinessType } from "@/components/demo/smart-defaults"
import { useTranslations } from "@/lib/locale-provider"

const FIRST_CATEGORY = BUSINESS_TYPES[0].value
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]

export function RedesignDemoSection() {
  const [selectedCategory, setSelectedCategory] = useState<BusinessType>(FIRST_CATEGORY)
  const searchParams = useSearchParams()
  const { t } = useTranslations()

  const ctaHref = useMemo(() => {
    const params = new URLSearchParams()
    params.set("category", selectedCategory)
    UTM_KEYS.forEach((key) => {
      const val = searchParams.get(key)
      if (val) params.set(key, val)
    })
    return `/onboard?${params.toString()}`
  }, [selectedCategory, searchParams])

  return (
    <section id="demo" className="relative px-4 py-20 lg:px-8 lg:py-28">
      <div className="absolute inset-0 bg-[var(--r-bg-elevated)]/50" />
      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-2xl font-semibold text-[var(--r-text)] text-balance md:text-[2.5rem] md:leading-tight">
            {t("landing.demo.title")}
          </h2>
          <p className="mt-3 text-base text-[var(--r-text-muted)]">
            {t("landing.demo.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-[var(--r-glass-border)] bg-[var(--r-glass)]/50 p-6 backdrop-blur-xl shadow-xl sm:p-8"
        >
          <RedesignDemoForm onCategoryChange={setSelectedCategory} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <a
            href={ctaHref}
            className="inline-flex h-12 w-full max-w-[400px] items-center justify-center rounded-xl bg-[var(--r-cta)] text-base font-bold text-white shadow-xl shadow-[var(--r-cta)]/30 transition-all duration-200 hover:bg-[var(--r-cta-hover)] hover:shadow-[var(--r-cta)]/40 cursor-pointer"
          >
            {t("landing.demo.cta")}
          </a>
          <p className="text-sm text-[var(--r-text-muted)]">
            {t("landing.hero.trust")}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
