const assert = require("assert");

const { findBestCoupon } = require("../src/services/coupon.service");
const { coupons } = require("../src/models/memoryStore");

// Very small, illustrative test suite using Node's built-in assert.

const demoUser = {
  userId: "u123",
  userTier: "NEW",
  country: "IN",
  lifetimeSpend: 0,
  ordersPlaced: 0
};

const demoCart = {
  items: [
    { productId: "p1", category: "electronics", unitPrice: 1500, quantity: 1 },
    { productId: "p2", category: "fashion", unitPrice: 500, quantity: 2 }
  ]
};

function runTests() {
  console.log("Running coupon tests...");

  assert.ok(Array.isArray(coupons), "Coupons should be an array");
  assert.ok(coupons.length > 0, "Seed coupons should be loaded");

  const best = findBestCoupon(demoUser, demoCart);

  assert.ok(best, "findBestCoupon should return a result object");
  assert.ok(
    best.coupon === null || typeof best.coupon.code === "string",
    "best.coupon should be null or a coupon object"
  );

  console.log("All coupon tests passed.");
}

runTests();


