const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const User = require("./user.model");
const service = require("./user.service");

exports.login = asyncHandler(async (req, res) => res.json(new ApiResponse("User logged in", await service.login(req.body))));
exports.me = asyncHandler(async (req, res) => res.json(new ApiResponse("User profile", { user: req.user })));
exports.changePassword = asyncHandler(async (req, res) => {
  await service.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  res.json(new ApiResponse("Password changed"));
});
exports.create = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse("User created", { user: await service.createUser(req.user, req.body) })));
exports.list = asyncHandler(async (req, res) => res.json(new ApiResponse("Users fetched", { users: await User.find().sort("-createdAt") })));
exports.get = asyncHandler(async (req, res) => res.json(new ApiResponse("User fetched", { user: await User.findById(req.params.id) })));
exports.update = asyncHandler(async (req, res) => res.json(new ApiResponse("User updated", { user: await service.updateUser(req.user, req.params.id, req.body) })));
exports.activate = asyncHandler(async (req, res) => res.json(new ApiResponse("User activated", { user: await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }) })));
exports.deactivate = asyncHandler(async (req, res) => res.json(new ApiResponse("User deactivated", { user: await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }) })));
exports.remove = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse("User deleted"));
});
