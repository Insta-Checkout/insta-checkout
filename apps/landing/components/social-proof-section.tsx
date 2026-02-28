"use client"

import { motion } from "framer-motion"
import { Users, Link2, Clock } from "lucide-react"

const testimonials = [
  {
    initials: "س م",
    name: "سارة م.",
    type: "بتبيع حلويات على إنستجرام",
    quote: "كنت بقضي نص ساعة أتابع كل أوردر. دلوقتي كله أوتوماتيك.",
  },
  {
    initials: "أ ر",
    name: "أحمد ر.",
    type: "محل موبايلات",
    quote: "عملائي بقوا يدفعوا أسرع لأن اللينك سهل ومباشر.",
  },
  {
    initials: "ن ع",
    name: "نور ع.",
    type: "ملابس فينتدج",
    quote: "أحسن حاجة إن مفيش تطبيق — كله على واتساب.",
  },
]

const stats = [
  { icon: Users, value: "٥٠٠+", label: "بيّاع" },
  { icon: Link2, value: "١٠,٠٠٠+", label: "لينك دفع" },
  { icon: Clock, value: "دقيقتين", label: "وتبدأ" },
]

export function SocialProofSection() {
  return (
    <section className="bg-secondary px-4 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-2xl font-semibold text-foreground text-balance md:text-[2.5rem] md:leading-tight"
        >
          بيّاعين زيك بدأوا يقبضوا أسرع
        </motion.h2>

        {/* Testimonials */}
        <div className="mt-12 flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="min-w-[280px] rounded-xl bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] md:min-w-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.type}</p>
                </div>
              </div>
              <p className="mt-4 text-sm italic leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 grid grid-cols-3 gap-4 rounded-xl bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
        >
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <stat.icon className="mb-2 h-5 w-5 text-primary" />
              <span className="font-mono text-2xl font-bold text-primary lg:text-3xl">
                {stat.value}
              </span>
              <span className="mt-1 text-xs text-muted-foreground lg:text-sm">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
