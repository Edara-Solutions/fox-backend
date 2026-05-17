const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const Brand = require("./brand.model");
const service = require("./brand.service");
const { uploadBufferToCloudinary } = require("../../config/cloudinary");
const { paginate } = require("../../utils/pagination");

const logoUrl = async (file) => file && ((await uploadBufferToCloudinary(file.buffer, "supplements/brands"))?.secure_url || undefined);
const adminFilter = (query) => (query.isActive === undefined ? {} : { isActive: query.isActive === "true" || query.isActive === true });

exports.create = asyncHandler(async (req, res) => {
  const logo = await logoUrl(req.file);
  res.status(201).json(new ApiResponse("Brand created", { brand: await service.create({ ...req.body, logo: logo || req.body.logo }) }));
});
exports.list = asyncHandler(async (req, res) => {
  const { documents: brands, pagination } = await paginate(Brand.find({ isActive: true }).sort("name"), Brand.countDocuments({ isActive: true }), req.query);
  res.json(new ApiResponse("Brands fetched", { brands, pagination }));
});
exports.listAdmin = asyncHandler(async (req, res) => {
  const filter = adminFilter(req.query);
  const { documents: brands, pagination } = await paginate(Brand.find(filter).sort("name"), Brand.countDocuments(filter), req.query);
  res.json(new ApiResponse("Brands fetched", { brands, pagination }));
});
exports.getBySlug = asyncHandler(async (req, res) => res.json(new ApiResponse("Brand fetched", { brand: await Brand.findOne({ slug: req.params.slug, isActive: true }) })));
exports.update = asyncHandler(async (req, res) => {
  const logo = await logoUrl(req.file);
  res.json(new ApiResponse("Brand updated", { brand: await service.update(req.params.id, { ...req.body, ...(logo ? { logo } : {}) }) }));
});
exports.remove = asyncHandler(async (req, res) => {
  await Brand.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse("Brand deleted"));
});
