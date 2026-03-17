import { Router, Request, Response } from "express"
import { connectToMongo } from "../db.js"
import { requireOwner } from "../middleware/requirePermission.js"
import { ALL_PERMISSIONS, type Permission } from "../permissions.js"
import { ObjectId } from "mongodb"

const router = Router()

// GET /sellers/me/team — list team members (owner only)
router.get("/team", requireOwner, async (req: Request, res: Response) => {
  const { sellerId } = req.sellerContext!
  try {
    const db = await connectToMongo()
    const members = await db.collection("memberships")
      .find({ sellerId })
      .sort({ joinedAt: -1 })
      .toArray()

    res.json({
      items: members.map((m) => ({
        id: m._id,
        email: m.email,
        displayName: m.displayName,
        roleLabel: m.roleLabel,
        permissions: m.permissions,
        joinedAt: m.joinedAt,
      })),
    })
  } catch (err) {
    console.error("[GET /sellers/me/team]", err)
    res.status(500).json({ error: "INTERNAL_ERROR" })
  }
})

// PATCH /sellers/me/team/:id — update a member's permissions (owner only)
router.patch("/team/:id", requireOwner, async (req: Request, res: Response) => {
  const { sellerId } = req.sellerContext!
  let memberId: ObjectId
  try {
    memberId = new ObjectId(req.params.id)
  } catch {
    res.status(400).json({ error: "INVALID_ID" })
    return
  }
  const { permissions, roleLabel } = req.body as {
    permissions?: string[]
    roleLabel?: string
  }
  if (!Array.isArray(permissions) || permissions.length === 0) {
    res.status(400).json({ error: "VALIDATION_ERROR", message: "permissions[] is required" })
    return
  }
  const valid = permissions.filter((p) =>
    ALL_PERMISSIONS.includes(p as Permission)
  ) as Permission[]

  try {
    const db = await connectToMongo()
    const result = await db.collection("memberships").findOneAndUpdate(
      { _id: memberId, sellerId },
      {
        $set: {
          permissions: valid,
          roleLabel: roleLabel ?? "Custom",
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    )
    if (!result) {
      res.status(404).json({ error: "NOT_FOUND" })
      return
    }
    res.json({ success: true, permissions: result.permissions, roleLabel: result.roleLabel })
  } catch (err) {
    console.error("[PATCH /sellers/me/team/:id]", err)
    res.status(500).json({ error: "INTERNAL_ERROR" })
  }
})

// DELETE /sellers/me/team/:id — remove a member (owner only)
router.delete("/team/:id", requireOwner, async (req: Request, res: Response) => {
  const { sellerId } = req.sellerContext!
  let memberId: ObjectId
  try {
    memberId = new ObjectId(req.params.id)
  } catch {
    res.status(400).json({ error: "INVALID_ID" })
    return
  }
  try {
    const db = await connectToMongo()
    const result = await db.collection("memberships").deleteOne({ _id: memberId, sellerId })
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "NOT_FOUND" })
      return
    }
    res.json({ success: true })
  } catch (err) {
    console.error("[DELETE /sellers/me/team/:id]", err)
    res.status(500).json({ error: "INTERNAL_ERROR" })
  }
})

export default router
