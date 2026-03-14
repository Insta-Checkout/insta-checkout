"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useTranslations } from "@/lib/locale-provider";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeftToLine, Mail, Lock, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  resetPassword,
} from "@/lib/firebase";

function createEmailAuthSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t("onboard.validation.emailInvalid")),
    password: z.string().min(8, t("onboard.validation.passwordMin")),
  });
}

type AuthData = z.infer<ReturnType<typeof createEmailAuthSchema>>;

interface StepTwoProps {
  onBack: () => void;
  onSubmit: (firebaseUid: string, email: string) => void | Promise<void>;
}

export function StepTwo({ onBack, onSubmit }: StepTwoProps) {
  const { t } = useTranslations()
  const emailAuthSchema = useMemo(() => createEmailAuthSchema(t), [t])
  const [authMode, setAuthMode] = useState<"choice" | "signup" | "signin">("choice");
  const [isLoading, setIsLoading] = useState(false);
  const [forgetPasswordOpen, setForgetPasswordOpen] = useState(false);
  const [forgetEmail, setForgetEmail] = useState("");
  const [forgetSending, setForgetSending] = useState(false);
  const [forgetSent, setForgetSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AuthData>({
    resolver: zodResolver(emailAuthSchema),
    defaultValues: { email: "", password: "" },
  });

  const email = watch("email");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (!user.email?.trim()) {
        toast.error(t("onboard.errors.googleNoEmail"));
        return;
      }
      toast.success(t("onboard.errors.accountCreated"));
      await onSubmit(user.uid, user.email);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      console.error("[Firebase Google sign-in]", code, err);
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


  const handleEmailSignUp = async (data: AuthData) => {
    setIsLoading(true);
    try {
      const user = await signUpWithEmail(data.email, data.password);
      toast.success(t("onboard.errors.accountCreated"));
      await onSubmit(user.uid, user.email || data.email);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        toast.info(t("onboard.errors.emailInUseSignIn"));
        try {
          const user = await signInWithEmail(data.email, data.password);
          toast.success(t("onboard.errors.signInSuccess"));
          await onSubmit(user.uid, user.email || data.email);
        } catch (signInErr: unknown) {
          const signInCode = (signInErr as { code?: string })?.code;
          if (signInCode === "auth/invalid-credential" || signInCode === "auth/wrong-password") {
            toast.error(t("onboard.errors.invalidCredentials"));
          } else {
            throw signInErr;
          }
        }
      } else if (code === "auth/operation-not-allowed") {
        toast.error(t("onboard.errors.emailNotEnabled"));
      } else {
        console.error("[Firebase email sign-up]", code, err);
        toast.error(t("onboard.errors.generic"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (data: AuthData) => {
    setIsLoading(true);
    try {
      const user = await signInWithEmail(data.email, data.password);
      toast.success(t("onboard.errors.signInSuccess"));
      await onSubmit(user.uid, user.email || data.email);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      console.error("[Firebase email sign-in]", code, err);
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-1">{t("onboard.step2.title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("onboard.step2.subtitle")}
          </p>
        </div>

        {authMode === "choice" && (
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
                  {t("onboard.step2.googleSignIn")}
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">{t("onboard.step2.or")}</span>
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

        {isEmailForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleSubmit(authMode === "signup" ? handleEmailSignUp : handleEmailSignIn)}
            className="rounded-xl border border-border bg-card p-6 space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">{t("onboard.step2.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-12 rounded-lg"
                dir="ltr"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
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
                placeholder={authMode === "signup" ? t("onboard.step2.placeholders.passwordSignup") : t("onboard.step2.placeholders.passwordSignin")}
                className="h-12 rounded-lg"
                dir="ltr"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isLoading}
                className="h-12 flex-1 rounded-xl gap-2"
              >
                <ArrowLeftToLine className="h-4 w-4" />
                {t("onboard.step2.back")}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 flex-1 rounded-xl bg-primary font-bold gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : authMode === "signup" ? (
                  t("onboard.step2.createAccountBtn")
                ) : (
                  t("onboard.step2.signInBtn")
                )}
              </Button>
            </div>
          </motion.form>
        )}

        {authMode === "choice" && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full gap-2 text-muted-foreground"
          >
            <ArrowLeftToLine className="h-4 w-4" />
            {t("onboard.step2.backToPrevious")}
          </Button>
        )}
      </motion.div>

      {/* Forget Password Dialog */}
      <Dialog open={forgetPasswordOpen} onOpenChange={setForgetPasswordOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t("onboard.step2.forgotTitle")}
            </DialogTitle>
            <DialogDescription>
              {forgetSent
                ? t("onboard.step2.forgotSent")
                : t("onboard.step2.forgotPrompt")}
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
    </>
  );
}
