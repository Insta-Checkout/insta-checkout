"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { DemoForm } from "./demo-form";
import { BUSINESS_TYPES, type BusinessType } from "./smart-defaults";
import { useTranslations } from "@/lib/locale-provider";

const FIRST_CATEGORY = BUSINESS_TYPES[0].value;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

export function DemoSection() {
  const { t } = useTranslations();
  const [selectedCategory, setSelectedCategory] = useState<BusinessType>(FIRST_CATEGORY);
  const searchParams = useSearchParams();

  const ctaHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("category", selectedCategory);
    UTM_KEYS.forEach((key) => {
      const val = searchParams.get(key);
      if (val) params.set(key, val);
    });
    return `/onboard?${params.toString()}`;
  }, [selectedCategory, searchParams]);

  return (
    <section id="demo" className="bg-[#F3EEFA] px-4 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-[#7C3AED]">
            {t("landing.nav.howItWorks")}
          </p>
          <h2 className="text-2xl font-black text-[#1E0A3C] text-balance md:text-4xl">
            {t("landing.demo.title")}
          </h2>
          <p className="mt-3 text-base text-[#64748B]">
            {t("landing.demo.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-[#E4D8F0] bg-white p-6 shadow-[0_4px_24px_rgba(45,10,78,0.08)] sm:p-8"
        >
          <DemoForm onCategoryChange={setSelectedCategory} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <a
            href={ctaHref}
            className="inline-flex items-center justify-center h-12 w-full max-w-[400px] rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EA580C] text-base font-bold text-white transition-all hover:from-[#6D28D9] hover:to-[#C2410C] shadow-lg shadow-[#7C3AED]/20 cursor-pointer"
          >
            {t("landing.demo.cta")}
          </a>
          <p className="text-sm text-[#64748B]">
            {t("landing.demo.noCard")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
