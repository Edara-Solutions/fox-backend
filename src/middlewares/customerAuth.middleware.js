const jwt = require("jsonwebtoken");
const env = require("../config/env");
const Customer = require("../modules/customers/customer.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const customerAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) throw new ApiError(401, "Customer authentication required");

  const decoded = jwt.verify(token, env.customerJwtSecret);
  if (decoded.type !== "customer") throw new ApiError(401, "Invalid customer token");

  const customer = await Customer.findById(decoded.id);
  if (!customer) throw new ApiError(401, "Customer not found");
  if (customer.isBlocked) throw new ApiError(403, "Customer account is blocked");

  req.customer = customer;
  next();
});

module.exports = customerAuth;
