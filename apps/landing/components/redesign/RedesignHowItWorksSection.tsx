"use client"

import { motion } from "framer-motion"
import { MessageCircle, Link2, Banknote } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"

const STEP_ICONS = [MessageCircle, Link2, Banknote]

export function RedesignHowItWorksSection() {
  const { t, get } = useTranslations()
  const steps = (get("landing.howItWorks.steps") ?? []) as Array<{
    title: string
    description: string
  }>
  const stepNumbers = (get("landing.howItWorks.stepNumbers") ?? [
    "1",
    "2",
    "3",
  ]) as string[]

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden px-4 py-20 lg:px-8 lg:py-28"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--r-primary)]/5 to-transparent" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold text-[var(--r-text)] text-balance md:text-[2.5rem] md:leading-tight">
            {t("landing.howItWorks.title")}
          </h2>
          <p className="mt-3 text-base text-[var(--r-text-muted)]">
            {t("landing.howItWorks.subtitle")}
          </p>
        </motion.div>

        <div className="mt-16 hidden lg:block">
          <div className="relative flex items-start justify-between">
            <div className="absolute top-6 right-[calc(16.67%)] left-[calc(16.67%)] border-t-2 border-dashed border-[var(--r-primary)]/30" />

            {steps.map((step, i) => {
              const StepIcon = STEP_ICONS[i]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.5 }}
                  className="relative flex w-1/3 flex-col items-center px-6 text-center"
                >
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--r-primary)] to-[var(--r-secondary)] font-mono text-xl font-bold text-[var(--r-bg)] shadow-xl shadow-[var(--r-primary)]/25">
                    {stepNumbers[i]}
                  </div>
                  <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--r-cta)]/20">
                    <StepIcon className="h-6 w-6 text-[var(--r-cta)]" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[var(--r-text)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--r-text-muted)]">
                    {step.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="mt-12 lg:hidden">
          <div className="relative flex flex-col gap-8 pr-8">
            <div className="absolute top-0 right-[23px] h-full w-0 border-r-2 border-dashed border-[var(--r-primary)]/30" />

            {steps.map((step, i) => {
              const StepIcon = STEP_ICONS[i]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.4 }}
                  className="relative flex gap-4"
                >
                  <div className="absolute -right-8 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--r-primary)] to-[var(--r-secondary)] font-mono text-lg font-bold text-[var(--r-bg)] shadow-lg">
                    {stepNumbers[i]}
                  </div>
                  <div className="mr-8">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--r-cta)]/20">
                      <StepIcon className="h-5 w-5 text-[var(--r-cta)]" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--r-text)]">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--r-text-muted)]">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
