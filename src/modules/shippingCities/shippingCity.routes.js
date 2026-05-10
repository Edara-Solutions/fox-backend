const router = require("express").Router();
const controller = require("./shippingCity.controller");
const validation = require("./shippingCity.validation");
const validate = require("../../middlewares/validation.middleware");
const userAuth = require("../../middlewares/userAuth.middleware");
const roles = require("../../middlewares/role.middleware");
const USER_ROLES = require("../../constants/roles");

const admin = roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN);

router.get("/", controller.listActive);
router.get("/admin", userAuth, admin, controller.listAdmin);
router.post("/", userAuth, admin, validate(validation.create), controller.create);
router.patch("/:id", userAuth, admin, validate(validation.update), controller.update);
router.delete("/:id", userAuth, admin, validate(validation.idParam), controller.remove);

module.exports = router;
