const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const Customer = require("./customer.model");
const service = require("./customer.service");

exports.register = asyncHandler(async (req, res) => {
  res.status(201).json(new ApiResponse("Customer registered", await service.register(req.body)));
});

exports.login = asyncHandler(async (req, res) => {
  res.json(new ApiResponse("Customer logged in", await service.login(req.body)));
});

exports.me = asyncHandler(async (req, res) => {
  res.json(new ApiResponse("Customer profile", { customer: req.customer }));
});

exports.updateMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse("Customer updated", { customer: await service.updateMe(req.customer._id, req.body) }));
});

exports.changePassword = asyncHandler(async (req, res) => {
  await service.changePassword(req.customer._id, req.body.currentPassword, req.body.newPassword);
  res.json(new ApiResponse("Password changed"));
});

exports.addAddress = asyncHandler(async (req, res) => {
  res.status(201).json(new ApiResponse("Address added", { customer: await service.addAddress(req.customer, req.body) }));
});

exports.updateAddress = asyncHandler(async (req, res) => {
  res.json(new ApiResponse("Address updated", { customer: await service.updateAddress(req.customer, req.params.addressId, req.body) }));
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  res.json(new ApiResponse("Address deleted", { customer: await service.deleteAddress(req.customer, req.params.addressId) }));
});

exports.setDefaultAddress = asyncHandler(async (req, res) => {
  res.json(new ApiResponse("Default address updated", { customer: await service.setDefaultAddress(req.customer, req.params.addressId) }));
});

exports.listAdmin = asyncHandler(async (req, res) => {
  const customers = await Customer.find().sort("-createdAt");
  res.json(new ApiResponse("Customers fetched", { customers }));
});

exports.getAdmin = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  res.json(new ApiResponse("Customer fetched", { customer }));
});

exports.block = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
  res.json(new ApiResponse("Customer blocked", { customer }));
});

exports.unblock = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
  res.json(new ApiResponse("Customer unblocked", { customer }));
});
