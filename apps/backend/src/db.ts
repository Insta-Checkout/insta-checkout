import { MongoClient, Db } from "mongodb"

let client: MongoClient | null = null

export async function connectToMongo(): Promise<Db> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
  }

  return client.db()
}

export async function closeMongoConnection(): Promise<void> {
  if (client) {
    await client.close()
    client = null
  }
}
