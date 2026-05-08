const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const Order = require("./order.model");
const service = require("./order.service");

const orderPopulate = [
  { path: "customer", select: "fullName email phone" },
  { path: "vendor", select: "name email role" },
  { path: "assignedTo", select: "name email role" },
  { path: "assignedBy", select: "name email role" },
  { path: "payment" },
];
const customerOrderPopulate = orderPopulate.filter((populate) => populate.path !== "customer");

exports.create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse("Order created", { order: await service.createOrder(req.customer._id, req.body) })));
exports.myOrders = asyncHandler(async (req, res) => res.json(new ApiResponse("Orders fetched", { orders: await Order.find({ customer: req.customer._id }).populate(customerOrderPopulate).sort("-createdAt") })));
exports.myOrder = asyncHandler(async (req, res) => res.json(new ApiResponse("Order fetched", { order: await Order.findOne({ _id: req.params.id, customer: req.customer._id }).populate(customerOrderPopulate) })));
exports.cancelMine = asyncHandler(async (req, res) => res.json(new ApiResponse("Order cancelled", { order: await service.cancelCustomerOrder(req.customer._id, req.params.id) })));
exports.assignedToMe = asyncHandler(async (req, res) => res.json(new ApiResponse("Assigned orders fetched", { orders: await service.listAssignedOrders(req.user._id) })));
exports.list = asyncHandler(async (req, res) => res.json(new ApiResponse("Orders fetched", { orders: await Order.find().populate(orderPopulate).sort("-createdAt") })));
exports.get = asyncHandler(async (req, res) => res.json(new ApiResponse("Order fetched", { order: await Order.findById(req.params.id).populate(orderPopulate) })));
exports.assign = asyncHandler(async (req, res) => res.json(new ApiResponse("Order assigned", { order: await service.assignOrder(req.params.id, req.body.assignedTo, req.user._id) })));
exports.updateStatus = asyncHandler(async (req, res) => res.json(new ApiResponse("Order status updated", { order: await service.updateOrderStatus(req.params.id, req.body.orderStatus) })));
