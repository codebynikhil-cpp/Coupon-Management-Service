// Check if coupon is eligible for a given user + cart
exports.isEligible = (coupon, user, cart) => {
  const rules = coupon.eligibility || {};

  const cartValue = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const cartCategories = cart.items.map((i) => i.category);
  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  // USER-BASED RULES
  if (rules.allowedUserTiers && !rules.allowedUserTiers.includes(user.userTier)) {
    return false;
  }

  if (rules.allowedCountries && !rules.allowedCountries.includes(user.country)) {
    return false;
  }

  if (rules.minLifetimeSpend && user.lifetimeSpend < rules.minLifetimeSpend) {
    return false;
  }

  if (rules.minOrdersPlaced && user.ordersPlaced < rules.minOrdersPlaced) {
    return false;
  }

  if (rules.firstOrderOnly && user.ordersPlaced !== 0) {
    return false;
  }

  // CART-BASED RULES
  if (rules.minCartValue && cartValue < rules.minCartValue) {
    return false;
  }

  if (rules.applicableCategories) {
    const match = cartCategories.some((cat) =>
      rules.applicableCategories.includes(cat)
    );
    if (!match) return false;
  }

  if (rules.excludedCategories) {
    const bad = cartCategories.some((cat) =>
      rules.excludedCategories.includes(cat)
    );
    if (bad) return false;
  }

  if (rules.minItemsCount && totalItems < rules.minItemsCount) {
    return false;
  }

  return true;
};
