const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const Coupon = require("./coupon.model");
const service = require("./coupon.service");

exports.create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse("Coupon created", { coupon: await service.createCoupon(req.body) })));
exports.list = asyncHandler(async (req, res) => res.json(new ApiResponse("Coupons fetched", await service.listCoupons(req.query))));
exports.get = asyncHandler(async (req, res) => res.json(new ApiResponse("Coupon fetched", { coupon: await service.getCoupon(req.params.id) })));
exports.getMine = asyncHandler(async (req, res) => res.json(new ApiResponse("Coupons fetched", await service.getMyCoupons(req.user._id, req.query))));
exports.update = asyncHandler(async (req, res) => {
  res.json(new ApiResponse("Coupon updated", { coupon: await service.updateCoupon(req.params.id, req.body) }));
});
exports.remove = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse("Coupon deleted"));
});
exports.validateCoupon = asyncHandler(async (req, res) => res.json(new ApiResponse("Coupon validated", await service.validateCoupon(req.body))));
