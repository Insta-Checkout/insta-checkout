import { Router, Request, Response } from "express"
import { connectToMongo } from "../db.js"
import { requirePermission } from "../middleware/requirePermission.js"
import { PERMISSIONS, ROLE_PRESETS, ALL_PERMISSIONS, type Permission } from "../permissions.js"
import crypto from "crypto"
import { ObjectId } from "mongodb"

const router = Router()
const INVITE_TTL_DAYS = 7
const MAX_INVITES_PER_DAY = 10

// POST /sellers/me/invitations — create and send an invite
router.post(
  "/invitations",
  requirePermission(PERMISSIONS.TEAM_INVITE),
  async (req: Request, res: Response) => {
    const { sellerId, isOwner } = req.sellerContext!
    const firebaseUid = req.firebaseUid!

    const { email, preset, permissions: customPermissions } = req.body as {
      email?: string
      preset?: string
      permissions?: string[]
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase())) {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "Valid email is required" })
      return
    }
    const normalizedEmail = email.trim().toLowerCase()

    // Resolve permissions from preset or custom
    let resolvedPermissions: Permission[]
    let roleLabel: string

    if (preset && preset !== "custom" && ROLE_PRESETS[preset]) {
      resolvedPermissions = ROLE_PRESETS[preset].permissions
      roleLabel = ROLE_PRESETS[preset].label
    } else if (Array.isArray(customPermissions)) {
      const valid = customPermissions.filter((p) =>
        ALL_PERMISSIONS.includes(p as Permission)
      ) as Permission[]
      if (valid.length === 0) {
        res.status(400).json({ error: "VALIDATION_ERROR", message: "At least one valid permission is required" })
        return
      }
      // Non-owners cannot grant team.manage
      if (!isOwner) {
        resolvedPermissions = valid.filter((p) => p !== PERMISSIONS.TEAM_MANAGE)
      } else {
        resolvedPermissions = valid
      }
      roleLabel = "Custom"
    } else {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "Either preset or permissions[] is required" })
      return
    }

    try {
      const db = await connectToMongo()
      const invitations = db.collection("invitations")
      const memberships = db.collection("memberships")

      // Check rate limit
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayCount = await invitations.countDocuments({
        sellerId,
        createdAt: { $gte: today },
      })
      if (todayCount >= MAX_INVITES_PER_DAY) {
        res.status(429).json({ error: "RATE_LIMITED", message: "Maximum 10 invitations per day" })
        return
      }

      // Check if already a member
      const existingMember = await memberships.findOne({ sellerId, email: normalizedEmail })
      if (existingMember) {
        res.status(409).json({ error: "ALREADY_MEMBER", message: "This person is already a team member" })
        return
      }

      // Check if pending invite exists
      const existingInvite = await invitations.findOne({
        sellerId,
        inviteeEmail: normalizedEmail,
        status: "pending",
      })
      if (existingInvite) {
        res.status(409).json({ error: "ALREADY_INVITED", message: "A pending invitation already exists for this email" })
        return
      }

      // Check if inviting the account owner
      const seller = await db.collection("sellers").findOne({ _id: sellerId })
      if (seller?.email?.toLowerCase() === normalizedEmail) {
        res.status(400).json({ error: "VALIDATION_ERROR", message: "Cannot invite the account owner" })
        return
      }

      const token = crypto.randomBytes(24).toString("base64url")
      const now = new Date()
      const expiresAt = new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000)

      const doc = {
        sellerId,
        invitedBy: firebaseUid,
        inviteeEmail: normalizedEmail,
        permissions: resolvedPermissions,
        roleLabel,
        token,
        status: "pending" as const,
        expiresAt,
        createdAt: now,
        acceptedAt: null,
      }

      await invitations.insertOne(doc)

      // TODO: Send invitation email via email service (Task #78)
      const inviteUrl = `${process.env.LANDING_BASE_URL ?? "https://instacheckouteg.com"}/invite/${token}`

      res.status(201).json({
        success: true,
        invitation: {
          email: normalizedEmail,
          roleLabel,
          permissions: resolvedPermissions,
          inviteUrl,
          expiresAt,
        },
      })
    } catch (err) {
      console.error("[POST /sellers/me/invitations]", err)
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create invitation" })
    }
  }
)

// GET /sellers/me/invitations — list pending invites
router.get(
  "/invitations",
  requirePermission(PERMISSIONS.TEAM_INVITE),
  async (req: Request, res: Response) => {
    const { sellerId } = req.sellerContext!
    try {
      const db = await connectToMongo()
      const items = await db.collection("invitations")
        .find({ sellerId, status: "pending" })
        .sort({ createdAt: -1 })
        .toArray()

      res.json({
        items: items.map((i) => ({
          id: i._id,
          email: i.inviteeEmail,
          roleLabel: i.roleLabel,
          permissions: i.permissions,
          expiresAt: i.expiresAt,
          createdAt: i.createdAt,
        })),
      })
    } catch (err) {
      console.error("[GET /sellers/me/invitations]", err)
      res.status(500).json({ error: "INTERNAL_ERROR" })
    }
  }
)

// DELETE /sellers/me/invitations/:id — revoke a pending invite
router.delete(
  "/invitations/:id",
  requirePermission(PERMISSIONS.TEAM_INVITE),
  async (req: Request, res: Response) => {
    const { sellerId } = req.sellerContext!
    let inviteId: ObjectId
    try {
      inviteId = new ObjectId(req.params.id)
    } catch {
      res.status(400).json({ error: "INVALID_ID" })
      return
    }
    try {
      const db = await connectToMongo()
      const result = await db.collection("invitations").findOneAndUpdate(
        { _id: inviteId, sellerId, status: "pending" },
        { $set: { status: "revoked", updatedAt: new Date() } },
        { returnDocument: "after" }
      )
      if (!result) {
        res.status(404).json({ error: "NOT_FOUND" })
        return
      }
      res.json({ success: true })
    } catch (err) {
      console.error("[DELETE /sellers/me/invitations/:id]", err)
      res.status(500).json({ error: "INTERNAL_ERROR" })
    }
  }
)

export default router
