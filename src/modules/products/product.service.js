const Product = require("./product.model");
const Category = require("../categories/category.model");
const Brand = require("../brands/brand.model");
const ApiError = require("../../utils/ApiError");
const slugifyText = require("../../utils/slugifyText");

const ensureRefs = async ({ category, brand }) => {
  if (category && !(await Category.exists({ _id: category }))) throw new ApiError(404, "Category not found");
  if (brand && !(await Brand.exists({ _id: brand }))) throw new ApiError(404, "Brand not found");
};

exports.create = async (payload) => {
  await ensureRefs(payload);
  return Product.create({ ...payload, slug: slugifyText(payload.name) });
};

exports.update = async (id, payload) => {
  await ensureRefs(payload);
  if (payload.name) payload.slug = slugifyText(payload.name);
  return Product.findByIdAndUpdate(id, payload, { new: true });
};

exports.list = async (query) => {
  const filter = { isActive: true };
  if (query.category) filter.category = query.category;
  if (query.brand) filter.brand = query.brand;
  if (query.flavor) filter.flavors = query.flavor;
  if (query.isStack !== undefined) filter.isStack = query.isStack === "true" || query.isStack === true;
  if (query.minPrice || query.maxPrice) filter.price = {};
  if (query.minPrice) filter.price.$gte = Number(query.minPrice);
  if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  if (query.search) filter.$text ? null : (filter.name = new RegExp(query.search, "i"));

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 100);
  const sort = query.sort || "-createdAt";
  const products = await Product.find(filter).populate("brand category").sort(sort).skip((page - 1) * limit).limit(limit);
  const total = await Product.countDocuments(filter);
  return { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};
