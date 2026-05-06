const router = require("express").Router();
const controller = require("./cart.controller");
const validation = require("./cart.validation");
const validate = require("../../middlewares/validation.middleware");
const customerAuth = require("../../middlewares/customerAuth.middleware");

router.use(customerAuth);
router.get("/", controller.get);
router.post("/items", validate(validation.addItem), controller.addItem);
router.patch("/items/:itemId", validate(validation.updateItem), controller.updateItem);
router.delete("/items/:itemId", validate(validation.itemId), controller.removeItem);
router.delete("/", controller.clear);
module.exports = router;
