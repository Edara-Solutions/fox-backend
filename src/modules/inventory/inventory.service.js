const Product = require("../products/product.model");
const ApiError = require("../../utils/ApiError");

exports.lowStock = (threshold = 5) => Product.find({ stock: { $gt: 0, $lte: threshold } }).sort("stock");
exports.outOfStock = () => Product.find({ stock: 0 }).sort("name");
exports.nearExpiry = (days = 60) => {
  const until = new Date();
  until.setDate(until.getDate() + Number(days));
  return Product.find({ expiryDate: { $gte: new Date(), $lte: until } }).sort("expiryDate");
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
