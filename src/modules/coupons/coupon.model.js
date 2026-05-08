const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed", "free_shipping"], required: true },
    value: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number,
    startsAt: Date,
    expiresAt: Date,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
