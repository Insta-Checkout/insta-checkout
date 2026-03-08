"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Cake, Shirt, Smartphone, Scissors, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckoutPreview } from "@/components/onboarding/checkout-preview"
import { getDefaults, BUSINESS_TYPES, type BusinessType } from "@/components/demo/smart-defaults"
import { useTranslations } from "@/lib/locale-provider"

const ICON_MAP = {
  "Food & Desserts": Cake,
  Clothing: Shirt,
  Electronics: Smartphone,
  Services: Scissors,
  Other: Package,
} as const

const FIRST_CATEGORY = BUSINESS_TYPES[0].value

interface RedesignDemoFormProps {
  onCategoryChange?: (category: BusinessType) => void
}

export function RedesignDemoForm({ onCategoryChange }: RedesignDemoFormProps) {
  const { t } = useTranslations()
  const [selectedType, setSelectedType] = useState<BusinessType>(FIRST_CATEGORY)
  const defaults = getDefaults(FIRST_CATEGORY)
  const [productName, setProductName] = useState(defaults.defaultProduct)
  const [price, setPrice] = useState<number | "">(defaults.defaultPrice)

  useEffect(() => {
    onCategoryChange?.(FIRST_CATEGORY)
  }, [onCategoryChange])

  const handleTypeSelect = useCallback(
    (type: BusinessType) => {
      setSelectedType(type)
      const d = getDefaults(type)
      setProductName(d.defaultProduct)
      setPrice(d.defaultPrice)
      onCategoryChange?.(type)
    },
    [onCategoryChange]
  )

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[var(--r-text)]">
            {t("landing.demo.businessType")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {BUSINESS_TYPES.map((type) => {
              const Icon = ICON_MAP[type.value]
              const isSelected = selectedType === type.value
              return (
                <motion.button
                  key={type.value}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTypeSelect(type.value)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px] cursor-pointer ${
                    isSelected
                      ? "bg-[var(--r-cta)] text-white shadow-lg shadow-[var(--r-cta)]/30"
                      : "border border-[var(--r-glass-border)] bg-[var(--r-glass)]/50 text-[var(--r-text)] hover:border-[var(--r-cta)]/40 hover:bg-[var(--r-cta)]/10"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{type.label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="redesign-demo-product"
            className="text-sm font-medium text-[var(--r-text)]"
          >
            {t("landing.demo.productName")}
          </Label>
          <Input
            id="redesign-demo-product"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder={t("landing.demo.productPlaceholder")}
            maxLength={100}
            className="h-12 rounded-xl border border-[var(--r-glass-border)] bg-[var(--r-glass)]/50 text-[var(--r-text)] placeholder:text-[var(--r-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--r-cta)]/50 focus-visible:border-[var(--r-cta)]"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="redesign-demo-price"
            className="text-sm font-medium text-[var(--r-text)]"
          >
            {t("landing.demo.price")}
          </Label>
          <div className="relative">
            <Input
              id="redesign-demo-price"
              type="number"
              min={1}
              value={price}
              onChange={(e) =>
                setPrice(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="---"
              dir="ltr"
              className="h-12 rounded-xl border border-[var(--r-glass-border)] bg-[var(--r-glass)]/50 ps-14 text-[var(--r-text)] placeholder:text-[var(--r-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--r-cta)]/50 focus-visible:border-[var(--r-cta)]"
            />
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--r-text-muted)] pointer-events-none">
              {t("common.egp")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CheckoutPreview
            businessName={t("landing.demo.previewBusinessName")}
            productName={productName || t("landing.demo.previewProductDefault")}
            price={typeof price === "number" ? price : 0}
            businessType={selectedType}
            inPhoneFrame
            disabled
          />
        </motion.div>
      </div>
    </div>
  )
}
