const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const Coupon = require("./coupon.model");
const service = require("./coupon.service");

exports.create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse("Coupon created", { coupon: await Coupon.create({ ...req.body, code: req.body.code.toUpperCase() }) })));
exports.list = asyncHandler(async (req, res) => res.json(new ApiResponse("Coupons fetched", { coupons: await Coupon.find().sort("-createdAt") })));
exports.get = asyncHandler(async (req, res) => res.json(new ApiResponse("Coupon fetched", { coupon: await Coupon.findById(req.params.id) })));
exports.update = asyncHandler(async (req, res) => {
  if (req.body.code) req.body.code = req.body.code.toUpperCase();
  res.json(new ApiResponse("Coupon updated", { coupon: await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true }) }));
});
exports.remove = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse("Coupon deleted"));
});
exports.validateCoupon = asyncHandler(async (req, res) => res.json(new ApiResponse("Coupon validated", await service.validateCoupon(req.body))));
