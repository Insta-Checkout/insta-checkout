"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslations } from "@/lib/locale-provider";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  resetPassword,
} from "@/lib/firebase";

function createSignupSchema(t: (key: string) => string) {
  return z.object({
    fullName: z
      .string()
      .min(2, t("onboard.validation.fullNameMin"))
      .max(100, t("onboard.validation.fullNameMax")),
    businessName: z
      .string()
      .min(2, t("onboard.validation.businessNameMin"))
      .max(100, t("onboard.validation.businessNameMax")),
    phoneNumber: z
      .string()
      .min(1, t("onboard.validation.phoneRequired"))
      .refine(
        (val) => /^01[0-9]{9}$/.test(val) || /^1[0-5][0-9]{8}$/.test(val),
        { message: t("onboard.validation.phoneValid") }
      ),
  });
}

type SignupData = z.infer<ReturnType<typeof createSignupSchema>>;

export function OnboardingForm() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const signupSchema = useMemo(() => createSignupSchema(t), [t]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<"choice" | "signup" | "signin">("choice");
  const [forgetPasswordOpen, setForgetPasswordOpen] = useState(false);
  const [forgetEmail, setForgetEmail] = useState("");
  const [forgetSending, setForgetSending] = useState(false);
  const [forgetSent, setForgetSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", businessName: "", phoneNumber: "" },
  });

  const emailSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("onboard.validation.emailInvalid")),
        password: z.string().min(8, t("onboard.validation.passwordMin")),
      }),
    [t]
  );

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    watch: watchEmail,
    formState: { errors: emailErrors },
  } = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  const email = watchEmail("email");

  const createSellerOnBackend = useCallback(
    async (firebaseUid: string, emailAddr: string, opts: { fullName?: string; businessName?: string; phoneNumber?: string } = {}) => {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const postUrl = `${apiUrl}/sellers`;

      const payload: Record<string, string> = {
        firebaseUid,
        email: emailAddr,
        businessName: opts.businessName || opts.fullName || emailAddr.split("@")[0],
      };
      if (opts.fullName) payload.fullName = opts.fullName;
      if (opts.phoneNumber) payload.phoneNumber = opts.phoneNumber;

      try {
        const res = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const text = await res.text();
        let body: { error?: string; message?: string; details?: Array<{ field: string; message: string }> };
        try {
          body = text ? JSON.parse(text) : {};
        } catch {
          toast.error(t("onboard.errors.serverError"));
          return false;
        }

        if (res.status === 201) {
          const user = auth.currentUser;
          if (user) {
            try {
              const idToken = await user.getIdToken();
              await fetch("/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
              });
            } catch (e) {
              console.warn("[Signup] Failed to set session cookie:", e);
            }
          }
          return true;
        }

        if (res.status === 409) {
          if (body.error === "DUPLICATE_EMAIL") {
            toast.error(t("onboard.errors.duplicateEmail"));
            return false;
          }
          if (body.error === "DUPLICATE_WHATSAPP") {
            toast.error(t("onboard.errors.duplicateNumber"));
          }
          return false;
        }

        if (res.status === 400 && body.details?.length) {
          toast.error(body.details.map((d) => d.message).join("، "));
          return false;
        }

        toast.error(body?.message || t("onboard.errors.generic"));
        return false;
      } catch (err) {
        toast.error(
          err instanceof TypeError && (err as TypeError).message?.includes("fetch")
            ? t("onboard.errors.networkError")
            : t("onboard.errors.generic")
        );
        return false;
      }
    },
    [t]
  );

  // Google signup — standalone, no extra fields required
  const handleGoogleSignUp = async () => {
    setIsSubmitting(true);
    try {
      const user = await signInWithGoogle();
      if (!user.email?.trim()) {
        toast.error(t("onboard.errors.googleNoEmail"));
        return;
      }
      const ok = await createSellerOnBackend(user.uid, user.email, {
        fullName: user.displayName || undefined,
        businessName: user.displayName || undefined,
      });
      if (ok) {
        toast.success(t("onboard.errors.accountCreated"));
        router.replace("/dashboard/home");
      }
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
      setIsSubmitting(false);
    }
  };

  // Email signup — requires full name, phone, business name
  const handleEmailSignUp = async (data: z.infer<typeof emailSchema>) => {
    const fullName = watch("fullName")?.trim();
    const businessName = watch("businessName")?.trim();
    const phoneRaw = watch("phoneNumber")?.trim();
    if (!fullName || !businessName || !phoneRaw) return;

    setIsSubmitting(true);
    try {
      const user = await signUpWithEmail(data.email, data.password);
      const ok = await createSellerOnBackend(user.uid, user.email || data.email, {
        fullName,
        businessName,
        phoneNumber: phoneRaw,
      });
      if (ok) {
        toast.success(t("onboard.errors.accountCreated"));
        router.replace("/dashboard/home");
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        toast.error(t("onboard.errors.emailInUse"));
      } else if (code === "auth/operation-not-allowed") {
        toast.error(t("onboard.errors.emailNotEnabled"));
      } else {
        toast.error(t("onboard.errors.generic"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign in with email — for existing users
  const handleEmailSignIn = async (data: z.infer<typeof emailSchema>) => {
    setIsSubmitting(true);
    try {
      await signInWithEmail(data.email, data.password);
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      }
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
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      }
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
      setIsSubmitting(false);
    }
  };

  const handleForgetPassword = async () => {
    const e = forgetEmail.trim() || email?.trim();
    if (!e) {
      toast.error(t("onboard.errors.enterEmailFirst"));
      return;
    }
    setForgetSending(true);
    try {
      await resetPassword(e);
      setForgetSent(true);
      toast.success(t("onboard.errors.resetEmailSent"));
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/user-not-found") {
        toast.error(t("onboard.errors.userNotFoundReset"));
      } else {
        toast.error(t("onboard.errors.generic"));
      }
    } finally {
      setForgetSending(false);
    }
  };

  const isEmailForm = authMode === "signup" || authMode === "signin";
  const isSignInOnly = authMode === "signin";
  const isSignUp = authMode === "signup";

  return (
    <div className="space-y-6">
      {/* Google signup — standalone, always visible in choice mode */}
      {authMode === "choice" && (
        <div className="space-y-4">
          <Button
            type="button"
            variant="default"
            onClick={handleGoogleSignUp}
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-primary text-base font-semibold gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t("onboard.signup.googleSignUp")}
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">{t("onboard.signup.orEmail")}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAuthMode("signup")}
              className="h-12 rounded-xl text-base gap-2"
            >
              <Mail className="h-4 w-4" />
              {t("onboard.step2.createAccount")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAuthMode("signin")}
              className="h-12 rounded-xl text-base gap-2"
            >
              <KeyRound className="h-4 w-4" />
              {t("onboard.step2.signIn")}
            </Button>
          </div>
        </div>
      )}

      {/* Sign-in mode — Google + email/password */}
      {isSignInOnly && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-1">
            {t("landing.loginPage.title")}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("landing.loginPage.subtitle")}
          </p>

          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl border-2 border-border bg-white text-base font-semibold hover:bg-muted/80 hover:border-primary/30 transition-all gap-2"
            >
              {isSubmitting ? (
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
                <span className="bg-background px-3 text-muted-foreground">{t("onboard.signup.orEmail")}</span>
              </div>
            </div>

            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={(e) => {
                e.preventDefault();
                handleEmailSubmit(handleEmailSignIn)(e);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">{t("onboard.step2.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-12 rounded-lg"
                  dir="ltr"
                  {...registerEmail("email")}
                />
                {emailErrors.email && (
                  <p className="text-sm text-destructive">{emailErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("onboard.step2.password")}</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgetEmail(email || "");
                      setForgetSent(false);
                      setForgetPasswordOpen(true);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    {t("onboard.step2.forgotPassword")}
                  </button>
                </div>
                <PasswordInput
                  id="password"
                  placeholder={t("onboard.step2.placeholders.passwordSignin")}
                  className="h-12 rounded-lg"
                  dir="ltr"
                  {...registerEmail("password")}
                />
                {emailErrors.password && (
                  <p className="text-sm text-destructive">{emailErrors.password.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAuthMode("choice")}
                  disabled={isSubmitting}
                  className="h-12 flex-1 rounded-xl gap-2"
                >
                  {t("onboard.step2.back")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 flex-1 rounded-xl bg-primary font-bold gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("onboard.step2.signInBtn")
                  )}
                </Button>
              </div>
            </motion.form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t("landing.loginPage.noAccount")}{" "}
              <button
                type="button"
                onClick={() => setAuthMode("choice")}
                className="text-primary font-medium hover:underline"
              >
                {t("landing.loginPage.registerLink")}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Sign-up mode — full name, phone, business name, then email/password */}
      {isSignUp && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-1">
              {t("onboard.step2.title")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("onboard.step2.subtitle")}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("onboard.signup.fullName")}</Label>
                <Input
                  id="fullName"
                  placeholder={t("onboard.signup.fullNamePlaceholder")}
                  className="h-12 rounded-lg border-[1.5px] border-input focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">{t("onboard.signup.businessName")}</Label>
                <Input
                  id="businessName"
                  placeholder={t("onboard.step1.placeholders.businessName")}
                  className="h-12 rounded-lg border-[1.5px] border-input focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("businessName")}
                />
                {errors.businessName && (
                  <p className="text-sm text-destructive">{errors.businessName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t("onboard.signup.phoneNumber")}</Label>
                <div className="flex items-center gap-2" dir="ltr">
                  <span className="flex h-12 items-center rounded-lg border-[1.5px] border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
                    +20
                  </span>
                  <Input
                    id="phoneNumber"
                    placeholder={t("onboard.signup.phonePlaceholder")}
                    className="h-12 flex-1 rounded-lg border-[1.5px] border-input focus-visible:ring-2 focus-visible:ring-ring"
                    dir="ltr"
                    {...register("phoneNumber")}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                )}
              </div>

              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(() => {
                    handleEmailSubmit(handleEmailSignUp)(e);
                  })(e);
                }}
                className="space-y-4 pt-2 border-t border-border"
              >
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t("onboard.step2.email")}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-12 rounded-lg"
                    dir="ltr"
                    {...registerEmail("email")}
                  />
                  {emailErrors.email && (
                    <p className="text-sm text-destructive">{emailErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t("onboard.step2.password")}</Label>
                  <PasswordInput
                    id="signup-password"
                    placeholder={t("onboard.step2.placeholders.passwordSignup")}
                    className="h-12 rounded-lg"
                    dir="ltr"
                    {...registerEmail("password")}
                  />
                  {emailErrors.password && (
                    <p className="text-sm text-destructive">{emailErrors.password.message}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAuthMode("choice")}
                    disabled={isSubmitting}
                    className="h-12 flex-1 rounded-xl gap-2"
                  >
                    {t("onboard.step2.back")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 flex-1 rounded-xl bg-primary font-bold gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t("onboard.step2.createAccountBtn")
                    )}
                  </Button>
                </div>
              </motion.form>
            </motion.div>
          </div>
        </div>
      )}

      <Dialog open={forgetPasswordOpen} onOpenChange={setForgetPasswordOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>{t("onboard.step2.forgotTitle")}</DialogTitle>
            <DialogDescription>
              {forgetSent ? t("onboard.step2.forgotSent") : t("onboard.step2.forgotPrompt")}
            </DialogDescription>
          </DialogHeader>
          {!forgetSent && (
            <div className="space-y-2 py-2">
              <Label htmlFor="forget-email">{t("onboard.step2.email")}</Label>
              <Input
                id="forget-email"
                type="email"
                placeholder="you@example.com"
                value={forgetEmail}
                onChange={(e) => setForgetEmail(e.target.value)}
                className="h-12 rounded-lg"
                dir="ltr"
              />
            </div>
          )}
          <DialogFooter>
            {forgetSent ? (
              <Button onClick={() => setForgetPasswordOpen(false)}>{t("onboard.step2.ok")}</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setForgetPasswordOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleForgetPassword} disabled={forgetSending}>
                  {forgetSending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.send")}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
