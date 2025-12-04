const express = require("express");
const cors = require("cors");
const path = require("path");

const couponRoutes = require("./routes/coupon.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// Define public directory path
const publicDir = path.join(__dirname, "../public");

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/coupons", couponRoutes);
app.use("/api/auth", authRoutes);

// Static frontend
app.use(express.static(publicDir));

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "Coupon Management Service" });
});

// Catch-all for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "app.html"));
});

module.exports = app;
