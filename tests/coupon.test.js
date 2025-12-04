const assert = require("assert");
const { findBestCoupon, addCoupon, deleteCoupon, listCoupons, evaluateCoupon } = require("../src/services/coupon.service");
const { coupons, couponStats } = require("../src/models/memoryStore");

// Helper to reset coupons array
function resetCoupons() {
  coupons.length = 0;
  // Reset stats logic if exposed, but for now we just clear coupons
}

// Helper to create a dummy coupon
function createCoupon(overrides = {}) {
  return {
    code: "TEST" + Math.random().toString(36).substring(7),
    description: "Test Coupon",
    discountType: "FLAT",
    discountValue: 100,
    startDate: "2020-01-01T00:00:00.000Z",
    endDate: "2099-12-31T23:59:59.000Z",
    eligibility: {},
    ...overrides
  };
}

// Helper to create a dummy user
function createUser(overrides = {}) {
  return {
    userId: "u1",
    userTier: "REGULAR",
    country: "IN",
    lifetimeSpend: 1000,
    ordersPlaced: 5,
    couponUsage: {},
    ...overrides
  };
}

// Helper to create a dummy cart
function createCart(amount = 1000) {
  return {
    items: [
      { productId: "p1", category: "general", unitPrice: amount, quantity: 1 }
    ]
  };
}

function runTests() {
  console.log("Running comprehensive coupon tests...");

  // 1. Basic Eligibility
  {
    resetCoupons();
    const c1 = createCoupon({
      code: "TIER_FAIL",
      eligibility: { allowedUserTiers: ["GOLD"] }
    });
    addCoupon(c1);
    const user = createUser({ userTier: "REGULAR" });
    const cart = createCart(1000);
    const result = findBestCoupon(user, cart);
    assert.notStrictEqual(result.coupon?.code, "TIER_FAIL", "Should fail if user tier does not match");
  }

  // 2. Soft Delete
  {
    resetCoupons();
    const cDel = createCoupon({ code: "DELETED_COUPON" });
    addCoupon(cDel);

    // Verify it exists
    assert.strictEqual(listCoupons().length, 1);

    // Soft delete
    deleteCoupon("DELETED_COUPON");

    // Verify listCoupons filters it out by default
    assert.strictEqual(listCoupons().length, 0);

    // Verify findBestCoupon ignores it
    const user = createUser();
    const cart = createCart(1000);
    const result = findBestCoupon(user, cart);
    assert.strictEqual(result.coupon, null, "Should not return deleted coupon");
  }

  // 3. Advanced Filtering
  {
    resetCoupons();
    const cActive = createCoupon({ code: "ACTIVE" });
    const cInactive = createCoupon({ code: "INACTIVE" });
    addCoupon(cActive);
    addCoupon(cInactive);
    deleteCoupon("INACTIVE");

    const all = listCoupons({ status: "all" });
    assert.strictEqual(all.length, 2, "Should return all coupons with status=all");

    const inactive = listCoupons({ status: "inactive" });
    assert.strictEqual(inactive.length, 1, "Should return only inactive coupons");
    assert.strictEqual(inactive[0].code, "INACTIVE");
  }

  // 4. Evaluate Coupon (Debug API Logic)
  {
    resetCoupons();
    const cDebug = createCoupon({
      code: "DEBUG_ME",
      eligibility: { minCartValue: 5000 }
    });
    addCoupon(cDebug);

    const user = createUser();
    const cart = createCart(1000); // Too low

    const result = evaluateCoupon(cDebug, user, cart);
    assert.strictEqual(result.isEligible, false);
    assert.ok(result.reasons.includes("ELIGIBILITY_RULES_FAILED"), "Should return failure reason");
  }

  // 5. Tie Breaking (Existing tests adapted)
  {
    resetCoupons();
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(now); dayAfter.setDate(dayAfter.getDate() + 2);

    const cEarly = createCoupon({
      code: "TIE_EARLY",
      discountType: "FLAT",
      discountValue: 5000,
      endDate: tomorrow.toISOString()
    });
    const cLate = createCoupon({
      code: "TIE_LATE",
      discountType: "FLAT",
      discountValue: 5000,
      endDate: dayAfter.toISOString()
    });

    addCoupon(cLate);
    addCoupon(cEarly);

    const user = createUser();
    const cart = createCart(10000);
    const result = findBestCoupon(user, cart);

    assert.strictEqual(result.coupon.code, "TIE_EARLY", "Should pick earliest end date on tie");
  }

  console.log("All comprehensive tests passed!");
}

try {
  runTests();
} catch (e) {
  console.error("Test Failed:", e.message);
  process.exit(1);
}
