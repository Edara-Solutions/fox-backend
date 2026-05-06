const Coupon = require("./coupon.model");
const ApiError = require("../../utils/ApiError");

const calculateDiscount = (coupon, orderTotal) => {
  if (coupon.type === "free_shipping") return 0;
  const raw = coupon.type === "percentage" ? (orderTotal * coupon.value) / 100 : coupon.value;
  return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
};

exports.validateCoupon = async ({ code, orderTotal }) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, "Coupon not found");
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw new ApiError(400, "Coupon is not active yet");
  if (coupon.expiresAt && coupon.expiresAt < now) throw new ApiError(400, "Coupon has expired");
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new ApiError(400, "Coupon usage limit reached");
  if (orderTotal < coupon.minOrderAmount) throw new ApiError(400, "Order total is below coupon minimum");
  return { coupon, discount: calculateDiscount(coupon, orderTotal), freeShipping: coupon.type === "free_shipping" };
};
