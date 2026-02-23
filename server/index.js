import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

const requiredEnv = ["JWT_SECRET"];
const missingRequired = requiredEnv.filter((key) => !process.env[key]);

if (missingRequired.length) {
  console.error(`Missing required env vars: ${missingRequired.join(", ")}`);
  process.exit(1);
}

const port = process.env.PORT || 5000;
if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI not set; using local default.");
}

const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/job-portal";

console.log("Connecting to MongoDB...");
console.log("MongoDB URI:", mongoURI);

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    // Start server
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });
