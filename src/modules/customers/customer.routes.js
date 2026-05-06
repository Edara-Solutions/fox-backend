const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const controller = require("./customer.controller");
const validation = require("./customer.validation");
const validate = require("../../middlewares/validation.middleware");
const customerAuth = require("../../middlewares/customerAuth.middleware");
const userAuth = require("../../middlewares/userAuth.middleware");
const roles = require("../../middlewares/role.middleware");
const USER_ROLES = require("../../constants/roles");

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 });

router.post("/auth/register", authLimiter, validate(validation.register), controller.register);
router.post("/auth/login", authLimiter, validate(validation.login), controller.login);
router.get("/me", customerAuth, controller.me);
router.patch("/me", customerAuth, validate(validation.updateMe), controller.updateMe);
router.patch("/me/password", customerAuth, validate(validation.changePassword), controller.changePassword);
router.post("/me/addresses", customerAuth, validate(validation.addAddress), controller.addAddress);
router.patch("/me/addresses/:addressId", customerAuth, validate(validation.updateAddress), controller.updateAddress);
router.delete("/me/addresses/:addressId", customerAuth, validate(validation.addressId), controller.deleteAddress);
router.patch("/me/addresses/:addressId/default", customerAuth, validate(validation.addressId), controller.setDefaultAddress);
router.get("/admin", userAuth, roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.CUSTOMER_SUPPORT), controller.listAdmin);
router.get("/admin/:id", userAuth, roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.CUSTOMER_SUPPORT), validate(validation.idParam), controller.getAdmin);
router.patch("/admin/:id/block", userAuth, roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.CUSTOMER_SUPPORT), validate(validation.idParam), controller.block);
router.patch("/admin/:id/unblock", userAuth, roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.CUSTOMER_SUPPORT), validate(validation.idParam), controller.unblock);

module.exports = router;
