"use client"

import { motion } from "framer-motion"
import { Smartphone, FileText, HelpCircle, TrendingDown } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

const ICONS = [Smartphone, FileText, HelpCircle, TrendingDown]

export function RedesignPainPointsSection() {
  const { t, get } = useTranslations()
  const items = (get("landing.painPoints.items") ?? []) as Array<{
    title: string
    description: string
  }>

  return (
    <section className="px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-2xl font-semibold text-[var(--r-text)] text-balance md:text-[2.5rem] md:leading-tight"
        >
          {t("landing.painPoints.title")}
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4 lg:gap-6"
        >
          {ICONS.map((Icon, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="flex min-w-[260px] flex-col rounded-2xl border border-[var(--r-glass-border)] bg-[var(--r-glass)]/50 p-6 backdrop-blur-xl transition-all duration-200 hover:border-[var(--r-primary)]/30 hover:bg-[var(--r-glass)]/80 md:min-w-0 cursor-default"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--r-primary)]/20">
                <Icon className="h-6 w-6 text-[var(--r-primary)]" />
              </div>
              <h3 className="mt-4 text-base font-bold leading-relaxed text-[var(--r-text)]">
                {items[i]?.title ?? ""}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--r-text-muted)]">
                {items[i]?.description ?? ""}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center text-lg font-semibold text-[var(--r-cta)]"
        >
          {t("landing.painPoints.cta")}
        </motion.p>
      </div>
    </section>
  )
}
