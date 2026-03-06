#!/usr/bin/env node
/**
 * Deletes the test_writes collection used by test-write.js
 * Run: node scripts/delete-test-writes.js
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

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName);
  await db.collection("test_writes").drop();
  console.log("Dropped collection: instacheckout.test_writes");

  await client.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
