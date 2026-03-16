"use client"

import { motion } from "framer-motion"

const LANDING_APP_URL =
  process.env.NEXT_PUBLIC_LANDING_URL ?? "https://instacheckouteg.com"

export function SplashPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-[#2D0A4E] text-white px-6 py-12 overflow-hidden relative">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#7C3AED]/20 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#7C3AED]/15 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo / Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="bg-white/10 backdrop-blur-sm text-white/90 text-sm font-semibold px-5 py-2 rounded-full font-[family-name:var(--font-outfit)] tracking-wide">
            Insta Checkout
          </span>
        </motion.div>

        {/* Hero visual — icon cluster representing the payment flow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-10 flex items-center gap-4"
        >
          {/* Seller icon */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7C3AED]/30 backdrop-blur-sm">
              <svg className="h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <span className="text-xs text-white/40 font-[family-name:var(--font-plus-jakarta)]">Seller</span>
          </div>

          {/* Arrow */}
          <svg className="h-5 w-5 text-white/30 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>

          {/* Link icon */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7C3AED]/50 backdrop-blur-sm ring-2 ring-[#7C3AED]/30">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
            </div>
            <span className="text-xs text-white/40 font-[family-name:var(--font-plus-jakarta)]">Link</span>
          </div>

          {/* Arrow */}
          <svg className="h-5 w-5 text-white/30 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>

          {/* Buyer icon */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7C3AED]/30 backdrop-blur-sm">
              <svg className="h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
            </div>
            <span className="text-xs text-white/40 font-[family-name:var(--font-plus-jakarta)]">Buyer</span>
          </div>
        </motion.div>

        {/* Value prop — Arabic primary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center max-w-md mb-10"
        >
          <h1
            className="text-2xl md:text-3xl font-bold mb-3 font-[family-name:var(--font-cairo)]"
            dir="rtl"
            lang="ar"
          >
            لينك دفع InstaPay في ثانيتين
          </h1>
          <p className="text-white/60 text-base font-[family-name:var(--font-plus-jakarta)]">
            The payment link platform built for Egyptian sellers.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-xs"
        >
          <a
            href={LANDING_APP_URL}
            className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-center px-6 py-3 rounded-xl transition-colors duration-200 shadow-lg shadow-[#7C3AED]/25 font-[family-name:var(--font-cairo)]"
            dir="rtl"
          >
            ابدأ مجاناً
          </a>
          <a
            href={LANDING_APP_URL}
            className="flex-1 border border-white/20 text-white hover:bg-white/10 font-medium text-center px-6 py-3 rounded-xl transition-colors duration-200 font-[family-name:var(--font-plus-jakarta)]"
          >
            Learn more
          </a>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-14 flex items-center gap-2 text-white/30 text-sm font-[family-name:var(--font-plus-jakarta)]"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Powered by secure InstaPay payment</span>
        </motion.div>
      </div>
    </main>
  )
}
