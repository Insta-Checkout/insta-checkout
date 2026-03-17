"use client"

import { useEffect, useState } from "react"
import { Loader2, Shield } from "lucide-react"
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

const ALL_PERMISSION_KEYS: PermissionKey[] = [
  "payment_links.create",
  "payment_links.edit",
  "payment_links.delete",
  "payment_links.approve",
  "analytics.view",
]

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

type TeamMember = {
  _id: string
  email: string
  role: string
  permissions?: string[]
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: TeamMember | null
  onUpdated?: () => void
}

export function EditMemberModal({ open, onOpenChange, member, onUpdated }: Props): React.JSX.Element {
  const { t } = useTranslations()
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>({
    "payment_links.create": false,
    "payment_links.edit": false,
    "payment_links.delete": false,
    "payment_links.approve": false,
    "analytics.view": false,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (member) {
      const mapped: Record<PermissionKey, boolean> = {
        "payment_links.create": false,
        "payment_links.edit": false,
        "payment_links.delete": false,
        "payment_links.approve": false,
        "analytics.view": false,
      }
      for (const key of ALL_PERMISSION_KEYS) {
        if (member.permissions?.includes(key)) {
          mapped[key] = true
        }
      }
      setPermissions(mapped)
    }
  }, [member])

  const getToken = (): Promise<string | null> =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null)

  const togglePermission = (key: PermissionKey): void => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async (): Promise<void> => {
    if (!member) return

    setSubmitting(true)
    try {
      const payload = {
        permissions: Object.entries(permissions)
          .filter(([, v]) => v)
          .map(([k]) => k),
      }

      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/team/${member._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        getToken
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.message || t("dashboard.team.updateFailed"))
        return
      }

      toast.success(t("dashboard.team.updateSuccess"))
      onUpdated?.()
      onOpenChange(false)
    } catch {
      toast.error(t("dashboard.team.updateFailed"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-cairo text-[#1E0A3C]">
            {t("dashboard.team.editPermissions")}
          </DialogTitle>
          {member && (
            <p className="text-sm text-[#6B5B7B] font-cairo">{member.email}</p>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-4">
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

          <Button
            onClick={handleSave}
            disabled={submitting}
            className="w-full gap-2 font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {t("dashboard.team.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
