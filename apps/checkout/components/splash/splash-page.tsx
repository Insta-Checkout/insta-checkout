"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"

const LANDING_APP_URL =
  process.env.NEXT_PUBLIC_LANDING_URL ?? "https://instacheckouteg.com"

export function SplashPage(): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion()

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
          initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="bg-white/10 backdrop-blur-sm text-white/90 text-sm font-semibold px-5 py-2 rounded-full font-[family-name:var(--font-outfit)] tracking-wide">
            Insta Checkout
          </span>
        </motion.div>

        {/* Hero illustration */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-10 w-full max-w-lg"
        >
          <Image
            src="/landing_graphic.jpg"
            alt="Illustration showing how sellers create payment links and buyers pay via InstaPay"
            width={600}
            height={400}
            priority
            className="w-full h-auto rounded-2xl"
          />
        </motion.div>

        {/* Value prop — Arabic primary */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
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
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-xs"
        >
          <a
            href={LANDING_APP_URL}
            className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-center px-6 py-3 rounded-xl transition-colors duration-200 shadow-lg shadow-[#7C3AED]/25 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none font-[family-name:var(--font-cairo)]"
            dir="rtl"
          >
            ابدأ مجاناً
          </a>
          <a
            href={`${LANDING_APP_URL}/#how-it-works`}
            className="flex-1 border border-white/20 text-white hover:bg-white/10 font-medium text-center px-6 py-3 rounded-xl transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none font-[family-name:var(--font-plus-jakarta)]"
          >
            Learn more
          </a>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-14 flex items-center gap-2 text-white/30 text-sm font-[family-name:var(--font-plus-jakarta)]"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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
