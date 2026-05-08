const Product = require("../products/product.model");
const ApiError = require("../../utils/ApiError");
const { paginate } = require("../../utils/pagination");

exports.lowStock = async (threshold = 5, query) => {
  const filter = { stock: { $gt: 0, $lte: threshold } };
  const { documents: products, pagination } = await paginate(Product.find(filter).sort("stock"), Product.countDocuments(filter), query);
  return { products, pagination };
};
exports.outOfStock = async (query) => {
  const filter = { stock: 0 };
  const { documents: products, pagination } = await paginate(Product.find(filter).sort("name"), Product.countDocuments(filter), query);
  return { products, pagination };
};
exports.nearExpiry = async (days = 60, query) => {
  const until = new Date();
  until.setDate(until.getDate() + Number(days));
  const filter = { expiryDate: { $gte: new Date(), $lte: until } };
  const { documents: products, pagination } = await paginate(Product.find(filter).sort("expiryDate"), Product.countDocuments(filter), query);
  return { products, pagination };
};
exports.adjust = async (productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  const nextStock = product.stock + quantity;
  if (nextStock < 0) throw new ApiError(400, "Stock cannot become negative");
  product.stock = nextStock;
  await product.save();
  return product;
};
