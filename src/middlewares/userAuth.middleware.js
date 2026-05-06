const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../modules/users/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const userAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) throw new ApiError(401, "Internal user authentication required");

  const decoded = jwt.verify(token, env.userJwtSecret);
  if (decoded.type !== "user") throw new ApiError(401, "Invalid user token");

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User not found");
  if (!user.isActive) throw new ApiError(403, "User account is inactive");

  req.user = user;
  next();
});

module.exports = userAuth;
