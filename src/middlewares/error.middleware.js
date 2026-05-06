const ApiError = require("../utils/ApiError");

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  if (err.name === "CastError") {
    error = new ApiError(400, "Invalid resource id");
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(409, `${field} already exists`);
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    error = new ApiError(401, "Invalid or expired token");
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    errors: error.errors || [],
  });
};

module.exports = errorMiddleware;
