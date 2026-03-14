import { z } from "zod";

export type BusinessTypeValue = "Food & Desserts" | "Clothing" | "Electronics" | "Services" | "Other";

const BUSINESS_TYPE_VALUES: BusinessTypeValue[] = [
  "Food & Desserts",
  "Clothing",
  "Electronics",
  "Services",
  "Other",
];

const BUSINESS_TYPE_KEYS: Record<BusinessTypeValue, string> = {
  "Food & Desserts": "food",
  Clothing: "clothing",
  Electronics: "electronics",
  Services: "services",
  Other: "other",
};

const EMOJIS: Record<BusinessTypeValue, string> = {
  "Food & Desserts": "🍰",
  Clothing: "👗",
  Electronics: "📱",
  Services: "✂️",
  Other: "🛍️",
};

const ICONS: Record<BusinessTypeValue, string> = {
  "Food & Desserts": "Cake",
  Clothing: "Shirt",
  Electronics: "Smartphone",
  Services: "Scissors",
  Other: "Package",
};

export interface BusinessTypeOption {
  value: BusinessTypeValue;
  label: string;
  emoji: string;
  icon: string;
  defaultProduct: string;
  defaultPrice: number;
  defaultBusinessName: string;
  categoryTag: string;
}

export function getBusinessTypeOptions(
  t: (key: string) => string,
  get: <T>(key: string) => T | undefined
): BusinessTypeOption[] {
  return BUSINESS_TYPE_VALUES.map((value) => {
    const key = BUSINESS_TYPE_KEYS[value];
    const defaults = get(`businessTypes.defaults.${key}`) as { product: string; business: string; category: string } | undefined;
    return {
      value,
      label: t(`businessTypes.${key}`),
      emoji: EMOJIS[value],
      icon: ICONS[value],
      defaultProduct: defaults?.product ?? "",
      defaultPrice: value === "Clothing" ? 450 : value === "Services" ? 500 : value === "Other" ? 200 : value === "Electronics" ? 150 : 300,
      defaultBusinessName: defaults?.business ?? "",
      categoryTag: defaults?.category ?? "",
    };
  });
}

/** Step 1: Business info (business name, WhatsApp) */
export function createStep1Schema(t: (key: string) => string) {
  return z.object({
    businessName: z
      .string()
      .min(2, t("onboard.validation.businessNameMin"))
      .max(100, t("onboard.validation.businessNameMax")),
    whatsappNumber: z
      .string()
      .refine(
        (val) => /^01[0-9]{9}$/.test(val) || /^1[0-5][0-9]{8}$/.test(val),
        { message: t("onboard.validation.whatsappValid") }
      ),
  });
}

/** Step 2: Account registration — handled by Firebase */
export const step2Schema = z.object({});

export type Step1Data = z.infer<ReturnType<typeof createStep1Schema>>;
export type Step2Data = z.infer<typeof step2Schema>;

export type FullFormData = Step1Data;
