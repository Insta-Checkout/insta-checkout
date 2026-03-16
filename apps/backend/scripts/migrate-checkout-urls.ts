/**
 * Migration: Update all payment link checkoutUrls to pay.instacheckouteg.com
 *
 * Handles old domains: pay.instacheckout.com, pay.instacheckout.co, localhost:3001
 *
 * Usage: npx tsx scripts/migrate-checkout-urls.ts
 * Requires MONGODB_URI env var (reads from .env automatically via dotenv)
 */

import "dotenv/config"
import { MongoClient } from "mongodb"

const NEW_DOMAIN = "https://pay.instacheckouteg.com"

const OLD_DOMAINS = [
  "https://pay.instacheckout.com",
  "https://pay.instacheckout.co",
  "http://localhost:3001",
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("MONGODB_URI is not set")
    process.exit(1)
  }

  const dbName =
    process.env.MONGODB_DB_NAME ||
    (() => {
      const match = uri.match(/\/([^/?]+)(?:\?|$)/)
      return match ? match[1] : "test"
    })()

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)
  const collection = db.collection("payment_links")

  let totalUpdated = 0

  for (const oldDomain of OLD_DOMAINS) {
    const escapedDomain = oldDomain.replace(/\./g, "\\.").replace(/\//g, "\\/")
    const filter = { checkoutUrl: { $regex: `^${escapedDomain}` } }

    const count = await collection.countDocuments(filter)
    if (count === 0) continue

    const result = await collection.updateMany(filter, [
      {
        $set: {
          checkoutUrl: {
            $replaceOne: {
              input: "$checkoutUrl",
              find: oldDomain,
              replacement: NEW_DOMAIN,
            },
          },
        },
      },
    ])

    console.log(`Updated ${result.modifiedCount} links from ${oldDomain}`)
    totalUpdated += result.modifiedCount
  }

  if (totalUpdated === 0) {
    console.log("Nothing to migrate — all links already use the correct domain.")
  } else {
    console.log(`\nTotal updated: ${totalUpdated}`)
  }

  // Verify all links
  const links = await collection
    .find({}, { projection: { checkoutUrl: 1, _id: 0 } })
    .toArray()
  console.log("\nAll payment link URLs:")
  links.forEach((l) => console.log(" ", l.checkoutUrl))

  await client.close()
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
