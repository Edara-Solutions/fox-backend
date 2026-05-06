const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/modules/users/user.model");
const USER_ROLES = require("../src/constants/roles");

const seed = async () => {
  const name = process.env.SEED_SUPER_ADMIN_NAME || "Super Admin";
  const email = process.env.SEED_SUPER_ADMIN_EMAIL;
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD before running this script.");
  }

  await connectDB();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log("Super admin already exists.");
    return;
  }

  await User.create({ name, email, password, role: USER_ROLES.SUPER_ADMIN });
  console.log("Super admin created.");
};

seed()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
