"use client"

import { motion } from "framer-motion"
import { useTranslations } from "@/lib/locale-provider"
import { Building2, ArrowUpRight, Shield } from "lucide-react"

const TRUST_ICONS = [Building2, ArrowUpRight, Shield]

export function SocialProofSection() {
  const { t, get } = useTranslations()
  const trust = (get("landing.socialProof.trust") ?? []) as Array<{ title: string; description: string }>

  const defaultTrust = [
    { title: t("landing.socialProof.trust0Title") || "مبنيّة على InstaPay", description: t("landing.socialProof.trust0Desc") || "الفلوس بتروح لحسابك مباشرة — إحنا مش في نص التحويل." },
    { title: t("landing.socialProof.trust1Title") || "مصمّمة للسوق المصري", description: t("landing.socialProof.trust1Desc") || "عربي أولاً، موبايل أولاً — مبنية لطريقة شغلك الحقيقية." },
    { title: t("landing.socialProof.trust2Title") || "مجانية بالكامل", description: t("landing.socialProof.trust2Desc") || "مفيش رسوم خفية، مفيش بطاقة ائتمان. سجّل وابدأ." },
  ]

  const displayTrust = trust.length > 0 ? trust : defaultTrust

  return (
    <section className="overflow-hidden bg-[#2D0A4E] px-4 py-20 lg:px-8 lg:py-28">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 start-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/20 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-[#FB923C]">
            {t("landing.socialProof.label")}
          </p>
          <h2 className="text-3xl font-black text-white text-balance leading-tight md:text-5xl">
            {t("landing.socialProof.title")}
          </h2>
        </motion.div>

        {/* Trust cards — uniform purple icons */}
        <div className="grid gap-5 sm:grid-cols-3">
          {displayTrust.map((card, i) => {
            const Icon = TRUST_ICONS[i] ?? Building2
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#7C3AED]/20">
                  <Icon className="h-5 w-5 text-[#C4B5FD]" />
                </div>
                <h3 className="text-base font-bold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{card.description}</p>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
