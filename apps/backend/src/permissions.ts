/**
 * Permissions engine — single source of truth for all permission keys and role presets.
 * Authorization always checks permissions, never roles. The role label is cosmetic.
 */

export const PERMISSIONS = {
  PAYMENT_LINKS_CREATE: "payment_links.create",
  PAYMENT_LINKS_EDIT: "payment_links.edit",
  PAYMENT_LINKS_DELETE: "payment_links.delete",
  PAYMENT_LINKS_APPROVE: "payment_links.approve",
  ANALYTICS_VIEW: "analytics.view",
  TEAM_INVITE: "team.invite",
  TEAM_MANAGE: "team.manage",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS)

/** Preset templates — the "role" is just a label for a set of permissions */
export const ROLE_PRESETS: Record<
  string,
  { label: string; labelAr: string; permissions: Permission[] }
> = {
  link_manager: {
    label: "Link Manager",
    labelAr: "مدير الروابط",
    permissions: [
      PERMISSIONS.PAYMENT_LINKS_CREATE,
      PERMISSIONS.PAYMENT_LINKS_EDIT,
      PERMISSIONS.PAYMENT_LINKS_DELETE,
    ],
  },
  full_access: {
    label: "Full Access",
    labelAr: "صلاحيات كاملة",
    permissions: [
      PERMISSIONS.PAYMENT_LINKS_CREATE,
      PERMISSIONS.PAYMENT_LINKS_EDIT,
      PERMISSIONS.PAYMENT_LINKS_DELETE,
      PERMISSIONS.PAYMENT_LINKS_APPROVE,
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.TEAM_INVITE,
    ],
  },
  // "custom" has no preset — permissions are explicitly set by the inviter
}
