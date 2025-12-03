const express = require("express");
const router = express.Router();

const {
  createCoupon,
  getAllCoupons,
  getBestCoupon
} = require("../controllers/coupon.controller");

// POST /api/coupons/create
router.post("/create", createCoupon);

// GET /api/coupons
router.get("/", getAllCoupons);

// POST /api/coupons/best
router.post("/best", getBestCoupon);

module.exports = router;
