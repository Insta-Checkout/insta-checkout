"use client"

import { motion } from "framer-motion"
import {
  Link2,
  Palette,
  Bell,
  BarChart3,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"

const FEATURE_ICONS = [
  Link2,
  Palette,
  Bell,
  BarChart3,
  ShoppingBag,
  ShieldCheck,
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function RedesignFeaturesSection() {
  const { t, get } = useTranslations()
  const items = (get("landing.features.items") ?? []) as Array<{
    title: string
    description: string
  }>

  return (
    <section
      id="features"
      className="px-4 py-20 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-2xl font-semibold text-[var(--r-text)] text-balance md:text-[2.5rem] md:leading-tight"
        >
          {t("landing.features.title")}
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item, i) => {
            const Icon = FEATURE_ICONS[i]
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                className="group rounded-2xl border border-[var(--r-glass-border)] bg-[var(--r-glass)]/50 p-6 backdrop-blur-xl transition-all duration-200 hover:border-[var(--r-icon)]/30 hover:bg-[var(--r-glass)]/80 cursor-default"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--r-icon-bg)] transition-colors duration-200 group-hover:bg-[var(--r-icon)]/20">
                  <Icon className="h-6 w-6 text-[var(--r-icon)]" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[var(--r-text)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--r-text-muted)]">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
