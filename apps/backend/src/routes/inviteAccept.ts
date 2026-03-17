import { Router, Request, Response } from "express"
import { connectToMongo } from "../db.js"
import { requireFirebaseAuth } from "../middleware/firebaseAuth.js"

const router = Router()

// GET /invitations/:token — public, returns invite info for the accept page
router.get("/:token", async (req: Request, res: Response) => {
  const { token } = req.params
  try {
    const db = await connectToMongo()
    const invite = await db.collection("invitations").findOne({ token })
    if (!invite) {
      res.status(404).json({ error: "NOT_FOUND", message: "Invitation not found" })
      return
    }
    if (invite.status !== "pending") {
      res.status(410).json({ error: "INVITE_USED", message: `Invitation has been ${invite.status}` })
      return
    }
    if (new Date() > invite.expiresAt) {
      await db.collection("invitations").updateOne(
        { _id: invite._id },
        { $set: { status: "expired" } }
      )
      res.status(410).json({ error: "INVITE_EXPIRED", message: "This invitation has expired" })
      return
    }

    // Get seller business name for display
    const seller = await db.collection("sellers").findOne({ _id: invite.sellerId })

    res.json({
      email: invite.inviteeEmail,
      roleLabel: invite.roleLabel,
      permissions: invite.permissions,
      businessName: seller?.businessName ?? "Unknown",
      expiresAt: invite.expiresAt,
    })
  } catch (err) {
    console.error("[GET /invitations/:token]", err)
    res.status(500).json({ error: "INTERNAL_ERROR" })
  }
})

// POST /invitations/:token/accept — requires auth
router.post("/:token/accept", requireFirebaseAuth, async (req: Request, res: Response) => {
  const { token } = req.params
  const firebaseUid = req.firebaseUid!
  const firebaseEmail = req.firebaseEmail

  try {
    const db = await connectToMongo()
    const invite = await db.collection("invitations").findOne({ token, status: "pending" })

    if (!invite) {
      res.status(404).json({ error: "NOT_FOUND", message: "Invitation not found or already used" })
      return
    }
    if (new Date() > invite.expiresAt) {
      await db.collection("invitations").updateOne(
        { _id: invite._id },
        { $set: { status: "expired" } }
      )
      res.status(410).json({ error: "INVITE_EXPIRED" })
      return
    }

    // Prevent the account owner from accepting their own invite
    const seller = await db.collection("sellers").findOne({ _id: invite.sellerId })
    if (seller?.firebaseUid === firebaseUid) {
      res.status(400).json({ error: "VALIDATION_ERROR", message: "You are already the account owner" })
      return
    }

    // Check if already a member
    const existing = await db.collection("memberships").findOne({
      sellerId: invite.sellerId,
      firebaseUid,
    })
    if (existing) {
      // Mark invite as accepted anyway
      await db.collection("invitations").updateOne(
        { _id: invite._id },
        { $set: { status: "accepted", acceptedAt: new Date() } }
      )
      res.status(409).json({ error: "ALREADY_MEMBER", message: "You are already a team member" })
      return
    }

    const now = new Date()

    // Create membership
    await db.collection("memberships").insertOne({
      sellerId: invite.sellerId,
      firebaseUid,
      email: firebaseEmail ?? invite.inviteeEmail,
      displayName: null,
      permissions: invite.permissions,
      roleLabel: invite.roleLabel,
      invitedBy: invite.invitedBy,
      joinedAt: now,
      updatedAt: now,
    })

    // Mark invite as accepted
    await db.collection("invitations").updateOne(
      { _id: invite._id },
      { $set: { status: "accepted", acceptedAt: now } }
    )

    res.json({
      success: true,
      businessName: seller?.businessName ?? "Unknown",
      roleLabel: invite.roleLabel,
    })
  } catch (err) {
    console.error("[POST /invitations/:token/accept]", err)
    res.status(500).json({ error: "INTERNAL_ERROR" })
  }
})

export default router
