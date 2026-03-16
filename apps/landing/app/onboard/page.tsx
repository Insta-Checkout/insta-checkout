import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthRedirect } from "@/components/auth-redirect";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { LocaleAwareToaster } from "@/components/locale-aware-toaster";
import { OnboardPageHeader } from "@/components/onboarding/onboard-page-header";
import { LanguageSwitcher } from "@/components/language-switcher";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Register your business — Insta Checkout | سجّل بيزنسك",
  description:
    "Sign up in 2 minutes and start accepting InstaPay payments via WhatsApp. سجّل في دقيقتين وابدأ تقبل مدفوعات InstaPay من عملاءك.",
};

export default function OnboardPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 overflow-hidden">
      <AuthRedirect />
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <LanguageSwitcher />
      </div>
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative w-full max-w-4xl">
        <OnboardPageHeader />

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
          <Suspense fallback={<div className="h-40" />}>
            <OnboardingForm />
          </Suspense>
        </div>
      </div>
      <LocaleAwareToaster />
    </main>
  );
}
