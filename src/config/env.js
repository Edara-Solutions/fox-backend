require("dotenv").config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/supplements_store",
  customerJwtSecret: process.env.CUSTOMER_JWT_SECRET || "change_this_customer_secret",
  userJwtSecret: process.env.USER_JWT_SECRET || "change_this_user_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  vodafoneCashNumber: process.env.VODAFONE_CASH_NUMBER || "010xxxxxxxx",
  instapayAddress: process.env.INSTAPAY_ADDRESS || "yourstore@instapay",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

module.exports = env;
