const mongoose = require("mongoose");

const shippingCitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, unique: true, lowercase: true, trim: true, select: false },
    shippingFee: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.normalizedName;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.normalizedName;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("ShippingCity", shippingCitySchema);
