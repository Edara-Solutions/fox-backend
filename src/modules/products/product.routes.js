const router = require("express").Router();
const controller = require("./product.controller");
const validation = require("./product.validation");
const validate = require("../../middlewares/validation.middleware");
const userAuth = require("../../middlewares/userAuth.middleware");
const roles = require("../../middlewares/role.middleware");
const upload = require("../../middlewares/upload.middleware");
const USER_ROLES = require("../../constants/roles");

const catalogManagers = roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.INVENTORY_MANAGER);
router.post("/", userAuth, catalogManagers, upload.array("images", 8), validate(validation.create), controller.create);
router.get("/admin", userAuth, catalogManagers, controller.listAdmin);
router.get("/", controller.list);
router.get("/:slug", validate(validation.slugParam), controller.getBySlug);
router.get("/admin/:slug", userAuth, catalogManagers, validate(validation.slugParam), controller.getBySlugAdmin);
router.patch("/:id", userAuth, catalogManagers, upload.array("images", 8), validate(validation.update), controller.update);
router.delete("/:id", userAuth, roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validate(validation.idParam), controller.remove);
router.patch("/:id/stock", userAuth, catalogManagers, validate(validation.updateStock), controller.updateStock);
module.exports = router;
