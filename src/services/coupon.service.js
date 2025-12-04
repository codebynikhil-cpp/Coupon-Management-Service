const { coupons, couponUsageByUser, couponStats } = require("../models/memoryStore");
const { isEligible } = require("./eligibility.service");
const { calculateDiscount } = require("./discount.service");

// Add coupon to in-memory store
exports.addCoupon = (couponData) => {
  // Check duplicate code
  if (coupons.some(c => c.code === couponData.code)) {
    throw new Error("Coupon code already exists");
  }

  // Push new coupon with defaults
  const newCoupon = {
    ...couponData,
    isActive: true,
    deletedAt: null
  };
  coupons.push(newCoupon);
  return newCoupon;
};

// Get all coupons (with filtering)
exports.listCoupons = (filters = {}) => {
  let result = coupons;

  // Filter by status (default: active)
  if (filters.status === "inactive") {
    result = result.filter(c => !c.isActive);
  } else if (filters.status === "all") {
    // no filter
  } else {
    // default active
    result = result.filter(c => c.isActive !== false);
  }

  // Filter by validity date
  if (filters.validOn) {
    const date = new Date(filters.validOn);
    if (!isNaN(date.getTime())) {
      result = result.filter(c => {
        const start = new Date(c.startDate);
        const end = new Date(c.endDate);
        return date >= start && date <= end;
      });
    }
  }

  // Metadata filters (simple check)
  if (filters.userTier) {
    result = result.filter(c =>
      !c.eligibility?.allowedUserTiers ||
      c.eligibility.allowedUserTiers.includes(filters.userTier)
    );
  }

  if (filters.category) {
    result = result.filter(c =>
      !c.eligibility?.applicableCategories ||
      c.eligibility.applicableCategories.includes(filters.category)
    );
  }

  return result;
};

// Get single coupon
exports.getCoupon = (code) => {
  return coupons.find(c => c.code === code);
};

// Update coupon
exports.updateCoupon = (code, updates) => {
  const index = coupons.findIndex(c => c.code === code);
  if (index === -1) return null;

  // Prevent code update
  delete updates.code;

  coupons[index] = { ...coupons[index], ...updates };
  return coupons[index];
};

// Delete coupon (soft)
exports.deleteCoupon = (code) => {
  const index = coupons.findIndex(c => c.code === code);
  if (index === -1) return null;

  coupons[index].isActive = false;
  coupons[index].deletedAt = new Date().toISOString();
  return coupons[index];
};

// Utility: how many times a given user has used a specific coupon
const getUsageCount = (userId, couponCode, userInputUsageMap) => {
  if (userInputUsageMap && typeof userInputUsageMap[couponCode] === "number") {
    return userInputUsageMap[couponCode];
  }
  const byUser = couponUsageByUser[userId] || {};
  return byUser[couponCode] || 0;
};

// Evaluate a single coupon
exports.evaluateCoupon = (coupon, user, cart, now = new Date()) => {
  const reasons = [];
  const breakdown = {
    isActive: true,
    dateValid: true,
    usageLimit: true,
    userTier: true,
    minSpend: true,
    minOrders: true,
    firstOrder: true,
    country: true,
    minCartValue: true,
    category: true,
    minItems: true
  };

  // 0) Check active status
  if (coupon.isActive === false) {
    reasons.push("COUPON_INACTIVE");
    breakdown.isActive = false;
  }

  // 1) Check date validity
  const start = new Date(coupon.startDate);
  const end = new Date(coupon.endDate);
  if (now < start || now > end) {
    reasons.push("DATE_INVALID");
    breakdown.dateValid = false;
  }

  // 2) Respect per-user usage limit
  if (coupon.usageLimitPerUser) {
    const usedCount = getUsageCount(user.userId, coupon.code, user.couponUsage);
    if (usedCount >= coupon.usageLimitPerUser) {
      reasons.push("USAGE_LIMIT_EXCEEDED");
      breakdown.usageLimit = false;
    }
  }

  // 3) Check eligibility rules (Detailed Breakdown)
  const rules = coupon.eligibility || {};
  const cartValue = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartCategories = cart.items.map((i) => i.category);
  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  // User Tier
  if (rules.allowedUserTiers && !rules.allowedUserTiers.includes(user.userTier)) {
    reasons.push("USER_TIER_NOT_ALLOWED");
    breakdown.userTier = false;
  }

  // Min Lifetime Spend
  if (rules.minLifetimeSpend && user.lifetimeSpend < rules.minLifetimeSpend) {
    reasons.push("MIN_LIFETIME_SPEND_NOT_MET");
    breakdown.minSpend = false;
  }

  // Min Orders Placed
  if (rules.minOrdersPlaced && user.ordersPlaced < rules.minOrdersPlaced) {
    reasons.push("MIN_ORDERS_NOT_MET");
    breakdown.minOrders = false;
  }

  // First Order Only
  if (rules.firstOrderOnly && user.ordersPlaced !== 0) {
    reasons.push("NOT_FIRST_ORDER");
    breakdown.firstOrder = false;
  }

  // Allowed Countries
  if (rules.allowedCountries && !rules.allowedCountries.includes(user.country)) {
    reasons.push("COUNTRY_NOT_ALLOWED");
    breakdown.country = false;
  }

  // Min Cart Value
  if (rules.minCartValue && cartValue < rules.minCartValue) {
    reasons.push("MIN_CART_VALUE_NOT_MET");
    breakdown.minCartValue = false;
  }

  // Categories
  if (rules.applicableCategories) {
    const match = cartCategories.some((cat) => rules.applicableCategories.includes(cat));
    if (!match) {
      reasons.push("CATEGORY_NOT_APPLICABLE");
      breakdown.category = false;
    }
  }
  if (rules.excludedCategories) {
    const bad = cartCategories.some((cat) => rules.excludedCategories.includes(cat));
    if (bad) {
      reasons.push("CATEGORY_EXCLUDED");
      breakdown.category = false;
    }
  }

  // Min Items
  if (rules.minItemsCount && totalItems < rules.minItemsCount) {
    reasons.push("MIN_ITEMS_NOT_MET");
    breakdown.minItems = false;
  }

  const isEligible = reasons.length === 0;
  let discount = 0;

  if (isEligible) {
    discount = calculateDiscount(coupon, cart);
    if (discount <= 0) {
      reasons.push("NO_DISCOUNT_APPLICABLE");
      // Not technically an eligibility rule failure, but a calculation result
    }
  }

  return { isEligible, reasons, discount, breakdown };
};

// Best coupon evaluation
exports.findBestCoupon = (user, cart, now = new Date()) => {
  let best = null;

  // Only check active coupons
  const activeCoupons = coupons.filter(c => c.isActive !== false);

  for (const coupon of activeCoupons) {
    const { isEligible, discount } = exports.evaluateCoupon(coupon, user, cart, now);

    if (!isEligible) continue;

    // Select best coupon
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

  // Update stats if a coupon was found (Simulating application)
  if (best && best.coupon) {
    const code = best.coupon.code;
    if (!couponStats[code]) {
      couponStats[code] = { totalRedemptions: 0, uniqueUsers: new Set() };
    }
    couponStats[code].totalRedemptions += 1;
    if (user.userId) {
      couponStats[code].uniqueUsers.add(user.userId);
    }
  }

  return best || { coupon: null, discount: 0 };
};

// Get stats
exports.getCouponStats = (code) => {
  const stats = couponStats[code] || { totalRedemptions: 0, uniqueUsers: new Set() };
  return {
    code,
    totalRedemptions: stats.totalRedemptions,
    uniqueUsers: stats.uniqueUsers.size
  };
};
