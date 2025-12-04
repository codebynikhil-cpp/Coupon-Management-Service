// In-memory storage for the application
// NOTE: This is intentionally simple (no database) as required by the assignment.

// Seed data
const seedCoupons = require("../utils/seedCoupons.json");
const seedUsers = require("../utils/seedUsers.json");

// Coupon storage (resets every server restart)
// Start with seed coupons so the live demo has data immediately.
// Enhance seed coupons with default active status
const coupons = (Array.isArray(seedCoupons) ? [...seedCoupons] : []).map(c => ({
  ...c,
  isActive: true,
  deletedAt: null
}));

// Hardcoded demo users (required by assignment)
// `seedUsers.json` MUST contain the reviewer login user.
const demoUsers = Array.isArray(seedUsers) ? [...seedUsers] : [];

// Very lightweight, in-memory per-user coupon usage tracker:
// {
//   [userId]: { [couponCode]: numberOfTimesUsed }
// }
const couponUsageByUser = {};

// Global usage stats
// { [couponCode]: { totalRedemptions: number, uniqueUsers: Set<string> } }
const couponStats = {};

module.exports = {
  coupons,
  demoUsers,
  couponUsageByUser,
  couponStats
};
