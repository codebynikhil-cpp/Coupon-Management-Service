const {
  addCoupon,
  listCoupons,
  findBestCoupon
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
  const coupons = listCoupons();
  return res.json({ coupons });
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