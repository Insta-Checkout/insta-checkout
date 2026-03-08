"use client"

import { motion } from "framer-motion"
import { Link2, Palette, Bell, BarChart3, ShoppingBag, ShieldCheck } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"

const FEATURE_ICONS = [Link2, Palette, BarChart3, ShieldCheck, ShoppingBag, Bell]

export function FeaturesSection() {
  const { t, get } = useTranslations()
  const items = (get("landing.features.items") ?? []) as Array<{ title: string; description: string }>

  return (
    <section id="features" className="bg-white px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-[#F97316]">
            {t("landing.features.label")}
          </p>
          <h2 className="text-3xl font-black text-[#1E0A3C] text-balance leading-tight md:text-5xl">
            {t("landing.features.title")}
          </h2>
        </motion.div>

        {/* Features grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = FEATURE_ICONS[i] ?? Link2
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.1 }}
                className="group rounded-2xl border border-[#E4D8F0] bg-white p-6 transition-all hover:border-[#7C3AED]/30 hover:shadow-[0_4px_20px_rgba(124,58,237,0.10)]"
              >
                {/* Icon — uniform purple */}
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3EEFA]">
                  <Icon className="h-5 w-5 text-[#7C3AED]" />
                </div>

                <h3 className="text-base font-bold text-[#1E0A3C]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
