"use client"

import { useState } from "react"
import { Copy, Check, ShieldCheck, Smartphone, ArrowLeftRight, Hash, CircleAlert } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface StepOneProps {
  productName: string
  productImage?: string
  price: string
  instaPayAccount: string
  maskedName: string
  onProceed: () => void
}

export function StepOne({
  productName,
  productImage,
  price,
  instaPayAccount,
  maskedName,
  onProceed,
}: StepOneProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(instaPayAccount)
      setCopied(true)
      toast.success("تم نسخ رقم الحساب")
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error("فشل النسخ. يرجى النسخ يدويًا.")
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-28">
      {/* Order Details Card with Product Image */}
      <Card className="overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        {productImage && (
          <div className="relative w-full aspect-[16/10] bg-muted overflow-hidden">
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="flex items-center justify-between py-5">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-foreground text-lg leading-tight">{productName}</h3>
            <p className="text-sm text-muted-foreground">طلب دفع</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0D9488]/10 text-[#0D9488] px-4 py-2.5 rounded-xl">
            <span className="text-2xl font-bold">{price}</span>
            <span className="text-sm font-semibold">ج.م</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="bg-accent px-5 py-3 border-b border-border">
          <p className="text-sm font-bold text-accent-foreground flex items-center gap-2">
            <Smartphone className="size-4" />
            طريقة الدفع عبر انستاباي
          </p>
        </div>
        <CardContent className="py-5">
          <ol className="flex flex-col gap-3 text-sm text-foreground">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center size-6 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-xs font-bold shrink-0 mt-0.5">1</span>
              <span>افتح تطبيق البنك أو المحفظة التي تدعم انستاباي</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center size-6 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-xs font-bold shrink-0 mt-0.5">2</span>
              <span>ابدأ تحويل جديد</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center size-6 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-xs font-bold shrink-0 mt-0.5">
                <ArrowLeftRight className="size-3" />
              </span>
              <span>أدخل رقم الحساب أدناه</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* InstaPay Account Number — Copy Box */}
      <Card className="border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <CardContent className="py-5">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Hash className="size-4" />
              رقم حساب انستاباي
            </label>
            <div className="flex items-center gap-3 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-xl p-4">
              <span
                className="flex-1 text-xl font-mono font-medium tracking-[1px] text-foreground text-left"
                dir="ltr"
              >
                {instaPayAccount}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className={`shrink-0 gap-2 transition-all ${
                  copied
                    ? "bg-success text-success-foreground border-success hover:bg-success/90"
                    : "border-[#0D9488]/30 text-[#0D9488] hover:bg-[#0D9488]/5"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="size-4" />
                    <span>تم</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    <span>نسخ</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Hint — Trust Badge */}
      <div className="bg-[#ECFDF5] border-s-[3px] border-[#10B981] rounded-lg p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[#0D9488]">
            <ShieldCheck className="size-5" />
            <p className="text-sm font-bold">كيف تتأكد أنك ترسل للشخص الصحيح؟</p>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            بعد إدخال رقم الحساب، سيعرض لك انستاباي اسمًا مُقنّعًا للمستلم قبل تأكيد التحويل. يجب أن ترى:
          </p>
          <div className="bg-card rounded-xl p-4 border border-[#10B981]/20 text-center shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <span className="text-lg font-bold font-mono tracking-wider text-[#0D9488]" dir="ltr">
              {maskedName}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            إذا تطابق الاسم، فأنت ترسل إلى الحساب الصحيح. تابع وأكّد التحويل!
          </p>
        </div>
      </div>

      {/* CTA — Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border px-4 pt-3 pb-6">
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-2 bg-[#FEF3C7] rounded-lg px-3 py-2 mb-2.5">
            <CircleAlert className="size-4 text-[#D97706] shrink-0" />
            <p className="text-xs text-[#92400E] leading-snug">
              تأكد من ظهور رسالة <span className="font-bold">"تم التحويل بنجاح"</span> في تطبيقك قبل المتابعة
            </p>
          </div>
          <button
            type="button"
            onClick={onProceed}
            className="w-full h-12 text-base font-bold rounded-xl bg-[#0D9488] text-card hover:bg-[#0F766E] shadow-lg inline-flex items-center justify-center transition-colors cursor-pointer"
          >
            لقد قمت بالدفع
          </button>
        </div>
      </div>
    </div>
  )
}
