import "dotenv/config"
import express from "express"
import cors from "cors"
import { connectToMongo } from "./db.js"

const app = express()
const PORT = process.env.PORT ?? 4000

app.use(cors())
app.use(express.json())

// Health check (no DB required)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// MongoDB connection validation
app.get("/api/health/db", async (_req, res) => {
  try {
    const db = await connectToMongo()
    const result = await db.command({ ping: 1 })
    res.json({
      status: "ok",
      mongodb: "connected",
      ping: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(503).json({
      status: "error",
      mongodb: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })
  }
})

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`)
  console.log(`  Health:    http://localhost:${PORT}/health`)
  console.log(`  DB check:  http://localhost:${PORT}/api/health/db`)
})
