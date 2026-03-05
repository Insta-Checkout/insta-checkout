"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DemoForm } from "./demo-form";
import { BUSINESS_TYPES, type BusinessType } from "./smart-defaults";

const FIRST_CATEGORY = BUSINESS_TYPES[0].value;

export function DemoSection() {
  const [selectedCategory, setSelectedCategory] = useState<BusinessType>(FIRST_CATEGORY);

  const ctaHref = `/onboard?category=${encodeURIComponent(selectedCategory)}`;

  return (
    <section id="demo" className="bg-white px-4 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-semibold text-[#0F172A] text-balance md:text-[2.5rem] md:leading-tight">
            جرّبها دلوقتي — شوف صفحة الدفع بتاعتك
          </h2>
          <p className="mt-3 text-base text-[#64748B]">
            اختار نوع البيزنس بتاعك وشوف إزاي صفحة الدفع هتبان لعملائك 👇
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-8"
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
            className="inline-flex items-center justify-center h-12 w-full max-w-[400px] rounded-xl bg-[#0D9488] text-base font-bold text-white transition-colors hover:bg-[#0F766E] shadow-lg shadow-[#0D9488]/20"
          >
            عجبني — سجّل وابدأ!
          </a>
          <p className="text-sm text-[#64748B]">
            مجاني بالكامل · جاهز في دقيقتين
          </p>
        </motion.div>
      </div>
    </section>
  );
}
