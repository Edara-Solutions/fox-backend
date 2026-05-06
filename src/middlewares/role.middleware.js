const ApiError = require("../utils/ApiError");

const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, "Internal user authentication required"));
  if (!roles.includes(req.user.role)) return next(new ApiError(403, "Forbidden"));
  return next();
};

module.exports = requireRoles;
