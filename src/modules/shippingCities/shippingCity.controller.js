const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const ShippingCity = require("./shippingCity.model");
const service = require("./shippingCity.service");
const { paginate } = require("../../utils/pagination");

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json(new ApiResponse("Shipping city created", { city: await service.create(req.body) }));
});

exports.listAdmin = asyncHandler(async (req, res) => {
  const { documents: cities, pagination } = await paginate(ShippingCity.find().sort("name"), ShippingCity.countDocuments(), req.query);
  res.json(new ApiResponse("Shipping cities fetched", { cities, pagination }));
});

exports.listActive = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  const { documents: cities, pagination } = await paginate(ShippingCity.find(filter).sort("name"), ShippingCity.countDocuments(filter), req.query);
  res.json(new ApiResponse("Shipping cities fetched", { cities, pagination }));
});

exports.update = asyncHandler(async (req, res) => {
  res.json(new ApiResponse("Shipping city updated", { city: await service.update(req.params.id, req.body) }));
});

exports.remove = asyncHandler(async (req, res) => {
  await ShippingCity.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse("Shipping city deleted"));
});
