#!/usr/bin/env node
/**
 * Query sellers from the same DB as the backend (uses .env MONGODB_URI)
 * Run: node scripts/query-sellers.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { MongoClient } = require("mongodb");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }

  const dbName = process.env.MONGODB_DB_NAME || (() => {
    const match = uri.match(/\/([^/?]+)(?:\?|$)/);
    return match ? match[1] : "test";
  })();

  console.log("Connecting to database:", dbName);
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName);
  const collections = await db.listCollections().toArray();
  console.log("\nCollections:", collections.map((c) => c.name).join(", ") || "(none)");

  const sellers = db.collection("sellers");
  const count = await sellers.countDocuments();
  console.log("\nSellers count:", count);

  if (count > 0) {
    const docs = await sellers.find({}).limit(10).toArray();
    console.log("\nSample documents (showing email, whatsappNumber, businessName, firebaseUid):\n");
    docs.forEach((d, i) => {
      console.log(`--- Seller ${i + 1} ---`);
      console.log("  _id:", d._id?.toString());
      console.log("  email:", d.email ?? "(missing)");
      console.log("  whatsappNumber:", d.whatsappNumber ?? "(missing)");
      console.log("  businessName:", d.businessName ?? "(missing)");
      console.log("  firebaseUid:", d.firebaseUid ?? "(missing)");
      console.log("  createdAt:", d.createdAt);
      console.log("");
    });
  }

  await client.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
