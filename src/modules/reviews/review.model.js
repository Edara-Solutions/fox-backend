const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ customer: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
