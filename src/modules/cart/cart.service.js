const Cart = require("./cart.model");
const Product = require("../products/product.model");
const ApiError = require("../../utils/ApiError");

const getOrCreateCart = async (customerId) => {
  let cart = await Cart.findOne({ customer: customerId }).populate("items.product");
  if (!cart) cart = await Cart.create({ customer: customerId, items: [] });
  return cart;
};

const getItemProductId = (item) => (item.product?._id || item.product).toString();
const normalizeFlavor = (flavor) => (flavor || "").trim();

const addItem = async (customerId, { productId, quantity, selectedFlavor }) => {
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw new ApiError(404, "Product not found");
  if (product.stock < quantity) throw new ApiError(400, "Not enough stock");
  const cart = await getOrCreateCart(customerId);
  const flavor = normalizeFlavor(selectedFlavor);
  const existing = cart.items.find((item) => getItemProductId(item) === productId && normalizeFlavor(item.selectedFlavor) === flavor);
  if (existing) {
    if (product.stock < existing.quantity + quantity) throw new ApiError(400, "Not enough stock");
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: product._id, name: product.name, image: product.images[0], price: product.price, discountPrice: product.discountPrice, selectedFlavor: flavor || undefined, quantity });
  }
  cart.recalculate();
  await cart.save();
  return cart;
};

const updateItem = async (customerId, itemId, quantity) => {
  const cart = await getOrCreateCart(customerId);
  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, "Cart item not found");
  const product = await Product.findById(item.product);
  if (!product || !product.isActive) throw new ApiError(404, "Product not found");
  if (product.stock < quantity) throw new ApiError(400, "Not enough stock");
  item.quantity = quantity;
  cart.recalculate();
  await cart.save();
  return cart;
};

const removeItem = async (customerId, itemId) => {
  const cart = await getOrCreateCart(customerId);
  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, "Cart item not found");
  item.deleteOne();
  cart.recalculate();
  await cart.save();
  return cart;
};

module.exports = { getOrCreateCart, addItem, updateItem, removeItem };
