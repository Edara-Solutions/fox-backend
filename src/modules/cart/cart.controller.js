const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const Cart = require("./cart.model");
const service = require("./cart.service");

exports.get = asyncHandler(async (req, res) => res.json(new ApiResponse("Cart fetched", { cart: await service.getOrCreateCart(req.customer._id) })));
exports.addItem = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse("Cart item added", { cart: await service.addItem(req.customer._id, req.body) })));
exports.updateItem = asyncHandler(async (req, res) => res.json(new ApiResponse("Cart item updated", { cart: await service.updateItem(req.customer._id, req.params.itemId, req.body.quantity) })));
exports.removeItem = asyncHandler(async (req, res) => res.json(new ApiResponse("Cart item removed", { cart: await service.removeItem(req.customer._id, req.params.itemId) })));
exports.clear = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ customer: req.customer._id }, { items: [], subtotal: 0, totalItems: 0 }, { upsert: true });
  res.json(new ApiResponse("Cart cleared"));
});
