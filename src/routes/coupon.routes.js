const express = require("express");
const router = express.Router();
const { validateCoupon } = require("../middleware/validateRequest");

const {
  createCoupon,
  getAllCoupons,
  getBestCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  validateCouponEligibility,
  getStats
} = require("../controllers/coupon.controller");

// POST /api/coupons/create
router.post("/create", validateCoupon, createCoupon);

// GET /api/coupons (with filters)
router.get("/", getAllCoupons);

// GET /api/coupons/:code
router.get("/:code", getCoupon);

// PUT /api/coupons/:code
router.put("/:code", validateCoupon, updateCoupon);

// DELETE /api/coupons/:code
router.delete("/:code", deleteCoupon);

// POST /api/coupons/:code/validate
router.post("/:code/validate", validateCouponEligibility);

// GET /api/coupons/:code/stats
router.get("/:code/stats", getStats);

// POST /api/coupons/best
router.post("/best", getBestCoupon);

module.exports = router;
