const ApiError = require("../../utils/ApiError");
const User = require("./user.model");
const USER_ROLES = require("../../constants/roles");
const generateUserToken = require("../../utils/generateUserToken");

const sanitize = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  return obj;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, "Invalid credentials");
  if (!user.isActive) throw new ApiError(403, "User account is inactive");
  user.lastLoginAt = new Date();
  await user.save();
  return { user: sanitize(user), token: generateUserToken(user) };
};

const canCreateRole = (actor, role) => {
  if (actor.role === USER_ROLES.SUPER_ADMIN) return true;
  return actor.role === USER_ROLES.ADMIN && [USER_ROLES.INVENTORY_MANAGER, USER_ROLES.ORDER_MANAGER, USER_ROLES.CUSTOMER_SUPPORT].includes(role);
};

const createUser = async (actor, payload) => {
  if (!canCreateRole(actor, payload.role)) throw new ApiError(403, "You cannot create this role");
  return User.create(payload);
};

const updateUser = async (actor, id, payload) => {
  if (payload.role && !canCreateRole(actor, payload.role)) throw new ApiError(403, "You cannot assign this role");
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");
  Object.assign(user, payload);
  await user.save();
  return user;
};

const changePassword = async (id, currentPassword, newPassword) => {
  const user = await User.findById(id).select("+password");
  if (!(await user.comparePassword(currentPassword))) throw new ApiError(400, "Current password is incorrect");
  user.password = newPassword;
  await user.save();
};

module.exports = { login, createUser, updateUser, changePassword };
