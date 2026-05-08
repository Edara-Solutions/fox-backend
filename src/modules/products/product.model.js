const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    shortDescription: { type: String, trim: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    images: [String],
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    flavors: [String],
    size: String,
    weight: String,
    servings: Number,
    ingredients: [String],
    nutritionFacts: { type: mongoose.Schema.Types.Mixed, default: {} },
    warnings: String,
    usageInstructions: String,
    expiryDate: Date,
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isStack: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
