import { connectToMongo, closeMongoConnection } from "../src/db.js"

async function migrate(): Promise<void> {
  const db = await connectToMongo()
  const sellers = db.collection("sellers")

  const result = await sellers.updateMany(
    { approvalStatus: { $exists: false } },
    {
      $set: {
        approvalStatus: "approved",
        approvalNote: null,
        approvedAt: new Date(),
        rejectedAt: null,
      },
    }
  )

  console.log(`[Migration] Updated ${result.modifiedCount} existing sellers to approved`)
  await closeMongoConnection()
  process.exit(0)
}

migrate().catch((err) => {
  console.error("[Migration] Failed:", err)
  process.exit(1)
})
