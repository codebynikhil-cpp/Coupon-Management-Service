const express = require("express");
const cors = require("cors");
const path = require("path");

const couponRoutes = require("./routes/coupon.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/coupons", couponRoutes);
app.use("/api/auth", authRoutes);

// Static frontend
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "Coupon Management Service" });
});

module.exports = app;
