"use client"

import { useCallback, useEffect, useState } from "react"
import { UserPlus, Loader2, Users } from "lucide-react"
import { toast } from "sonner"

import { auth } from "@/lib/firebase"
import { fetchWithAuth, getBackendUrl } from "@/lib/api"
import { useTranslations } from "@/lib/locale-provider"
import { Button } from "@/components/ui/button"
import { InviteModal } from "@/components/team/InviteModal"
import { TeamList } from "@/components/team/TeamList"

type TeamMember = {
  _id: string
  email: string
  role: string
  permissions?: string[]
  joinedAt?: string
}

type PendingInvite = {
  _id: string
  email: string
  role: string
  expiresAt?: string
}

export default function TeamPage(): React.JSX.Element {
  const { t } = useTranslations()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)

  const getToken = (): Promise<string | null> =>
    auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null)

  const fetchTeamData = useCallback(async (): Promise<void> => {
    try {
      const [teamRes, invitesRes] = await Promise.all([
        fetchWithAuth(`${getBackendUrl()}/sellers/me/team`, {}, getToken),
        fetchWithAuth(`${getBackendUrl()}/sellers/me/invitations`, {}, getToken),
      ])

      if (teamRes.ok) {
        const teamData = await teamRes.json()
        setMembers(teamData.members ?? teamData ?? [])
      }

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json()
        setPendingInvites(invitesData.invitations ?? invitesData ?? [])
      }
    } catch {
      toast.error(t("dashboard.team.loadFailed"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchTeamData()
  }, [fetchTeamData])

  const handleRefresh = (): void => {
    fetchTeamData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E0A3C] font-cairo flex items-center gap-2">
            <Users className="h-6 w-6 text-[#7C3AED]" />
            {t("dashboard.team.title")}
          </h1>
          <p className="mt-1 text-sm text-[#6B5B7B] font-cairo">
            {t("dashboard.team.subtitle")}
          </p>
        </div>

        <Button
          onClick={() => setInviteOpen(true)}
          className="gap-2 font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          {t("dashboard.team.inviteMember")}
        </Button>
      </div>

      {/* Team content */}
      <TeamList
        members={members}
        pendingInvites={pendingInvites}
        onRefresh={handleRefresh}
      />

      {/* Invite Modal */}
      <InviteModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={handleRefresh}
      />
    </div>
  )
}
