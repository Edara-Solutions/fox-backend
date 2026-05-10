const router = require("express").Router();
const controller = require("./dashboard.controller");
const userAuth = require("../../middlewares/userAuth.middleware");
const roles = require("../../middlewares/role.middleware");
const USER_ROLES = require("../../constants/roles");

router.get("/overview", userAuth, roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), controller.overview);
router.get("/revenue", userAuth, roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), controller.revenue);
router.get("/best-selling-products", userAuth, roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), controller.bestSellingProducts);

module.exports = router;
