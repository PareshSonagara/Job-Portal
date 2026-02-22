const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");

// ─── Middlewares ────────────────────────────────────────────
app.use(express.json());

// CORS: restrict to frontend origin (set CLIENT_URL in .env for production)
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));

// Cloud Storage Active: Local static serving removed


//routes
// NOTE: folder is named "Routes" (capital R) — must match exactly on Linux
const userRoute = require("./Routes/user.route");
const companyRoute = require("./Routes/company.route");
const jobRoute = require("./Routes/jobs.route");

app.get("/", (req, res) => {
  res.send("Welcome to Paresh Sonagara Job Portal Management System");
});

// --------------- App Use --------------------
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1", jobRoute);


module.exports = app;




