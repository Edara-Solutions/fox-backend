const Cart = require("../cart/cart.model");
const Order = require("./order.model");
const Payment = require("../payments/payment.model");
const Product = require("../products/product.model");
const ApiError = require("../../utils/ApiError");
const PAYMENT_STATUS = require("../../constants/paymentStatus");
const ORDER_STATUS = require("../../constants/orderStatus");
const { validateCoupon } = require("../coupons/coupon.service");

const makeOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

const createOrder = async (customerId, payload) => {
  const cart = await Cart.findOne({ customer: customerId });
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Cart is empty");

  const productSnapshots = new Map();
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) throw new ApiError(400, `${item.name} is unavailable`);
    if (product.stock < item.quantity) throw new ApiError(400, `${item.name} does not have enough stock`);
    productSnapshots.set(item.product.toString(), product);
  }
  const shippingFee = payload.shippingFee || 0;
  const validatedCoupon = payload.couponCode
    ? await validateCoupon({ code: payload.couponCode, orderTotal: cart.subtotal })
    : null;
  const discount = validatedCoupon ? validatedCoupon.discount : 0;
  const vendor = validatedCoupon ? validatedCoupon.coupon.vendor : null;
  const total = cart.subtotal + shippingFee - discount;
  const order = await Order.create({
    orderNumber: makeOrderNumber(),
    customer: customerId,
    items: cart.items.map((item) => {
      const product = productSnapshots.get(item.product.toString());
      return {
        product: item.product,
        name: item.name,
        sku: product.sku,
        image: item.image,
        price: item.discountPrice || item.price,
        quantity: item.quantity,
        selectedFlavor: item.selectedFlavor,
      };
    }),
    subtotal: cart.subtotal,
    discount,
    shippingFee,
    total,
    couponCode: payload.couponCode,
    vendor,
    paymentMethod: payload.paymentMethod,
    shippingDetails: payload.shippingDetails,
    notes: payload.notes,
    paymentStatus: PAYMENT_STATUS.PENDING,
    orderStatus: ORDER_STATUS.PENDING_PAYMENT,
  });
  await Payment.create({ order: order._id, customer: customerId, method: payload.paymentMethod, amount: total });
  cart.items = [];
  cart.recalculate();
  await cart.save();
  return order;
};

module.exports = { createOrder };
