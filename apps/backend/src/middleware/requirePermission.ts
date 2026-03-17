import type { Request, Response, NextFunction } from "express"
import type { Permission } from "../permissions.js"

/**
 * Middleware factory that checks if the authenticated user has ALL of the required permissions.
 * Must be used after resolveSellerContext in the middleware stack.
 */
export function requirePermission(...required: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ctx = req.sellerContext
    if (!ctx) {
      res.status(401).json({ error: "UNAUTHORIZED" })
      return
    }
    const hasAll = required.every((p) => ctx.permissions.includes(p))
    if (!hasAll) {
      res.status(403).json({
        error: "FORBIDDEN",
        message: "You don't have permission to perform this action",
      })
      return
    }
    next()
  }
}

/**
 * Middleware that requires the user to be the account owner.
 * Must be used after resolveSellerContext.
 */
export function requireOwner(req: Request, res: Response, next: NextFunction): void {
  const ctx = req.sellerContext
  if (!ctx) {
    res.status(401).json({ error: "UNAUTHORIZED" })
    return
  }
  if (!ctx.isOwner) {
    res.status(403).json({
      error: "FORBIDDEN",
      message: "Only the account owner can perform this action",
    })
    return
  }
  next()
}
