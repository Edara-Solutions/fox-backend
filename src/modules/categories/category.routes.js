const router = require("express").Router();
const controller = require("./category.controller");
const validation = require("./category.validation");
const validate = require("../../middlewares/validation.middleware");
const userAuth = require("../../middlewares/userAuth.middleware");
const roles = require("../../middlewares/role.middleware");
const upload = require("../../middlewares/upload.middleware");
const USER_ROLES = require("../../constants/roles");

const admin = roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN);
router.post("/", userAuth, admin, upload.single("image"), validate(validation.create), controller.create);
router.get("/", controller.list);
router.get("/:slug", validate(validation.slugParam), controller.getBySlug);
router.patch("/:id", userAuth, admin, upload.single("image"), validate(validation.update), controller.update);
router.delete("/:id", userAuth, admin, validate(validation.idParam), controller.remove);
module.exports = router;
