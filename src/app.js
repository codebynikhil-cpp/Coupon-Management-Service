const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const couponRoutes = require("./routes/coupon.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const publicDir = path.join(__dirname, "../public");

console.log("Public directory path:", publicDir);
console.log("Directory exists:", fs.existsSync(publicDir));

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
app.use(express.static(publicDir));

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "Coupon Management Service" });
});

// Catch-all for SPA
app.get("*", (req, res) => {
  const filePath = path.join(publicDir, "app.html");
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.warn("app.html not found at:", filePath);
    res.status(404).json({ error: "Frontend not found" });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
