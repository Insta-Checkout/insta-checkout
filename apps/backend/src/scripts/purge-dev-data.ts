/**
 * purge-dev-data.ts
 *
 * One-off script: deletes ALL Firebase Auth accounts and ALL user-related
 * MongoDB documents in the dev database.
 *
 * Run: tsx src/scripts/purge-dev-data.ts
 */

import "dotenv/config"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import admin from "firebase-admin"
import { MongoClient } from "mongodb"

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Firebase ──────────────────────────────────────────────────────────────────

async function deleteAllFirebaseUsers(): Promise<number> {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? "instacheckout-a4141"

  const serviceAccountPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ??
    resolve(__dirname, "../../firebase-adminsdk.json")

  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"))
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

  const auth = admin.auth()
  let deleted = 0
  let nextPageToken: string | undefined

  console.log("[Firebase] Listing users...")

  do {
    const listResult = await auth.listUsers(1000, nextPageToken)
    const uids = listResult.users.map((u) => u.uid)

    if (uids.length > 0) {
      const result = await auth.deleteUsers(uids)
      deleted += result.successCount
      if (result.failureCount > 0) {
        console.warn(`[Firebase] ${result.failureCount} deletions failed:`)
        result.errors.forEach((e) =>
          console.warn(`  uid=${e.index}: ${e.error.message}`)
        )
      }
      console.log(`[Firebase] Deleted ${result.successCount} accounts (total so far: ${deleted})`)
    }

    nextPageToken = listResult.pageToken
  } while (nextPageToken)

  return deleted
}

// ── MongoDB ───────────────────────────────────────────────────────────────────

const COLLECTIONS_TO_PURGE = [
  "sellers",
  "memberships",
  "invitations",
  "products",
  "payment_links",
  "verification_codes",
]

async function purgeMongoCollections(): Promise<Record<string, number>> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is not set")

  const match = uri.match(/\/([^/?]+)(?:\?|$)/)
  const dbName = process.env.MONGODB_DB_NAME ?? (match ? match[1] : "test")

  console.log(`[MongoDB] Connecting to database "${dbName}"...`)
  const client = new MongoClient(uri)
  await client.connect()
  console.log("[MongoDB] Connected.")

  const db = client.db(dbName)
  const counts: Record<string, number> = {}

  for (const name of COLLECTIONS_TO_PURGE) {
    const col = db.collection(name)
    const { deletedCount } = await col.deleteMany({})
    counts[name] = deletedCount
    console.log(`[MongoDB] ${name}: deleted ${deletedCount} documents`)
  }

  await client.close()
  return counts
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== DEV PURGE STARTED ===\n")

  const firebaseDeleted = await deleteAllFirebaseUsers()
  console.log(`\n[Firebase] Total accounts deleted: ${firebaseDeleted}`)

  console.log()

  const mongoCounts = await purgeMongoCollections()
  const mongoTotal = Object.values(mongoCounts).reduce((a, b) => a + b, 0)
  console.log(`\n[MongoDB] Total documents deleted: ${mongoTotal}`)

  console.log("\n=== DEV PURGE COMPLETE ===")
}

main().catch((err) => {
  console.error("[purge] Fatal error:", err)
  process.exit(1)
})
