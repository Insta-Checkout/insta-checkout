"use client"

import { motion } from "framer-motion"
import { MessageCircle, Link2, Banknote } from "lucide-react"

const steps = [
  {
    icon: MessageCircle,
    number: "١",
    title: "سجّل في دقيقتين",
    description: "ادخل اسم البيزنس بتاعك وحساب InstaPay — خلاص كده.",
  },
  {
    icon: Link2,
    number: "٢",
    title: "أنشئ لينك دفع فوري",
    description:
      "ابعت اسم المنتج والسعر للبوت على واتساب — هيبعتلك لينك في ثانية.",
  },
  {
    icon: Banknote,
    number: "٣",
    title: "العميل يدفع وانت تتابع",
    description:
      "العميل يفتح اللينك، يحوّل InstaPay، ويأكد. انت تاخد إشعار فوري.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-secondary px-4 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold text-foreground text-balance md:text-[2.5rem] md:leading-tight">
            ازاي بتشتغل
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            ٣ خطوات بس — وتبدأ تقبض
          </p>
        </motion.div>

        {/* Desktop Timeline */}
        <div className="mt-14 hidden lg:block">
          <div className="relative flex items-start justify-between">
            {/* Dashed connector line */}
            <div className="absolute top-6 right-[calc(16.67%)] left-[calc(16.67%)] border-t-2 border-dashed border-primary/30" />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="relative flex w-1/3 flex-col items-center px-6 text-center"
              >
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-mono text-lg font-bold text-primary-foreground shadow-lg">
                  {step.number}
                </div>
                <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="mt-10 lg:hidden">
          <div className="relative flex flex-col gap-8 pr-8">
            {/* Vertical dashed line */}
            <div className="absolute top-0 right-[23px] h-full w-0 border-r-2 border-dashed border-primary/30" />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="relative flex gap-4"
              >
                <div className="absolute -right-8 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-lg font-bold text-primary-foreground shadow-lg">
                  {step.number}
                </div>
                <div className="mr-8">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
