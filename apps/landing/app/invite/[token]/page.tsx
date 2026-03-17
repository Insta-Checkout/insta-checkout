"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, CheckCircle2, XCircle, Users } from "lucide-react"
import { toast } from "sonner"

import { auth } from "@/lib/firebase"
import { fetchWithAuth, getBackendUrl } from "@/lib/api"
import { useTranslations } from "@/lib/locale-provider"
import { useAuth } from "@/lib/auth/AuthProvider"
import { Button } from "@/components/ui/button"

type InviteInfo = {
  email: string
  roleLabel: string
  permissions: string[]
  businessName: string
  expiresAt: string
}

type PageState = "loading" | "ready" | "accepting" | "success" | "error" | "needsAuth"

export default function AcceptInvitePage(): React.JSX.Element {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslations()
  const { user, loading: authLoading } = useAuth()

  const token = params.token as string

  const [state, setState] = useState<PageState>("loading")
  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [acceptedBusiness, setAcceptedBusiness] = useState("")

  // Fetch invite info (public)
  useEffect(() => {
    async function loadInvite(): Promise<void> {
      try {
        const res = await fetch(`${getBackendUrl()}/invitations/${token}`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          setErrorMessage(err.message || t("dashboard.team.invite.invalidOrExpired"))
          setState("error")
          return
        }
        const data = await res.json()
        setInvite(data)
        setState("ready")
      } catch {
        setErrorMessage(t("dashboard.team.invite.loadFailed"))
        setState("error")
      }
    }
    loadInvite()
  }, [token, t])

  // Once auth loads, check if user needs to sign in
  useEffect(() => {
    if (state === "ready" && !authLoading && !user) {
      setState("needsAuth")
    }
  }, [state, authLoading, user])

  const getToken = (): Promise<string | null> =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null)

  const handleAccept = async (): Promise<void> => {
    if (!user) {
      setState("needsAuth")
      return
    }

    setState("accepting")
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/invitations/${token}/accept`,
        { method: "POST" },
        getToken
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (err.error === "ALREADY_MEMBER") {
          toast.info(t("dashboard.team.invite.alreadyMember"))
          router.push("/dashboard/home")
          return
        }
        toast.error(err.message || t("dashboard.team.invite.acceptFailed"))
        setState("ready")
        return
      }

      const data = await res.json()
      setAcceptedBusiness(data.businessName)
      setState("success")
    } catch {
      toast.error(t("dashboard.team.invite.acceptFailed"))
      setState("ready")
    }
  }

  const handleGoToSignIn = (): void => {
    // Store the current URL so we can redirect back after login
    if (typeof window !== "undefined") {
      sessionStorage.setItem("inviteRedirect", window.location.pathname)
    }
    router.push(`/?login=true`)
  }

  const handleGoToDashboard = (): void => {
    router.push("/dashboard/home")
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E4D8F0] p-8 shadow-sm">
        {/* Loading */}
        {state === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
            <p className="text-sm text-[#6B5B7B] font-cairo">{t("common.loading")}</p>
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-[#1E0A3C] font-cairo">
              {t("dashboard.team.invite.invalidTitle")}
            </h2>
            <p className="text-sm text-[#6B5B7B] font-cairo">{errorMessage}</p>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="mt-2 font-cairo border-[#E4D8F0]"
            >
              {t("common.back")}
            </Button>
          </div>
        )}

        {/* Ready / Needs Auth */}
        {(state === "ready" || state === "needsAuth" || state === "accepting") && invite && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#EDE9FE] flex items-center justify-center">
              <Users className="h-7 w-7 text-[#7C3AED]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-[#1E0A3C] font-cairo">
                {t("dashboard.team.invite.title")}
              </h2>
              <p className="text-sm text-[#6B5B7B] font-cairo">
                {t("dashboard.team.invite.subtitle")}
              </p>
            </div>

            <div className="w-full bg-[#F3EEFA] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B5B7B] font-cairo">{t("dashboard.team.invite.business")}</span>
                <span className="font-medium text-[#1E0A3C] font-cairo">{invite.businessName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B5B7B] font-cairo">{t("dashboard.team.role")}</span>
                <span className="inline-flex items-center rounded-full bg-[#EDE9FE] px-2.5 py-0.5 text-xs font-medium text-[#7C3AED] font-cairo">
                  {invite.roleLabel}
                </span>
              </div>
            </div>

            {state === "needsAuth" ? (
              <div className="w-full space-y-3">
                <p className="text-sm text-[#6B5B7B] font-cairo">
                  {t("dashboard.team.invite.signInRequired")}
                </p>
                <Button
                  onClick={handleGoToSignIn}
                  className="w-full font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
                >
                  {t("dashboard.team.invite.signIn")}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleAccept}
                disabled={state === "accepting"}
                className="w-full gap-2 font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
              >
                {state === "accepting" && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("dashboard.team.invite.joinTeam")}
              </Button>
            )}
          </div>
        )}

        {/* Success */}
        {state === "success" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-[#1E0A3C] font-cairo">
                {t("dashboard.team.invite.successTitle")}
              </h2>
              <p className="text-sm text-[#6B5B7B] font-cairo">
                {t("dashboard.team.invite.successSubtitle")} <strong>{acceptedBusiness}</strong>
              </p>
            </div>
            <Button
              onClick={handleGoToDashboard}
              className="w-full font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
            >
              {t("dashboard.team.invite.goToDashboard")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
