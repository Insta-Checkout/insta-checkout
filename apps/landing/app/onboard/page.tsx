import type { Metadata } from "next";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "سجّل بيزنسك — InstaPay Checkout",
  description:
    "سجّل في دقيقتين وابدأ تقبل مدفوعات InstaPay من عملاءك عن طريق واتساب.",
};

export default function OnboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-[480px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M7 12h10M12 7v10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            سجّل بيزنسك على InstaPay Checkout
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            في ٤ خطوات بسيطة هتبدأ تقبض أونلاين
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] sm:p-8">
          <OnboardingForm />
        </div>
      </div>
      <Toaster position="top-center" dir="rtl" />
    </main>
  );
}
