const router = require("express").Router();
const controller = require("./review.controller");
const validation = require("./review.validation");
const validate = require("../../middlewares/validation.middleware");
const customerAuth = require("../../middlewares/customerAuth.middleware");
const userAuth = require("../../middlewares/userAuth.middleware");
const roles = require("../../middlewares/role.middleware");
const USER_ROLES = require("../../constants/roles");

router.post("/products/:productId", customerAuth, validate(validation.create), controller.create);
router.get("/products/:productId", validate(validation.productId), controller.listByProduct);
router.patch("/:id", customerAuth, validate(validation.update), controller.updateMine);
router.delete("/:id", customerAuth, validate(validation.idParam), controller.deleteMine);
router.delete("/:id/admin", userAuth, roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.CUSTOMER_SUPPORT), validate(validation.idParam), controller.deleteAdmin);
module.exports = router;
