const ApiError = require("../../utils/ApiError");
const Customer = require("./customer.model");
const generateCustomerToken = require("../../utils/generateCustomerToken");
const { paginate } = require("../../utils/pagination");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sanitize = (customer) => {
  const obj = customer.toObject ? customer.toObject() : customer;
  delete obj.password;
  return obj;
};

const adminFilter = (query) => {
  const filter = {};

  if (query.search?.trim()) {
    const search = new RegExp(escapeRegex(query.search.trim()), "i");
    filter.$or = [{ fullName: search }, { email: search }, { phone: search }];
  }

  if (query.isBlocked !== undefined) filter.isBlocked = query.isBlocked === "true" || query.isBlocked === true;

  return filter;
};

const register = async (payload) => {
  const customer = await Customer.create(payload);
  return { customer: sanitize(customer), token: generateCustomerToken(customer) };
};

const login = async ({ email, password }) => {
  const customer = await Customer.findOne({ email: email.toLowerCase() }).select("+password");
  if (!customer || !(await customer.comparePassword(password))) throw new ApiError(401, "Invalid credentials");
  if (customer.isBlocked) throw new ApiError(403, "Customer account is blocked");
  customer.lastLoginAt = new Date();
  await customer.save();
  return { customer: sanitize(customer), token: generateCustomerToken(customer) };
};

const updateMe = async (customerId, payload) => Customer.findByIdAndUpdate(customerId, payload, { new: true });

const listAdmin = async (query) => {
  const filter = adminFilter(query);
  const { documents: customers, pagination } = await paginate(Customer.find(filter).sort("-createdAt"), Customer.countDocuments(filter), query);
  return { customers, pagination };
};

const changePassword = async (customerId, currentPassword, newPassword) => {
  const customer = await Customer.findById(customerId).select("+password");
  if (!(await customer.comparePassword(currentPassword))) throw new ApiError(400, "Current password is incorrect");
  customer.password = newPassword;
  await customer.save();
};

const addAddress = async (customer, payload) => {
  if (payload.isDefault || customer.addresses.length === 0) customer.addresses.forEach((address) => (address.isDefault = false));
  customer.addresses.push({ ...payload, isDefault: payload.isDefault || customer.addresses.length === 0 });
  await customer.save();
  return customer;
};

const updateAddress = async (customer, addressId, payload) => {
  const address = customer.addresses.id(addressId);
  if (!address) throw new ApiError(404, "Address not found");
  if (payload.isDefault) customer.addresses.forEach((item) => (item.isDefault = false));
  Object.assign(address, payload);
  await customer.save();
  return customer;
};

const deleteAddress = async (customer, addressId) => {
  const address = customer.addresses.id(addressId);
  if (!address) throw new ApiError(404, "Address not found");
  address.deleteOne();
  await customer.save();
  return customer;
};

const setDefaultAddress = async (customer, addressId) => {
  const address = customer.addresses.id(addressId);
  if (!address) throw new ApiError(404, "Address not found");
  customer.addresses.forEach((item) => (item.isDefault = false));
  address.isDefault = true;
  await customer.save();
  return customer;
};

module.exports = { register, login, updateMe, listAdmin, changePassword, addAddress, updateAddress, deleteAddress, setDefaultAddress };
