"use client"

import { motion } from "framer-motion"
import { useTranslations } from "@/lib/locale-provider"
import { ArrowLeft, ArrowRight, MessageSquare, FileText, HelpCircle, TrendingDown } from "lucide-react"

const ICONS = [MessageSquare, FileText, HelpCircle, TrendingDown]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function PainPointsSection() {
  const { t, get, locale } = useTranslations()
  const items = (get("landing.painPoints.items") ?? []) as Array<{ title: string; description: string }>
  const isRTL = locale === "ar"
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  return (
    <section className="bg-white px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-[#7C3AED]">{t("landing.painPoints.label")}</p>
          <h2 className="text-3xl font-black text-[#1E0A3C] text-balance leading-tight md:text-5xl">
            {t("landing.painPoints.title")}
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {items.map((item, i) => {
            const Icon = ICONS[i] ?? MessageSquare
            return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl border border-[#E4D8F0] bg-white p-6 shadow-[0_2px_8px_rgba(45,10,78,0.06)] transition-all hover:shadow-[0_4px_20px_rgba(45,10,78,0.1)] hover:-translate-y-0.5"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#EDE9FE] text-[#7C3AED]">
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="text-base font-bold leading-snug text-[#1E0A3C]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                {item.description}
              </p>

              {/* Subtle accent border on hover */}
              <div className="absolute bottom-0 start-0 h-0.5 w-0 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] transition-all duration-300 group-hover:w-full rtl:bg-gradient-to-l" />
            </motion.div>
            )
          })}
        </motion.div>

        {/* Transition line */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex items-center justify-center gap-2"
        >
          <a
            href="#how-it-works"
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E4D8F0] bg-[#F3EEFA] px-5 py-2.5 text-sm font-semibold text-[#7C3AED] transition-all hover:border-[#7C3AED]/30 hover:bg-[#EDE9FE]"
          >
            {t("landing.painPoints.cta")}
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
