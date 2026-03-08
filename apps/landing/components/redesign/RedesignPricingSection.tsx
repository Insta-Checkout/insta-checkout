"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"

export function RedesignPricingSection() {
  const { t, get } = useTranslations()
  const freePlanFeatures = (get("landing.pricing.freeFeatures") ?? []) as string[]
  const proPlanFeatures = (get("landing.pricing.proFeatures") ?? []) as string[]

  return (
    <section id="pricing" className="px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold text-[var(--r-text)] text-balance md:text-[2.5rem] md:leading-tight">
            {t("landing.pricing.title")}
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col rounded-2xl border border-[var(--r-glass-border)] bg-[var(--r-glass)]/50 p-6 backdrop-blur-xl"
          >
            <h3 className="text-lg font-bold text-[var(--r-text)]">
              {t("landing.pricing.free")}
            </h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-mono text-4xl font-bold text-[var(--r-text)]">
                0
              </span>
              <span className="text-sm text-[var(--r-text-muted)]">
                {" "}
                {t("landing.pricing.perMonth")}
              </span>
            </div>

            <ul className="mt-6 flex flex-col gap-3">
              {freePlanFeatures.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-[var(--r-text)]"
                >
                  <Check className="h-4 w-4 shrink-0 text-[var(--r-primary)]" />
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href="/onboard"
              className="mt-8 inline-flex items-center justify-center rounded-xl border-2 border-[var(--r-cta)] px-6 py-3 text-sm font-bold text-[var(--r-cta)] transition-all duration-200 hover:bg-[var(--r-cta)] hover:text-white cursor-pointer"
            >
              {t("landing.pricing.ctaFree")}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative flex flex-col rounded-2xl border-2 border-[var(--r-cta)] bg-[var(--r-cta)]/10 p-6 shadow-xl shadow-[var(--r-cta)]/20"
          >
            <div className="absolute -top-3 start-6 rounded-full bg-[var(--r-cta)] px-3 py-1 text-xs font-bold text-white">
              {t("landing.pricing.popular")}
            </div>
            <h3 className="text-lg font-bold text-[var(--r-text)]">
              {t("landing.pricing.pro")}
            </h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-mono text-4xl font-bold text-[var(--r-text)]">
                199
              </span>
              <span className="text-sm text-[var(--r-text-muted)]">
                {" "}
                {t("landing.pricing.perMonth")}
              </span>
            </div>

            <ul className="mt-6 flex flex-col gap-3">
              {proPlanFeatures.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-[var(--r-text)]"
                >
                  <Check className="h-4 w-4 shrink-0 text-[var(--r-cta)]" />
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href="/onboard"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-[var(--r-cta)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--r-cta)]/30 transition-all duration-200 hover:bg-[var(--r-cta-hover)] hover:shadow-[var(--r-cta)]/40 cursor-pointer"
            >
              {t("landing.pricing.ctaPro")}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
