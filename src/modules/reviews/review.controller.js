const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const Review = require("./review.model");
const service = require("./review.service");

exports.create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse("Review created", { review: await service.create(req.customer._id, req.params.productId, req.body) })));
exports.listByProduct = asyncHandler(async (req, res) => res.json(new ApiResponse("Reviews fetched", { reviews: await Review.find({ product: req.params.productId, isApproved: true }).populate("customer", "fullName").sort("-createdAt") })));
exports.updateMine = asyncHandler(async (req, res) => res.json(new ApiResponse("Review updated", { review: await service.update(req.customer._id, req.params.id, req.body) })));
exports.deleteMine = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.customer._id);
  res.json(new ApiResponse("Review deleted"));
});
exports.deleteAdmin = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.json(new ApiResponse("Review deleted"));
});
