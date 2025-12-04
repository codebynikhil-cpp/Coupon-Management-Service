const express = require("express");
const cors = require("cors");
const path = require("path");

const couponRoutes = require("./routes/coupon.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes - with error handling
try {
  app.use("/api/coupons", couponRoutes);
  app.use("/api/auth", authRoutes);
} catch (err) {
  console.error("Error loading routes:", err);
}

// Static frontend
const fs = require("fs");
// Try to locate the frontend/dist directory
const possiblePaths = [
  path.join(process.cwd(), "frontend", "dist"),
  path.join(__dirname, "..", "frontend", "dist"),
  path.join(__dirname, "frontend", "dist"),
  path.join(process.cwd(), "dist")
];

let publicDir = possiblePaths.find(p => fs.existsSync(p));

if (!publicDir) {
  console.error("CRITICAL: Frontend build directory not found!");
  console.error("Searched paths:", possiblePaths);
  console.error("Current Directory:", process.cwd());
  console.error("__dirname:", __dirname);
  // Fallback to avoid crash, but will 404
  publicDir = path.join(process.cwd(), "frontend", "dist");
} else {
  console.log("Serving frontend from:", publicDir);
}

app.use(express.static(publicDir));

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "Coupon Management Service" });
});

// Catch-all for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
