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
  const filePath = path.join(publicDir, "app.html");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error serving app.html:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

module.exports = app;
