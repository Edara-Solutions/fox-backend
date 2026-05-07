const router = require("express").Router();
const controller = require("./coupon.controller");
const validation = require("./coupon.validation");
const validate = require("../../middlewares/validation.middleware");
const customerAuth = require("../../middlewares/customerAuth.middleware");
const userAuth = require("../../middlewares/userAuth.middleware");
const roles = require("../../middlewares/role.middleware");
const USER_ROLES = require("../../constants/roles");

const admin = roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN);
router.post("/validate", customerAuth, validate(validation.validate), controller.validateCoupon);
router.post("/", userAuth, admin, validate(validation.create), controller.create);
router.get("/", userAuth, admin, controller.list);
router.get("/mine", userAuth, controller.getMine);
router.get("/:id", userAuth, admin, validate(validation.idParam), controller.get);
router.patch("/:id", userAuth, admin, validate(validation.update), controller.update);
router.delete("/:id", userAuth, admin, validate(validation.idParam), controller.remove);
module.exports = router;
