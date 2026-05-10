const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const service = require("./dashboard.service");

exports.overview = asyncHandler(async (req, res) => {
  res.json(new ApiResponse("Dashboard overview fetched", { overview: await service.getOverview() }));
});

exports.revenue = asyncHandler(async (req, res) => {
  res.json(new ApiResponse("Dashboard revenue fetched", { revenue: await service.getRevenueByPeriod(req.query.period) }));
});

exports.bestSellingProducts = asyncHandler(async (req, res) => {
  res.json(new ApiResponse("Best selling products fetched", { products: await service.getBestSellingProducts(req.query.limit) }));
});
