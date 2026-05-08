const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const service = require("./inventory.service");

exports.lowStock = asyncHandler(async (req, res) => res.json(new ApiResponse("Low stock products fetched", await service.lowStock(req.query.threshold, req.query))));
exports.outOfStock = asyncHandler(async (req, res) => res.json(new ApiResponse("Out of stock products fetched", await service.outOfStock(req.query))));
exports.nearExpiry = asyncHandler(async (req, res) => res.json(new ApiResponse("Near expiry products fetched", await service.nearExpiry(req.query.days, req.query))));
exports.adjust = asyncHandler(async (req, res) => res.json(new ApiResponse("Stock adjusted", { product: await service.adjust(req.params.productId, req.body.quantity), reason: req.body.reason })));
