"use client"

import { ExternalLink, Smartphone, CircleAlert } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"
import { Card, CardContent } from "@/components/ui/card"

interface StepOneProps {
  sellerName: string
  productName: string
  productImage?: string
  price: string
  instapayLink: string | null
  onProceed: () => void
}

export function StepOne({
  sellerName,
  productName,
  productImage,
  price,
  instapayLink,
  onProceed,
}: StepOneProps) {
  const { t, get } = useTranslations()
  const instructions = (get("checkout.step1.instructions") ?? []) as string[]

  return (
    <div className="flex flex-col gap-5 pb-28">
      {/* Welcome message */}
      <div className="text-center mb-2">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("checkout.step1.welcomeMessage", { seller: sellerName })}
        </p>
      </div>

      {/* Order Details Card with Product Image */}
      <Card className="overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        {productImage && (
          <div className="relative w-full aspect-[16/10] bg-white overflow-hidden">
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <CardContent className="flex items-center justify-between py-5">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-foreground text-lg leading-tight">{productName}</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-[#EDE9FE] text-[#7C3AED] px-4 py-2.5 rounded-xl">
            <span className="text-2xl font-bold">{price}</span>
            <span className="text-sm font-semibold">{t("common.egpShort")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="bg-accent px-5 py-3 border-b border-border">
          <p className="text-sm font-bold text-accent-foreground flex items-center gap-2">
            <Smartphone className="size-4" />
            {t("checkout.step1.paymentMethod")}
          </p>
        </div>
        <CardContent className="py-5">
          <ol className="flex flex-col gap-3 text-sm text-foreground">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center size-6 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-bold shrink-0 mt-0.5">1</span>
              <span>{instructions[0] ?? ""}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center size-6 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-bold shrink-0 mt-0.5">2</span>
              <span>{instructions[1] ?? ""}</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Open InstaPay button */}
      <Card className="border-[#E4D8F0] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <CardContent className="py-5 flex flex-col gap-3 items-center text-center">
          <p className="text-sm text-muted-foreground">{t("checkout.step1.openInstapayHint")}</p>
          {instapayLink ? (
            <a
              href={instapayLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] text-white font-bold text-sm hover:bg-[#6D28D9] transition-colors shadow-lg shadow-[#7C3AED]/25"
            >
              <ExternalLink className="size-4" />
              {t("checkout.step1.openInstapayButton")}
            </a>
          ) : (
            <p className="text-sm text-destructive">{t("checkout.step1.noInstapayLink")}</p>
          )}
        </CardContent>
      </Card>

      {/* CTA — Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border px-4 pt-3 pb-6">
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-2 bg-[#FEF3C7] rounded-lg px-3 py-2 mb-2.5">
            <CircleAlert className="size-4 text-[#D97706] shrink-0" />
            <p className="text-xs text-[#92400E] leading-snug">
              {t("checkout.step1.ensureTransfer")}
            </p>
          </div>
          <button
            type="button"
            onClick={onProceed}
            className="w-full h-12 text-base font-bold rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-lg shadow-[#7C3AED]/25 inline-flex items-center justify-center transition-colors cursor-pointer"
          >
            {t("checkout.step1.paidButton")}
          </button>
        </div>
      </div>
    </div>
  )
}
