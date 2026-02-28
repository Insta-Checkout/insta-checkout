"use client"

import { motion } from "framer-motion"
import { MessageCircle, Smartphone } from "lucide-react"

function PhoneMockup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto w-[260px] rounded-[2rem] border-[3px] border-foreground/10 bg-card p-2 shadow-xl ${className}`}>
      <div className="absolute top-0 left-1/2 h-6 w-24 -translate-x-1/2 rounded-b-xl bg-foreground/10" />
      <div className="overflow-hidden rounded-[1.5rem] bg-secondary">
        {children}
      </div>
    </div>
  )
}

function WhatsAppChat() {
  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
          <MessageCircle className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">InstaPay Bot</p>
          <p className="text-[10px] text-muted-foreground">متصل</p>
        </div>
      </div>
      {/* Seller message */}
      <div className="self-end rounded-xl rounded-tl-sm bg-primary/10 px-3 py-2">
        <p className="text-xs text-foreground">شوكولاتة كيك ٣٠٠</p>
      </div>
      {/* Bot reply */}
      <div className="self-start rounded-xl rounded-tr-sm bg-card px-3 py-2 shadow-sm">
        <p className="text-xs text-foreground">تم إنشاء لينك الدفع:</p>
        <p className="mt-1 text-[10px] font-mono text-primary break-all">
          pay.instapay.co/choc-cake
        </p>
      </div>
      {/* Seller sends */}
      <div className="self-end rounded-xl rounded-tl-sm bg-primary/10 px-3 py-2">
        <p className="text-xs text-muted-foreground">ابعته للعميل</p>
      </div>
    </div>
  )
}

function CheckoutPreview() {
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
        <Smartphone className="h-5 w-5 text-primary-foreground" />
      </div>
      <p className="text-xs font-bold text-foreground">Sweet Treats</p>
      <div className="w-full rounded-lg bg-card p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">شوكولاتة كيك</span>
          <span className="font-mono text-sm font-bold text-foreground">٣٠٠ ج.م</span>
        </div>
      </div>
      <button className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground">
        ادفع بـ InstaPay
      </button>
      <p className="text-[10px] text-muted-foreground">مأمّن ومشفّر بالكامل</p>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background px-4 pt-12 pb-16 lg:px-8 lg:pt-20 lg:pb-24">
      <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-12 lg:flex-row lg:gap-16">
        {/* Visual / Phones */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative flex items-end justify-center gap-4 lg:w-1/2"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <PhoneMockup>
              <WhatsAppChat />
            </PhoneMockup>
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
            className="-mb-4"
          >
            <PhoneMockup className="w-[220px] scale-90">
              <CheckoutPreview />
            </PhoneMockup>
          </motion.div>
          {/* Teal glow */}
          <div className="pointer-events-none absolute -bottom-8 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-start"
        >
          <h1 className="text-4xl font-bold leading-tight text-foreground text-balance lg:text-[3.5rem] lg:leading-[1.15]">
            حوّل كل محادثة لعملية بيع — في ثواني
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground lg:text-lg">
            أنشئ لينك دفع InstaPay في ثانيتين وابعته لعميلك على واتساب.
            بدون موقع، بدون تطبيق، بدون تعقيد.
          </p>
          <a
            href="#cta"
            className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto"
          >
            ابدأ مجاناً
          </a>
          <p className="mt-4 text-sm text-muted-foreground">
            مجاني بالكامل · بدون بطاقة ائتمان · جاهز في دقيقتين
          </p>
        </motion.div>
      </div>
    </section>
  )
}
