import type { Request, Response, NextFunction } from "express"
import { connectToMongo } from "../db.js"
import { ALL_PERMISSIONS, type Permission } from "../permissions.js"
import type { ObjectId } from "mongodb"

declare global {
  namespace Express {
    interface Request {
      sellerContext?: {
        sellerId: ObjectId
        isOwner: boolean
        permissions: Permission[]
        membershipId?: ObjectId
      }
    }
  }
}

/**
 * Resolves the authenticated user's seller context and permissions.
 * 1. If user is the account owner → full permissions (implicit, no membership doc needed).
 * 2. If user is a team member → load permissions from their membership document.
 * 3. Otherwise → 404 (no seller context found).
 */
export async function resolveSellerContext(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const firebaseUid = req.firebaseUid
  if (!firebaseUid) {
    res.status(401).json({ error: "UNAUTHORIZED" })
    return
  }

  try {
    const db = await connectToMongo()

    // 1. Check if user is an account owner
    const seller = await db.collection("sellers").findOne({ firebaseUid })
    if (seller) {
      req.sellerContext = {
        sellerId: seller._id as ObjectId,
        isOwner: true,
        permissions: ALL_PERMISSIONS,
      }
      next()
      return
    }

    // 2. Check if user is a team member
    const membership = await db.collection("memberships").findOne({ firebaseUid })
    if (membership) {
      req.sellerContext = {
        sellerId: membership.sellerId as ObjectId,
        isOwner: false,
        permissions: membership.permissions as Permission[],
        membershipId: membership._id as ObjectId,
      }
      next()
      return
    }

    // 3. No seller context found
    res.status(404).json({ error: "NOT_FOUND", message: "No seller account found for this user" })
  } catch (err) {
    console.error("[resolveSellerContext]", err)
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to resolve seller context" })
  }
}
