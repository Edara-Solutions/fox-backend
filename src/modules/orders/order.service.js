const Cart = require("../cart/cart.model");
const Order = require("./order.model");
const Customer = require("../customers/customer.model");
const Payment = require("../payments/payment.model");
const Product = require("../products/product.model");
const User = require("../users/user.model");
const ApiError = require("../../utils/ApiError");
const PAYMENT_STATUS = require("../../constants/paymentStatus");
const ORDER_STATUS = require("../../constants/orderStatus");
const USER_ROLES = require("../../constants/roles");
const { validateCoupon, incrementCouponUsage } = require("../coupons/coupon.service");
const { getActiveCityByName } = require("../shippingCities/shippingCity.service");
const { paginate } = require("../../utils/pagination");

const makeOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
const orderPopulate = [
  { path: "customer", select: "fullName email phone" },
  { path: "vendor", select: "name email role" },
  { path: "assignedTo", select: "name email role" },
  { path: "assignedBy", select: "name email role" },
  { path: "payment" },
];
const assignableRoles = [USER_ROLES.ORDER_MANAGER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseDateStart = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseDateExclusiveEnd = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + 1);
  return date;
};

const buildOrderListFilter = async (query) => {
  const filter = {};
  const { search, orderStatus, paymentStatus, paymentMethod, dateFrom, dateTo } = query;

  if (orderStatus) filter.orderStatus = orderStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (paymentMethod) filter.paymentMethod = paymentMethod;

  const startDate = parseDateStart(dateFrom);
  const endDate = parseDateExclusiveEnd(dateTo);
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = startDate;
    if (endDate) filter.createdAt.$lt = endDate;
  }

  if (search?.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), "i");
    const customers = await Customer.find({ $or: [{ fullName: regex }, { phone: regex }] }).select("_id");

    filter.$or = [{ orderNumber: regex }];
    if (customers.length) filter.$or.push({ customer: { $in: customers.map((customer) => customer._id) } });
  }

  return filter;
};

const deductOrderStock = async (order) => {
  if (order.stockDeducted) return;

  const deductedItems = [];
  for (const item of order.items) {
    const product = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );

    if (!product) {
      for (const deductedItem of deductedItems) {
        await Product.findByIdAndUpdate(deductedItem.product, { $inc: { stock: deductedItem.quantity } });
      }
      throw new ApiError(400, `Not enough stock for ${item.name}`);
    }

    deductedItems.push(item);
  }

  order.stockDeducted = true;
};

const restoreOrderStock = async (order) => {
  if (!order.stockDeducted) return;

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  order.stockDeducted = false;
};

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
  const shippingCity = await getActiveCityByName(payload.shippingDetails.city);
  const validatedCoupon = payload.couponCode
    ? await validateCoupon({ code: payload.couponCode, orderTotal: cart.subtotal })
    : null;
  const shippingFee = validatedCoupon?.freeShipping ? 0 : shippingCity.shippingFee;
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
        slug: product.slug,
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
    paid: 0,
    reminder: total,
    couponCode: payload.couponCode,
    vendor,
    paymentMethod: payload.paymentMethod,
    shippingDetails: {
      ...payload.shippingDetails,
      city: shippingCity.name,
    },
    notes: payload.notes,
    paymentStatus: PAYMENT_STATUS.PENDING,
    orderStatus: ORDER_STATUS.PENDING_PAYMENT,
  });
  await Payment.create({ order: order._id, customer: customerId, method: payload.paymentMethod, amount: total });
  if (validatedCoupon) await incrementCouponUsage(validatedCoupon.coupon._id);
  cart.items = [];
  cart.recalculate();
  await cart.save();
  await order.populate("payment");
  return order;
};

const updateOrderStatus = async (orderId, orderStatus) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  // if (orderStatus === ORDER_STATUS.CONFIRMED) {
  //   await deductOrderStock(order);
  //   order.paymentStatus = PAYMENT_STATUS.PAID;
  //   order.paid = order.total;
  //   order.reminder = 0;
  //   order.paidAt = order.paidAt || new Date();
  //   order.confirmedAt = order.confirmedAt || new Date();
  //   await Payment.findOneAndUpdate({ order: order._id }, { status: PAYMENT_STATUS.PAID, amount: order.total });
  // }

  if (orderStatus === ORDER_STATUS.CANCELLED) {
    await restoreOrderStock(order);
    order.cancelledAt = order.cancelledAt || new Date();
  }

  if (orderStatus === ORDER_STATUS.REFUNDED) {
    await restoreOrderStock(order);
    order.paymentStatus = PAYMENT_STATUS.REFUNDED;
    order.refundedAt = order.refundedAt || new Date();
    await Payment.findOneAndUpdate({ order: order._id }, { status: PAYMENT_STATUS.REFUNDED });
  }

  if (orderStatus === ORDER_STATUS.SHIPPED) {
    order.shippedAt = order.shippedAt || new Date();
  }

  if (orderStatus === ORDER_STATUS.DELIVERED) {
    order.deliveredAt = order.deliveredAt || new Date();
  }

  if (orderStatus === ORDER_STATUS.COMPLETED) {
    await deductOrderStock(order);
    order.paymentStatus = PAYMENT_STATUS.PAID;
    order.paid = order.subtotal + (order.shippingFee || 0);
    order.reminder = 0;
    order.paidAt = order.paidAt || new Date();
    order.confirmedAt = order.confirmedAt || new Date();
    order.completedAt = order.completedAt || new Date();
    await Payment.findOneAndUpdate({ order: order._id }, { status: PAYMENT_STATUS.PAID, amount: order.subtotal + (order.shippingFee || 0) });
  }

  order.orderStatus = orderStatus;
  await order.save();
  await order.populate([
    ...orderPopulate,
  ]);
  return order;
};

const cancelCustomerOrder = async (customerId, orderId) => {
  const order = await Order.findOne({ _id: orderId, customer: customerId });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.orderStatus !== ORDER_STATUS.PENDING_PAYMENT) throw new ApiError(400, "Order cannot be cancelled now");

  order.orderStatus = ORDER_STATUS.CANCELLED;
  order.cancelledAt = order.cancelledAt || new Date();
  await order.save();
  await order.populate([
    { path: "vendor", select: "name email role" },
    { path: "assignedTo", select: "name email role" },
    { path: "assignedBy", select: "name email role" },
    { path: "payment" },
  ]);
  return order;
};

const assignOrder = async (orderId, assignedTo, assignedBy) => {
  const assignee = await User.findOne({ _id: assignedTo, isActive: true, role: { $in: assignableRoles } });
  if (!assignee) throw new ApiError(400, "Assigned user must be an active order staff user");

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  order.assignedTo = assignee._id;
  order.assignedBy = assignedBy;
  order.assignedAt = new Date();
  await order.save();
  await order.populate(orderPopulate);
  return order;
};

const listAssignedOrders = async (userId, query) => {
  const filter = { assignedTo: userId };
  const { documents: orders, pagination } = await paginate(Order.find(filter).populate(orderPopulate).sort("-createdAt"), Order.countDocuments(filter), query);
  return { orders, pagination };
};

const listOrders = async (query) => {
  const filter = await buildOrderListFilter(query);
  const { documents: orders, pagination } = await paginate(Order.find(filter).populate(orderPopulate).sort("-createdAt"), Order.countDocuments(filter), query);
  return { orders, pagination };
};

module.exports = { createOrder, deductOrderStock, restoreOrderStock, updateOrderStatus, cancelCustomerOrder, assignOrder, listAssignedOrders, listOrders };
