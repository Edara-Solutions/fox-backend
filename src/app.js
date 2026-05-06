const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const ApiResponse = require("./utils/ApiResponse");
const notFound = require("./middlewares/notFound.middleware");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
if (env.nodeEnv === "development") app.use(morgan("dev"));

app.get("/", (req, res) => res.json(new ApiResponse("Supplements Store API is healthy", { status: "ok" })));

app.use("/api/customers", require("./modules/customers/customer.routes"));
app.use("/api/users", require("./modules/users/user.routes"));
app.use("/api/categories", require("./modules/categories/category.routes"));
app.use("/api/brands", require("./modules/brands/brand.routes"));
app.use("/api/products", require("./modules/products/product.routes"));
app.use("/api/cart", require("./modules/cart/cart.routes"));
app.use("/api/orders", require("./modules/orders/order.routes"));
app.use("/api/payments", require("./modules/payments/payment.routes"));
app.use("/api/inventory", require("./modules/inventory/inventory.routes"));
app.use("/api/coupons", require("./modules/coupons/coupon.routes"));
app.use("/api/reviews", require("./modules/reviews/review.routes"));

app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
