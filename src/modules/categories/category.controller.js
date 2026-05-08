const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const Category = require("./category.model");
const service = require("./category.service");
const { uploadBufferToCloudinary } = require("../../config/cloudinary");
const { paginate } = require("../../utils/pagination");

const imageUrl = async (file) => file && ((await uploadBufferToCloudinary(file.buffer, "supplements/categories"))?.secure_url || undefined);

exports.create = asyncHandler(async (req, res) => {
  const image = await imageUrl(req.file);
  res.status(201).json(new ApiResponse("Category created", { category: await service.create({ ...req.body, image: image || req.body.image }) }));
});
exports.list = asyncHandler(async (req, res) => {
  const { documents: categories, pagination } = await paginate(Category.find({ isActive: true }).sort("name"), Category.countDocuments({ isActive: true }), req.query);
  res.json(new ApiResponse("Categories fetched", { categories, pagination }));
});
exports.getBySlug = asyncHandler(async (req, res) => res.json(new ApiResponse("Category fetched", { category: await Category.findOne({ slug: req.params.slug, isActive: true }) })));
exports.update = asyncHandler(async (req, res) => {
  const image = await imageUrl(req.file);
  res.json(new ApiResponse("Category updated", { category: await service.update(req.params.id, { ...req.body, ...(image ? { image } : {}) }) }));
});
exports.remove = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse("Category deleted"));
});
