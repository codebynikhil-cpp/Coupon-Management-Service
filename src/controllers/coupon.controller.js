const {
  addCoupon,
  listCoupons,
  findBestCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  evaluateCoupon,
  getCouponStats
} = require("../services/coupon.service");

// POST /api/coupons/create
exports.createCoupon = (req, res) => {
  try {
    const coupon = addCoupon(req.body);
    return res.status(201).json({ message: "Coupon created", coupon });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// GET /api/coupons
exports.getAllCoupons = (req, res) => {
  const filters = {
    status: req.query.status,
    validOn: req.query.validOn,
    userTier: req.query.userTier,
    category: req.query.category
  };
  const coupons = listCoupons(filters);
  return res.json({ coupons });
};

// GET /api/coupons/:code
exports.getCoupon = (req, res) => {
  const coupon = getCoupon(req.params.code);
  if (!coupon) {
    return res.status(404).json({ error: "Coupon not found" });
  }
  return res.json(coupon);
};

// PUT /api/coupons/:code
exports.updateCoupon = (req, res) => {
  const updated = updateCoupon(req.params.code, req.body);
  if (!updated) {
    return res.status(404).json({ error: "Coupon not found" });
  }
  return res.json({ message: "Coupon updated", coupon: updated });
};

// DELETE /api/coupons/:code
exports.deleteCoupon = (req, res) => {
  const deleted = deleteCoupon(req.params.code);
  if (!deleted) {
    return res.status(404).json({ error: "Coupon not found" });
  }
  return res.json({ message: "Coupon deleted (soft)", coupon: deleted });
};

// POST /api/coupons/:code/validate
exports.validateCouponEligibility = (req, res) => {
  const coupon = getCoupon(req.params.code);
  if (!coupon) {
    return res.status(404).json({ error: "Coupon not found" });
  }

  const { user, cart } = req.body;
  if (!user || !cart) {
    return res.status(400).json({ error: "User and Cart are required" });
  }

  const result = evaluateCoupon(coupon, user, cart);
  return res.json(result);
};

// GET /api/coupons/:code/stats
exports.getStats = (req, res) => {
  const stats = getCouponStats(req.params.code);
  return res.json(stats);
};

// POST /api/coupons/best
exports.getBestCoupon = (req, res) => {
  try {
    const { user, cart } = req.body;
    const result = findBestCoupon(user, cart);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};