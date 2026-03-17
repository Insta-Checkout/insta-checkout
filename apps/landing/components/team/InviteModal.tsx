"use client"

import { useState } from "react"
import { Loader2, UserPlus, Copy, Mail } from "lucide-react"
import { toast } from "sonner"

import { auth } from "@/lib/firebase"
import { fetchWithAuth, getBackendUrl } from "@/lib/api"
import { useTranslations } from "@/lib/locale-provider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvited?: () => void
}

type Step = "form" | "success"

type RolePreset = "link_manager" | "full_access" | "custom"

type PermissionKey =
  | "payment_links.create"
  | "payment_links.edit"
  | "payment_links.delete"
  | "payment_links.approve"
  | "analytics.view"

type PermissionSection = {
  labelKey: string
  permissions: { key: PermissionKey; labelKey: string }[]
}

const PERMISSION_SECTIONS: PermissionSection[] = [
  {
    labelKey: "dashboard.team.permissionsSection.paymentLinks",
    permissions: [
      { key: "payment_links.create", labelKey: "dashboard.team.permissions.paymentLinksCreate" },
      { key: "payment_links.edit", labelKey: "dashboard.team.permissions.paymentLinksEdit" },
      { key: "payment_links.delete", labelKey: "dashboard.team.permissions.paymentLinksDelete" },
      { key: "payment_links.approve", labelKey: "dashboard.team.permissions.paymentLinksApprove" },
    ],
  },
  {
    labelKey: "dashboard.team.permissionsSection.analytics",
    permissions: [
      { key: "analytics.view", labelKey: "dashboard.team.permissions.analyticsView" },
    ],
  },
]

const ROLE_OPTIONS: { value: RolePreset; labelKey: string; descKey: string }[] = [
  { value: "link_manager", labelKey: "dashboard.team.linkManager", descKey: "dashboard.team.linkManagerDesc" },
  { value: "full_access", labelKey: "dashboard.team.fullAccess", descKey: "dashboard.team.fullAccessDesc" },
  { value: "custom", labelKey: "dashboard.team.custom", descKey: "dashboard.team.customDesc" },
]

export function InviteModal({ open, onOpenChange, onInvited }: Props): React.JSX.Element {
  const { t } = useTranslations()
  const [step, setStep] = useState<Step>("form")
  const [email, setEmail] = useState("")
  const [rolePreset, setRolePreset] = useState<RolePreset>("link_manager")
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>({
    "payment_links.create": false,
    "payment_links.edit": false,
    "payment_links.delete": false,
    "payment_links.approve": false,
    "analytics.view": false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [inviteLink, setInviteLink] = useState("")

  const getToken = (): Promise<string | null> =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null)

  const resetForm = (): void => {
    setStep("form")
    setEmail("")
    setRolePreset("link_manager")
    setPermissions({
      "payment_links.create": false,
      "payment_links.edit": false,
      "payment_links.delete": false,
      "payment_links.approve": false,
      "analytics.view": false,
    })
    setInviteLink("")
  }

  const handleClose = (isOpen: boolean): void => {
    if (!isOpen) resetForm()
    onOpenChange(isOpen)
  }

  const togglePermission = (key: PermissionKey): void => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async (): Promise<void> => {
    if (!email.trim()) {
      toast.error(t("dashboard.team.inviteFailed"))
      return
    }

    setSubmitting(true)
    try {
      const payload =
        rolePreset === "custom"
          ? {
              email: email.trim(),
              permissions: Object.entries(permissions)
                .filter(([, v]) => v)
                .map(([k]) => k),
            }
          : { email: email.trim(), preset: rolePreset }

      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/invitations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        getToken
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.message || t("dashboard.team.inviteFailed"))
        return
      }

      const data = await res.json()
      setInviteLink(data.inviteLink ?? "")
      setStep("success")
      onInvited?.()
    } catch {
      toast.error(t("dashboard.team.inviteFailed"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success(t("dashboard.team.copySuccess"))
    } catch {
      toast.success(t("dashboard.team.copySuccess"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-cairo text-[#1E0A3C]">
                {t("dashboard.team.inviteMember")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1E0A3C] font-cairo">
                  {t("dashboard.team.email")}
                </label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B5B7B]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("dashboard.team.emailPlaceholder")}
                    className="w-full h-11 rounded-xl border border-[#E4D8F0] bg-white ps-10 pe-4 text-sm text-[#1E0A3C] placeholder:text-[#6B5B7B]/50 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] font-cairo"
                  />
                </div>
              </div>

              {/* Role preset */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E0A3C] font-cairo">
                  {t("dashboard.team.chooseRole")}
                </label>
                <div className="space-y-2">
                  {ROLE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        rolePreset === option.value
                          ? "border-[#7C3AED] bg-[#EDE9FE]/30"
                          : "border-[#E4D8F0] hover:border-[#7C3AED]/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="rolePreset"
                        value={option.value}
                        checked={rolePreset === option.value}
                        onChange={() => setRolePreset(option.value)}
                        className="mt-0.5 accent-[#7C3AED]"
                      />
                      <div>
                        <span className="text-sm font-medium text-[#1E0A3C] font-cairo">
                          {t(option.labelKey)}
                        </span>
                        <p className="text-xs text-[#6B5B7B] font-cairo mt-0.5">
                          {t(option.descKey)}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom permissions */}
              {rolePreset === "custom" && (
                <div className="space-y-3 rounded-xl border border-[#E4D8F0] p-4">
                  {PERMISSION_SECTIONS.map((section) => (
                    <div key={section.labelKey} className="space-y-2">
                      <h4 className="text-xs font-semibold text-[#6B5B7B] uppercase tracking-wider font-cairo">
                        {t(section.labelKey)}
                      </h4>
                      {section.permissions.map((perm) => (
                        <label
                          key={perm.key}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-sm text-[#1E0A3C] font-cairo">
                            {t(perm.labelKey)}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={permissions[perm.key]}
                            onClick={() => togglePermission(perm.key)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                              permissions[perm.key] ? "bg-[#7C3AED]" : "bg-[#E4D8F0]"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${
                                permissions[perm.key] ? "translate-x-4 ms-0.5" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={submitting || !email.trim()}
                className="w-full gap-2 font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {t("dashboard.team.sendInvite")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-cairo text-[#1E0A3C]">
                {t("dashboard.team.inviteSent")}
              </DialogTitle>
              <p className="text-sm text-[#6B5B7B] font-cairo">
                {t("dashboard.team.inviteSentSubtitle")}
              </p>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Invite link */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 h-11 rounded-xl border border-[#E4D8F0] bg-[#F3EEFA] px-4 text-sm text-[#1E0A3C] font-mono truncate"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="h-11 w-11 shrink-0 border-[#E4D8F0] text-[#7C3AED] hover:bg-[#F3EEFA] cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleCopy}
                className="w-full gap-2 font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                {t("dashboard.team.copyInviteLink")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
