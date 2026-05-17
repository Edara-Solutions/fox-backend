const Product = require("./product.model");
const Category = require("../categories/category.model");
const Brand = require("../brands/brand.model");
const ApiError = require("../../utils/ApiError");
const slugifyText = require("../../utils/slugifyText");
const { paginationOptions } = require("../../utils/pagination");

const ensureRefs = async ({ category, brand }) => {
  if (category && !(await Category.exists({ _id: category }))) throw new ApiError(404, "Category not found");
  if (brand && !(await Brand.exists({ _id: brand }))) throw new ApiError(404, "Brand not found");
};

const normalizeStringArray = (value) => {
  if (value === undefined) return value;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return [value];
    }
  }

  return [value];
};

const normalizeProductPayload = (payload) => ({
  ...payload,
  ...(payload.warnings !== undefined ? { warnings: normalizeStringArray(payload.warnings) } : {}),
  ...(payload.usageInstructions !== undefined ? { usageInstructions: normalizeStringArray(payload.usageInstructions) } : {}),
});

exports.create = async (payload) => {
  await ensureRefs(payload);
  return Product.create({ ...normalizeProductPayload(payload), slug: slugifyText(payload.name) });
};

exports.update = async (id, payload) => {
  await ensureRefs(payload);
  const normalizedPayload = normalizeProductPayload(payload);
  if (normalizedPayload.name) normalizedPayload.slug = slugifyText(normalizedPayload.name);
  return Product.findByIdAndUpdate(id, normalizedPayload, { new: true });
};

exports.list = async (query, options = {}) => {
  const filter = {};
  if (options.includeInactive) {
    if (query.isActive !== undefined) filter.isActive = query.isActive === "true" || query.isActive === true;
  } else {
    filter.isActive = true;
  }
  if (query.category) filter.category = query.category;
  if (query.brand) filter.brand = query.brand;
  if (query.flavor) filter.flavors = query.flavor;
  if (query.isStack !== undefined) filter.isStack = query.isStack === "true" || query.isStack === true;
  if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured === "true" || query.isFeatured === true;
  if (query.minPrice || query.maxPrice) filter.price = {};
  if (query.minPrice) filter.price.$gte = Number(query.minPrice);
  if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  if (query.search) filter.$text ? null : (filter.name = new RegExp(query.search, "i"));

  const { page, limit, skip } = paginationOptions(query);
  const sort = query.sort || "-createdAt";
  const products = await Product.find(filter).populate("brand category").sort(sort).skip(skip).limit(limit);
  const total = await Product.countDocuments(filter);
  return { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};
