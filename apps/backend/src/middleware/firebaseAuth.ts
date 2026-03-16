import type { Request, Response, NextFunction } from "express"
import admin from "firebase-admin"

declare global {
  namespace Express {
    interface Request {
      firebaseUid?: string
      firebaseEmail?: string
    }
  }
}
let firebaseInitialized = false

function initFirebase() {
  if (firebaseInitialized) return
  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({ credential: admin.credential.applicationDefault() })
    } else {
      const projectId = process.env.FIREBASE_PROJECT_ID ?? "instacheckout-a4141"
      admin.initializeApp({ projectId })
    }
  } catch (e) {
    console.warn("[Firebase Auth] Init failed:", e)
  }
  firebaseInitialized = true
}

export async function requireFirebaseAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!token) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Authorization header with Bearer token required" })
    return
  }
  try {
    initFirebase()
    const decoded = await admin.auth().verifyIdToken(token)
    req.firebaseUid = decoded.uid
    req.firebaseEmail = decoded.email
    next()
  } catch (err) {
    console.error("[Firebase Auth] Token verification failed:", err)
    res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid or expired token" })
  }
}
