const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: String,
    price: { type: Number, required: true },
    discountPrice: Number,
    selectedFlavor: String,
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, unique: true },
    items: [cartItemSchema],
    subtotal: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cartSchema.methods.recalculate = function recalculate() {
  this.subtotal = this.items.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
};

module.exports = mongoose.model("Cart", cartSchema);
