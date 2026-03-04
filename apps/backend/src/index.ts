import "dotenv/config"
import express from "express"
import cors from "cors"
import { connectToMongo } from "./db.js"
import sellersRouter from "./routes/sellers.js"

const app = express()
const PORT = process.env.PORT ?? 4000

const allowedOrigins = [
  "https://instacheckouteg.com",
  "https://www.instacheckouteg.com",
  "https://checkout.instacheckouteg.com",
  "https://landing.instacheckouteg.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
]
if (process.env.CORS_ORIGINS) {
  allowedOrigins.push(...process.env.CORS_ORIGINS.split(",").map((o) => o.trim()))
}

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      // Allow Vercel preview deployments (*.vercel.app)
      if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return cb(null, true)
      cb(null, false)
    },
  })
)
app.use(express.json())

// Root info
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "insta-checkout-backend",
    version: "0.1.0",
    endpoints: { health: "/health", db: "/api/health/db" },
    timestamp: new Date().toISOString(),
  })
})

// Health check (no DB required)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// PR environment test - hit this to verify it's the PR deployment
app.get("/pr-test", (_req, res) => {
  res.json({
    message: "PR environment is working!",
    branch: process.env.RAILWAY_GIT_BRANCH ?? "unknown",
    timestamp: new Date().toISOString(),
  })
})

// Sellers API
app.use("/sellers", sellersRouter)

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
