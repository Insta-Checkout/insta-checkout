"use client"

import { useState } from "react"
import { Users, Mail, Shield, Clock, Edit2, Trash2, X, Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { auth } from "@/lib/firebase"
import { fetchWithAuth, getBackendUrl } from "@/lib/api"
import { useTranslations } from "@/lib/locale-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EditMemberModal } from "@/components/team/EditMemberModal"

type TeamMember = {
  id: string
  email: string
  roleLabel: string
  permissions?: string[]
  joinedAt?: string
}

type PendingInvite = {
  id: string
  email: string
  roleLabel: string
  expiresAt?: string
}

type Props = {
  members: TeamMember[]
  pendingInvites: PendingInvite[]
  onRefresh: () => void
  onInviteClick?: () => void
}

export function TeamList({ members, pendingInvites, onRefresh, onInviteClick }: Props): React.JSX.Element {
  const { t } = useTranslations()
  const [editMember, setEditMember] = useState<TeamMember | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const getToken = (): Promise<string | null> =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null)

  const handleEditOpen = (member: TeamMember): void => {
    setEditMember(member)
    setEditOpen(true)
  }

  const handleRemoveOpen = (member: TeamMember): void => {
    setRemoveTarget(member)
    setRemoveOpen(true)
  }

  const handleRemoveConfirm = async (): Promise<void> => {
    if (!removeTarget) return

    setRemoving(true)
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/team/${removeTarget._id}`,
        { method: "DELETE" },
        getToken
      )

      if (!res.ok) {
        toast.error(t("dashboard.team.removeFailed"))
        return
      }

      toast.success(t("dashboard.team.removeSuccess"))
      setRemoveOpen(false)
      onRefresh()
    } catch {
      toast.error(t("dashboard.team.removeFailed"))
    } finally {
      setRemoving(false)
    }
  }

  const handleRevoke = async (inviteId: string): Promise<void> => {
    setRevokingId(inviteId)
    try {
      const res = await fetchWithAuth(
        `${getBackendUrl()}/sellers/me/invitations/${inviteId}`,
        { method: "DELETE" },
        getToken
      )

      if (!res.ok) {
        toast.error(t("dashboard.team.revokeFailed"))
        return
      }

      toast.success(t("dashboard.team.revokeSuccess"))
      onRefresh()
    } catch {
      toast.error(t("dashboard.team.revokeFailed"))
    } finally {
      setRevokingId(null)
    }
  }

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      {/* Team Members Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#7C3AED]" />
          <h2 className="text-lg font-semibold text-[#1E0A3C] font-cairo">
            {t("dashboard.team.members")}
          </h2>
        </div>

        {members.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E4D8F0] p-10 text-center space-y-3">
            <Users className="h-10 w-10 text-[#C4B5FD] mx-auto" />
            <p className="text-base font-semibold text-[#1E0A3C] font-cairo">
              {t("dashboard.team.noMembers")}
            </p>
            <p className="text-sm text-[#6B5B7B] font-cairo max-w-xs mx-auto">
              {t("dashboard.team.noMembersSubtitle")}
            </p>
            {onInviteClick && (
              <Button
                onClick={onInviteClick}
                className="gap-2 font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer mt-2"
              >
                <UserPlus className="h-4 w-4" />
                {t("dashboard.team.inviteMember")}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-[#E4D8F0] p-4 flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-[#7C3AED]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E0A3C] font-cairo truncate">
                    {member.email}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs bg-[#EDE9FE] text-[#7C3AED] px-2 py-0.5 rounded-full font-cairo">
                      <Shield className="h-3 w-3" />
                      {member.roleLabel === "owner"
                        ? t("dashboard.team.ownerBadge")
                        : member.roleLabel}
                    </span>
                    {member.joinedAt && (
                      <span className="text-xs text-[#6B5B7B] font-cairo">
                        {t("dashboard.team.joinedAt")} {formatDate(member.joinedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {member.role !== "owner" && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEditOpen(member)}
                      className="text-[#6B5B7B] hover:text-[#7C3AED] hover:bg-[#EDE9FE] cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveOpen(member)}
                      className="text-[#6B5B7B] hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invites Section */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#7C3AED]" />
          <h2 className="text-lg font-semibold text-[#1E0A3C] font-cairo">
            {t("dashboard.team.pendingInvites")}
          </h2>
        </div>

        {pendingInvites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E4D8F0] p-8 text-center">
            <Mail className="h-10 w-10 text-[#E4D8F0] mx-auto mb-3" />
            <p className="text-sm text-[#6B5B7B] font-cairo">
              {t("dashboard.team.noPendingInvites")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="bg-white rounded-2xl border border-[#E4D8F0] p-4 flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-[#7C3AED]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E0A3C] font-cairo truncate">
                    {invite.email}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs bg-[#EDE9FE] text-[#7C3AED] px-2 py-0.5 rounded-full font-cairo">
                      {t("dashboard.team.role")}: {invite.roleLabel}
                    </span>
                    {invite.expiresAt && (
                      <span className="text-xs text-[#6B5B7B] font-cairo">
                        {t("dashboard.team.expiresAt")} {formatDate(invite.expiresAt)}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(invite.id)}
                  disabled={revokingId === invite.id}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 font-cairo shrink-0 cursor-pointer"
                >
                  {revokingId === invite.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {t("dashboard.team.revokeInvite")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditMemberModal
        open={editOpen}
        onOpenChange={setEditOpen}
        member={editMember}
        onUpdated={onRefresh}
      />

      {/* Remove Confirmation Dialog */}
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-cairo text-[#1E0A3C]">
              {t("dashboard.team.removeMember")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#6B5B7B] font-cairo mt-2">
            {t("dashboard.team.removeConfirm")}
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setRemoveOpen(false)}
              className="flex-1 font-cairo border-[#E4D8F0] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleRemoveConfirm}
              disabled={removing}
              className="flex-1 gap-2 font-cairo bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              {removing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {t("dashboard.team.removeMember")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
