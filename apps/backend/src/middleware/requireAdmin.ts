import type { Request, Response, NextFunction } from "express"
import { requireFirebaseAuth } from "./firebaseAuth.js"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireFirebaseAuth(req, res, () => {
    const email = req.firebaseEmail
    if (!email || !ADMIN_EMAILS.includes(email.toLowerCase())) {
      res.status(403).json({ error: "FORBIDDEN", message: "Admin access required" })
      return
    }
    next()
  })
}
