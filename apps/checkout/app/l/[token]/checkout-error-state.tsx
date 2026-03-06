"use client"

import { AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/lib/locale-provider"

type ErrorKey = "expired" | "cancelled" | "alreadyPaid" | "comingSoon" | "notFound"

interface CheckoutErrorStateProps {
  errorKey: ErrorKey
}

export function CheckoutErrorState({ errorKey }: CheckoutErrorStateProps) {
  const { t } = useTranslations()
  const isAlreadyPaid = errorKey === "alreadyPaid"

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            isAlreadyPaid ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}
        >
          {isAlreadyPaid ? (
            <CheckCircle2 className="h-8 w-8" />
          ) : (
            <AlertCircle className="h-8 w-8" />
          )}
        </div>
        <h1 className="text-xl font-bold text-foreground">
          {t(`checkout.errors.${errorKey}`)}
        </h1>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("checkout.errors.goBack")}
        </Link>
      </div>
    </div>
  )
}
