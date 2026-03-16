"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "@/lib/locale-provider";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import { LocaleAwareToaster } from "@/components/locale-aware-toaster";
import { LanguageSwitcher } from "@/components/language-switcher";
import { auth, signInWithGoogle, signInWithEmail } from "@/lib/firebase";

function createEmailSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t("onboard.validation.emailInvalid")),
    password: z.string().min(1, t("landing.loginPage.passwordRequired")),
  });
}

type EmailFormData = z.infer<ReturnType<typeof createEmailSchema>>;

async function setSessionCookie() {
  const user = auth.currentUser;
  if (!user) return;
  const idToken = await user.getIdToken();
  await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

export default function LoginPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const schema = useMemo(() => createEmailSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await setSessionCookie();
        } catch (e) {
          console.warn("[Session] Failed to set cookie:", e);
        }
        router.replace("/dashboard/home");
      }
    });
    return () => unsub();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      await setSessionCookie();
      toast.success(t("onboard.errors.signInSuccess"));
      router.replace("/dashboard/home");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const message =
        code === "auth/popup-closed-by-user"
          ? t("onboard.errors.signInCancelled")
          : code === "auth/operation-not-allowed"
            ? t("onboard.errors.googleNotEnabled")
            : code === "auth/unauthorized-domain"
              ? t("onboard.errors.unauthorizedDomain")
              : t("onboard.errors.generic");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      await setSessionCookie();
      toast.success(t("onboard.errors.signInSuccess"));
      router.replace("/dashboard/home");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        toast.error(t("onboard.errors.invalidCredentials"));
      } else if (code === "auth/user-not-found") {
        toast.error(t("onboard.errors.userNotFound"));
      } else {
        toast.error(t("onboard.errors.generic"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 overflow-hidden">
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <LanguageSwitcher />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Insta Checkout</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t("landing.loginPage.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("landing.loginPage.subtitle")}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5">
          {!showEmailForm ? (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="h-12 w-full rounded-xl border-2 border-border bg-white text-base font-semibold hover:bg-muted/80 hover:border-primary/30 transition-all gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {t("landing.loginPage.googleSignIn")}
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">{t("landing.loginPage.or")}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmailForm(true)}
                className="h-12 w-full rounded-xl text-base"
              >
                {t("landing.loginPage.signInWithEmail")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleEmailSignIn)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("onboard.step3.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-12 rounded-lg"
                  dir="ltr"
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("onboard.step3.password")}</Label>
                <PasswordInput
                  id="password"
                  placeholder={t("onboard.step3.placeholders.passwordSignin")}
                  className="h-12 rounded-lg"
                  dir="ltr"
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEmailForm(false)}
                  disabled={isLoading}
                  className="h-12 flex-1 rounded-xl"
                >
                  {t("common.back")}
                </Button>
                <Button type="submit" disabled={isLoading} className="h-12 flex-1 rounded-xl bg-primary font-bold">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("onboard.step3.signInBtn")}
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("landing.loginPage.noAccount")}{" "}
            <Link href="/onboard" className="text-primary font-medium hover:underline">
              {t("landing.loginPage.registerLink")}
            </Link>
          </p>
        </div>
      </div>
      <LocaleAwareToaster />
    </main>
  );
}
