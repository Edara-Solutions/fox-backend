const Review = require("./review.model");
const Product = require("../products/product.model");
const ApiError = require("../../utils/ApiError");

const refreshProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: "$product", averageRating: { $avg: "$rating" }, reviewsCount: { $sum: 1 } } },
  ]);
  const data = stats[0] || { averageRating: 0, reviewsCount: 0 };
  await Product.findByIdAndUpdate(productId, { averageRating: Number(data.averageRating || 0).toFixed(1), reviewsCount: data.reviewsCount || 0 });
};

exports.create = async (customerId, productId, payload) => {
  if (!(await Product.exists({ _id: productId, isActive: true }))) throw new ApiError(404, "Product not found");
  const review = await Review.create({ ...payload, customer: customerId, product: productId });
  await refreshProductRating(review.product);
  return review;
};

exports.update = async (customerId, id, payload) => {
  const review = await Review.findOneAndUpdate({ _id: id, customer: customerId }, payload, { new: true });
  if (!review) throw new ApiError(404, "Review not found");
  await refreshProductRating(review.product);
  return review;
};

exports.remove = async (id, customerId) => {
  const filter = customerId ? { _id: id, customer: customerId } : { _id: id };
  const review = await Review.findOneAndDelete(filter);
  if (!review) throw new ApiError(404, "Review not found");
  await refreshProductRating(review.product);
};
