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

const features = [
  {
    icon: Link2,
    title: "لينكات دفع فورية",
    description: "أنشئ لينك لأي منتج أو خدمة في ثانية من واتساب.",
  },
  {
    icon: Palette,
    title: "صفحة دفع بالبراند بتاعك",
    description:
      "اسم البيزنس بتاعك، الألوان بتاعتك — العميل يحس إنه بيشتري منك مباشرة.",
  },
  {
    icon: Bell,
    title: "إشعارات فورية",
    description:
      "أول ما العميل يدفع، تاخد إشعار على واتساب بالتفاصيل والسكرين شوت.",
  },
  {
    icon: BarChart3,
    title: "تتبع الأوردرات",
    description:
      "كل الأوردرات في مكان واحد — مين دفع، مين لسه، وإيه الإجمالي.",
  },
  {
    icon: ShoppingBag,
    title: "كتالوج تلقائي",
    description:
      "كل منتج بتعمله لينك بيتحفظ تلقائي — مع الوقت بيتكوّن كتالوج كامل.",
  },
  {
    icon: ShieldCheck,
    title: "تحقق من الدفع",
    description:
      "العميل يشوف اسم المستلم على InstaPay قبل ما يحوّل — ثقة من أول لحظة.",
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function FeaturesSection() {
  return (
    <section id="features" className="bg-card px-4 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-2xl font-semibold text-foreground text-balance md:text-[2.5rem] md:leading-tight"
        >
          كل اللي محتاجه في مكان واحد
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="rounded-xl border border-border bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
