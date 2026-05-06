const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const service = require("./inventory.service");

exports.lowStock = asyncHandler(async (req, res) => res.json(new ApiResponse("Low stock products fetched", { products: await service.lowStock(req.query.threshold) })));
exports.outOfStock = asyncHandler(async (req, res) => res.json(new ApiResponse("Out of stock products fetched", { products: await service.outOfStock() })));
exports.nearExpiry = asyncHandler(async (req, res) => res.json(new ApiResponse("Near expiry products fetched", { products: await service.nearExpiry(req.query.days) })));
exports.adjust = asyncHandler(async (req, res) => res.json(new ApiResponse("Stock adjusted", { product: await service.adjust(req.params.productId, req.body.quantity), reason: req.body.reason })));
