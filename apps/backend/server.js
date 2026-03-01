require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const sellersRouter = require("./routes/sellers");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/sellers", sellersRouter);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});

module.exports = app;
