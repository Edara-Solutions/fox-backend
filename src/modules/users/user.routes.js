const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const controller = require("./user.controller");
const validation = require("./user.validation");
const validate = require("../../middlewares/validation.middleware");
const userAuth = require("../../middlewares/userAuth.middleware");
const roles = require("../../middlewares/role.middleware");
const USER_ROLES = require("../../constants/roles");

const adminOnly = roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN);
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 });

router.post("/auth/login", authLimiter, validate(validation.login), controller.login);
router.get("/me", userAuth, controller.me);
router.patch("/me/password", userAuth, validate(validation.changePassword), controller.changePassword);
router.post("/", userAuth, adminOnly, validate(validation.create), controller.create);
router.get("/", userAuth, adminOnly, controller.list);
router.get("/:id", userAuth, adminOnly, validate(validation.idParam), controller.get);
router.patch("/:id", userAuth, adminOnly, validate(validation.update), controller.update);
router.patch("/:id/activate", userAuth, adminOnly, validate(validation.idParam), controller.activate);
router.patch("/:id/deactivate", userAuth, adminOnly, validate(validation.idParam), controller.deactivate);
router.delete("/:id", userAuth, roles(USER_ROLES.SUPER_ADMIN), validate(validation.idParam), controller.remove);

module.exports = router;
