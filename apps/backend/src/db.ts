import { MongoClient, Db } from "mongodb"

let client: MongoClient | null = null

export async function connectToMongo(): Promise<Db> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("[db] MONGODB_URI is not set")
    throw new Error("MONGODB_URI environment variable is not set")
  }

  const dbName = process.env.MONGODB_DB_NAME || (() => {
    const match = uri.match(/\/([^/?]+)(?:\?|$)/)
    return match ? match[1] : "test"
  })()

  if (!client) {
    const host = uri.replace(/^mongodb(\+srv)?:\/\//, "").split("@").pop()?.split("/")[0] || "?"
    console.log("[db] Connecting to MongoDB", { host, dbName, uriFromEnv: !!uri })
    client = new MongoClient(uri)
    await client.connect()
    console.log("[db] Connected successfully")
  }

  return client.db(dbName)
}

export async function closeMongoConnection(): Promise<void> {
  if (client) {
    await client.close()
    client = null
  }
}
