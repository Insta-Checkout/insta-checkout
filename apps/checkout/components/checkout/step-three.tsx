"use client"

import { CheckCircle2, Clock, MessageCircle } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface StepThreeProps {
  productName: string
  price: string
  sellerName: string
  whatsappLink?: string
}

export function StepThree({
  productName,
  price,
  sellerName,
  whatsappLink,
}: StepThreeProps) {
  const { t } = useTranslations()
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Success Icon */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex items-center justify-center size-20 rounded-full bg-[#ECFDF5] text-[#10B981] animate-in zoom-in duration-500">
          <CheckCircle2 className="size-10" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-bold text-foreground">
            {t("checkout.step3.successTitle")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            {t("checkout.step3.successSubtitle", { sellerName })}
          </p>
        </div>
      </div>

      {/* Order Recap */}
      <Card className="w-full shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="bg-accent px-5 py-3 border-b border-border">
          <p className="text-sm font-bold text-accent-foreground">{t("checkout.step3.orderSummary")}</p>
        </div>
        <CardContent className="py-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("checkout.step3.product")}</span>
              <span className="text-sm font-bold text-foreground">{productName}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("checkout.step3.amount")}</span>
              <span className="text-sm font-bold text-foreground">{price} ج.م</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("checkout.step3.seller")}</span>
              <span className="text-sm font-bold text-foreground">{sellerName}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="w-full border-[#F59E0B]/30 bg-[#FFFBEB] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-[#FEF3C7] text-[#F59E0B] shrink-0">
              <Clock className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-bold text-[#78350F]">{t("checkout.step3.statusTitle")}</p>
              <p className="text-xs text-[#92400E]">
                {t("checkout.step3.statusSubtitle")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Contact */}
      {whatsappLink && (
        <Button
          variant="outline"
          asChild
          className="w-full h-12 gap-2 rounded-xl border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#EDE9FE]"
        >
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-5" />
            {t("checkout.step3.contactSeller")}
          </a>
        </Button>
      )}
    </div>
  )
}
