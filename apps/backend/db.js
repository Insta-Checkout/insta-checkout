const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, { dbName: "instacheckout" });
  console.log("Connected to MongoDB (instacheckout)");
}

module.exports = connectDB;
