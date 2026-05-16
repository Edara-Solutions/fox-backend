const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const Product = require("./product.model");
const service = require("./product.service");
const { uploadBufferToCloudinary } = require("../../config/cloudinary");

const imageUrls = async (files = []) => {
  const uploaded = await Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer, "supplements/products")));
  return uploaded.filter(Boolean).map((item) => item.secure_url);
};

exports.create = asyncHandler(async (req, res) => {
  const images = await imageUrls(req.files);
  res.status(201).json(new ApiResponse("Product created", { product: await service.create({ ...req.body, ...(images.length ? { images } : {}) }) }));
});
exports.list = asyncHandler(async (req, res) => res.json(new ApiResponse("Products fetched", await service.list(req.query))));
exports.listAdmin = asyncHandler(async (req, res) => res.json(new ApiResponse("Products fetched", await service.list(req.query, { includeInactive: true }))));
exports.getBySlug = asyncHandler(async (req, res) => res.json(new ApiResponse("Product fetched", { product: await Product.findOne({ slug: req.params.slug, isActive: true }).populate("brand category") })));
exports.update = asyncHandler(async (req, res) => {
  const images = await imageUrls(req.files);
  res.json(new ApiResponse("Product updated", { product: await service.update(req.params.id, { ...req.body, ...(images.length ? { images } : {}) }) }));
});
exports.remove = asyncHandler(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse("Product deleted"));
});
exports.updateStock = asyncHandler(async (req, res) => res.json(new ApiResponse("Stock updated", { product: await Product.findByIdAndUpdate(req.params.id, { stock: req.body.stock }, { new: true }) })));
