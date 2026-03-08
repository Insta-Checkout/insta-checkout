"use client"

import { motion } from "framer-motion"
import { Users, Link2, Clock } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"

const STAT_ICONS = [Users, Link2, Clock]

export function RedesignSocialProofSection() {
  const { t, get } = useTranslations()
  const testimonials = (get("landing.socialProof.testimonials") ?? []) as Array<{
    initials: string
    name: string
    type: string
    quote: string
  }>
  const stats = (get("landing.socialProof.stats") ?? []) as Array<{
    value: string
    label: string
  }>

  return (
    <section className="relative overflow-hidden px-4 py-20 lg:px-8 lg:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--r-cta)]/5 to-transparent" />
      <div className="relative mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-2xl font-semibold text-[var(--r-text)] text-balance md:text-[2.5rem] md:leading-tight"
        >
          {t("landing.socialProof.title")}
        </motion.h2>

        <div className="mt-12 flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="min-w-[280px] rounded-2xl border border-[var(--r-glass-border)] bg-[var(--r-glass)]/50 p-6 backdrop-blur-xl md:min-w-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--r-icon)] to-[var(--r-icon-secondary)] font-bold text-[var(--r-on-primary)]">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--r-text)]">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-[var(--r-text-muted)]">
                    {testimonial.type}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm italic leading-relaxed text-[var(--r-text)]/90">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 grid grid-cols-3 gap-4 rounded-2xl border border-[var(--r-glass-border)] bg-[var(--r-glass)]/50 p-6 backdrop-blur-xl"
        >
          {stats.map((stat, i) => {
            const StatIcon = STAT_ICONS[i]
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center"
              >
                <StatIcon className="mb-2 h-5 w-5 text-[var(--r-primary)]" />
                <span className="font-mono text-2xl font-bold text-[var(--r-primary)] lg:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-1 text-xs text-[var(--r-text-muted)] lg:text-sm">
                  {stat.label}
                </span>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
