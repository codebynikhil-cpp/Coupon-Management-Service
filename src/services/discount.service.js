// Calculate discount amount for an eligible coupon and cart
exports.calculateDiscount = (coupon, cart) => {
  const cartValue = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  let discount = 0;

  if (coupon.discountType === "FLAT") {
    discount = coupon.discountValue;
  } else if (coupon.discountType === "PERCENT") {
    discount = (cartValue * coupon.discountValue) / 100;

    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  }

  // No negative discounts allowed
  return Math.max(0, discount);
};
