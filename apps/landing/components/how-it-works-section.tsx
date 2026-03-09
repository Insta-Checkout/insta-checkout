"use client"

import { motion } from "framer-motion"
import { UserPlus, Link2, Send } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"

const STEP_ICONS = [UserPlus, Link2, Send]

export function HowItWorksSection() {
  const { t, get } = useTranslations()
  const steps = (get("landing.howItWorks.steps") ?? []) as Array<{ title: string; description: string }>
  const stepNumbers = (get("landing.howItWorks.stepNumbers") ?? ["١", "٢", "٣"]) as string[]
  const stepPrefix = t("landing.howItWorks.stepPrefix")

  return (
    <section id="how-it-works" className="bg-[#F3EEFA] px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-[#7C3AED]">
            {t("landing.nav.howItWorks")}
          </p>
          <h2 className="text-3xl font-black text-[#1E0A3C] text-balance leading-tight md:text-5xl">
            {t("landing.howItWorks.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-[#64748B]">
            {t("landing.howItWorks.subtitle")}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid gap-6 lg:grid-cols-3 lg:gap-8">
          {steps.slice(0, 3).map((step, i) => {
            const Icon = STEP_ICONS[i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative overflow-hidden rounded-2xl bg-white p-7 shadow-[0_2px_8px_rgba(45,10,78,0.08)]"
              >
                {/* Giant background number */}
                <div
                  className="pointer-events-none absolute -top-4 -end-2 select-none font-black text-[120px] leading-none text-[#7C3AED]/5"
                  aria-hidden
                >
                  {stepNumbers[i]}
                </div>

                {/* Step badge */}
                <div className="relative mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDE9FE] shadow-md shadow-[#7C3AED]/10">
                    <Icon className="h-5 w-5 text-[#7C3AED]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
                    {stepPrefix} {stepNumbers[i]}
                  </span>
                </div>

                <h3 className="relative text-xl font-black text-[#1E0A3C] leading-tight">
                  {step.title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-[#64748B]">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA nudge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="/onboard"
            className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EA580C] px-8 py-4 text-base font-bold text-white transition-all hover:from-[#6D28D9] hover:to-[#C2410C] hover:shadow-lg hover:shadow-[#7C3AED]/25"
          >
            {t("landing.hero.cta")}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
