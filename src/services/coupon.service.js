const { coupons, couponUsageByUser } = require("../models/memoryStore");
const { isEligible } = require("./eligibility.service");
const { calculateDiscount } = require("./discount.service");

// Add coupon to in-memory store
exports.addCoupon = (couponData) => {
  // Check duplicate code
  if (coupons.some(c => c.code === couponData.code)) {
    throw new Error("Coupon code already exists");
  }

  // Push new coupon
  coupons.push(couponData);
  return couponData;
};

// Get all coupons
exports.listCoupons = () => {
  return coupons;
};

// Utility: how many times a given user has used a specific coupon
const getUsageCount = (userId, couponCode, userInputUsageMap) => {
  // If caller passes explicit simulated usage in the user payload, prefer that.
  if (userInputUsageMap && typeof userInputUsageMap[couponCode] === "number") {
    return userInputUsageMap[couponCode];
  }

  // Otherwise, fall back to in-memory tracker (used if you extend the API to "apply" coupons)
  const byUser = couponUsageByUser[userId] || {};
  return byUser[couponCode] || 0;
};

// Best coupon evaluation
// `user` may optionally contain a `couponUsage` map,
// e.g. { "WELCOME100": 1 }, which is useful for simulating history.
exports.findBestCoupon = (user, cart) => {
  const now = new Date();

  let best = null;

  for (const coupon of coupons) {
    // 1) Check date validity
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.endDate);

    if (now < start || now > end) continue;

    // 2) Respect per-user usage limit (if specified)
    if (coupon.usageLimitPerUser) {
      const usedCount = getUsageCount(
        user.userId,
        coupon.code,
        user.couponUsage
      );
      if (usedCount >= coupon.usageLimitPerUser) {
        continue;
      }
    }

    // 3) Check eligibility rules
    if (!isEligible(coupon, user, cart)) continue;

    // 4) Compute discount
    const discount = calculateDiscount(coupon, cart);

    if (discount <= 0) continue;

    // 5) Select best coupon
    if (!best) {
      best = { coupon, discount };
    } else {
      if (discount > best.discount) {
        best = { coupon, discount };
      } else if (discount === best.discount) {
        // tie breaker 1 → earliest endDate
        const bestEnd = new Date(best.coupon.endDate);
        const currentEnd = new Date(coupon.endDate);

        if (currentEnd < bestEnd) {
          best = { coupon, discount };
        }
        // tie breaker 2 → lexicographically smaller code
        else if (
          currentEnd.getTime() === bestEnd.getTime() &&
          coupon.code < best.coupon.code
        ) {
          best = { coupon, discount };
        }
      }
    }
  }

  return best || { coupon: null, discount: 0 };
};
