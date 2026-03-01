import { z } from "zod";

export const step1Schema = z.object({
  businessName: z
    .string()
    .min(2, "اسم البيزنس لازم يكون على الأقل حرفين")
    .max(100, "اسم البيزنس لازم يكون أقل من ١٠٠ حرف"),
  category: z.enum(
    ["Food & Desserts", "Clothing", "Services", "Electronics", "Other"],
    { required_error: "اختار تصنيف البيزنس" }
  ),
  instagramLink: z
    .string()
    .url("لينك إنستجرام مش صالح")
    .or(z.literal(""))
    .optional()
    .default(""),
  facebookLink: z
    .string()
    .url("لينك فيسبوك مش صالح")
    .or(z.literal(""))
    .optional()
    .default(""),
});

export const step2Schema = z.object({
  instapayNumber: z
    .string()
    .min(1, "رقم حساب InstaPay مطلوب"),
  maskedFullName: z
    .string()
    .min(1, "الاسم المقنّع مطلوب")
    .refine((val) => val.includes("*"), {
      message: "الاسم المقنّع لازم يحتوي على * واحدة على الأقل",
    }),
});

export const step3Schema = z.object({
  whatsappNumber: z
    .string()
    .regex(/^01[0-9]{9}$/, "رقم واتساب لازم يكون ١١ رقم ويبدأ بـ 01"),
});

export const fullFormSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type FullFormData = z.infer<typeof fullFormSchema>;

export const categoryOptions = [
  { value: "Food & Desserts", label: "أكل وحلويات" },
  { value: "Clothing", label: "ملابس" },
  { value: "Services", label: "خدمات" },
  { value: "Electronics", label: "إلكترونيات" },
  { value: "Other", label: "أخرى" },
] as const;
