// In-memory storage for the application
// NOTE: This is intentionally simple (no database) as required by the assignment.

// Seed data
const seedCoupons = require("../utils/seedCoupons.json");
const seedUsers = require("../utils/seedUsers.json");

// Coupon storage (resets every server restart)
// Start with seed coupons so the live demo has data immediately.
const coupons = Array.isArray(seedCoupons) ? [...seedCoupons] : [];

// Hardcoded demo users (required by assignment)
// `seedUsers.json` MUST contain the reviewer login user.
const demoUsers = Array.isArray(seedUsers) ? [...seedUsers] : [];

// Very lightweight, in-memory per-user coupon usage tracker:
// {
//   [userId]: { [couponCode]: numberOfTimesUsed }
// }
const couponUsageByUser = {};

module.exports = {
  coupons,
  demoUsers,
  couponUsageByUser
};
