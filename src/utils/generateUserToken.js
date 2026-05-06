const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateUserToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, type: "user" }, env.userJwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

module.exports = generateUserToken;
