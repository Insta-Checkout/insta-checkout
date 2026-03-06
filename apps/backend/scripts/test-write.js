#!/usr/bin/env node
/**
 * Test script: writes a document to MongoDB to verify Atlas connection.
 * Run: node scripts/test-write.js
 * Check Atlas UI → instacheckout database → test_writes collection
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

  console.log("Connecting to MongoDB...");
  console.log("Database:", dbName);

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName);
  const col = db.collection("test_writes");

  const doc = {
    message: "Hello from test-write.js",
    timestamp: new Date(),
    env: process.env.NODE_ENV || "development",
  };

  const result = await col.insertOne(doc);
  console.log("Inserted document:", result.insertedId);
  console.log("Document:", JSON.stringify(doc, null, 2));
  console.log("\nCheck Atlas: Database '%s' → Collection 'test_writes'", dbName);

  await client.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
