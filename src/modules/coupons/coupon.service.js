const Coupon = require("./coupon.model");
const User = require("../users/user.model");
const ApiError = require("../../utils/ApiError");

const VENDOR_FIELDS = "name email role";

const ensureActiveVendor = async (vendorId) => {
  const vendor = await User.findOne({ _id: vendorId, isActive: true });
  if (!vendor) throw new ApiError(400, "Vendor must be an active user");
};

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

exports.createCoupon = async (payload) => {
  if (payload.vendor) await ensureActiveVendor(payload.vendor);
  return Coupon.create({ ...payload, code: payload.code.toUpperCase() });
};

exports.listCoupons = async () => Coupon.find().populate("vendor", VENDOR_FIELDS).sort("-createdAt");

exports.getCoupon = async (id) => Coupon.findById(id).populate("vendor", VENDOR_FIELDS);

exports.getMyCoupons = async (vendorId) => Coupon.find({vendor: vendorId}).populate("vendor", VENDOR_FIELDS);

exports.incrementCouponUsage = async (couponId) => Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });

exports.updateCoupon = async (id, payload) => {
  if (payload.vendor) await ensureActiveVendor(payload.vendor);
  if (payload.code) payload.code = payload.code.toUpperCase();
  return Coupon.findByIdAndUpdate(id, payload, { new: true }).populate("vendor", VENDOR_FIELDS);
};
