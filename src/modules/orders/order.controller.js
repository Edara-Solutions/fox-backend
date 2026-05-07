const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const Order = require("./order.model");
const service = require("./order.service");
const ORDER_STATUS = require("../../constants/orderStatus");

const orderPopulate = [
  { path: "customer", select: "fullName email phone" },
  { path: "vendor", select: "name email role" },
  { path: "payment" },
];
const customerOrderPopulate = orderPopulate.filter((populate) => populate.path !== "customer");

exports.create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse("Order created", { order: await service.createOrder(req.customer._id, req.body) })));
exports.myOrders = asyncHandler(async (req, res) => res.json(new ApiResponse("Orders fetched", { orders: await Order.find({ customer: req.customer._id }).populate(customerOrderPopulate).sort("-createdAt") })));
exports.myOrder = asyncHandler(async (req, res) => res.json(new ApiResponse("Order fetched", { order: await Order.findOne({ _id: req.params.id, customer: req.customer._id }).populate(customerOrderPopulate) })));
exports.cancelMine = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndUpdate({ _id: req.params.id, customer: req.customer._id, orderStatus: ORDER_STATUS.PENDING_PAYMENT }, { orderStatus: ORDER_STATUS.CANCELLED, cancelledAt: new Date() }, { new: true }).populate(customerOrderPopulate);
  res.json(new ApiResponse("Order cancelled", { order }));
});
exports.list = asyncHandler(async (req, res) => res.json(new ApiResponse("Orders fetched", { orders: await Order.find().populate(orderPopulate).sort("-createdAt") })));
exports.get = asyncHandler(async (req, res) => res.json(new ApiResponse("Order fetched", { order: await Order.findById(req.params.id).populate(orderPopulate) })));
exports.updateStatus = asyncHandler(async (req, res) => {
  const update = { orderStatus: req.body.orderStatus };
  if (req.body.orderStatus === ORDER_STATUS.DELIVERED) update.deliveredAt = new Date();
  if (req.body.orderStatus === ORDER_STATUS.CANCELLED) update.cancelledAt = new Date();
  const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true }).populate(orderPopulate);
  res.json(new ApiResponse("Order status updated", { order }));
});
