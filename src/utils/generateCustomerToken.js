const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateCustomerToken = (customer) =>
  jwt.sign({ id: customer._id, type: "customer" }, env.customerJwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

module.exports = generateCustomerToken;
