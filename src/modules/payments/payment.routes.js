const router = require("express").Router();
const controller = require("./payment.controller");
const validation = require("./payment.validation");
const validate = require("../../middlewares/validation.middleware");
const customerAuth = require("../../middlewares/customerAuth.middleware");
const userAuth = require("../../middlewares/userAuth.middleware");
const roles = require("../../middlewares/role.middleware");
const upload = require("../../middlewares/upload.middleware");
const USER_ROLES = require("../../constants/roles");

const reviewers = roles(USER_ROLES.ORDER_MANAGER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN);
router.get("/instructions/:orderId", customerAuth, validate(validation.orderId), controller.instructions);
router.post("/:orderId/proof", customerAuth, upload.single("proofImage"), validate(validation.proof), controller.submitProof);
router.get("/", userAuth, reviewers, controller.list);
router.get("/:id", userAuth, reviewers, validate(validation.idParam), controller.get);
router.patch("/:id/approve", userAuth, reviewers, validate(validation.approve), controller.approve);
router.patch("/:id/reject", userAuth, reviewers, validate(validation.reject), controller.reject);
module.exports = router;
