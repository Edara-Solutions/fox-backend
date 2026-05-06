const router = require("express").Router();
const controller = require("./inventory.controller");
const validation = require("./inventory.validation");
const validate = require("../../middlewares/validation.middleware");
const userAuth = require("../../middlewares/userAuth.middleware");
const roles = require("../../middlewares/role.middleware");
const USER_ROLES = require("../../constants/roles");

router.use(userAuth, roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.INVENTORY_MANAGER));
router.get("/low-stock", controller.lowStock);
router.get("/out-of-stock", controller.outOfStock);
router.get("/near-expiry", controller.nearExpiry);
router.patch("/products/:productId/adjust", validate(validation.adjust), controller.adjust);
module.exports = router;
