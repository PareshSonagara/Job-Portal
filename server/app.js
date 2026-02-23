import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

// ─── Middlewares ────────────────────────────────────────────
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

// CORS: restrict to frontend origin (set CLIENT_URL in .env for production)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Cloud Storage Active: Local static serving removed

//routes
// NOTE: folder is named "Routes" (capital R) — must match exactly on Linux
import userRoute from "./Routes/user.route.js";
import companyRoute from "./Routes/company.route.js";
import jobRoute from "./Routes/jobs.route.js";

app.get("/", (req, res) => {
  res.send("Welcome to Paresh Sonagara Job Portal Management System");
});

// --------------- App Use --------------------
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1", jobRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

export default app;
