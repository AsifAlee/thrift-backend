const router = require("express").Router();
const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const {
  authenticateUser,
  authorizePermissions,
  optionalAuth,
} = require("../middleware/authentication");

router
  .route("/")
  .post(optionalAuth, createOrder)
  .get(authenticateUser, authorizePermissions("admin"), getAllOrders);

router.route("/showAllMyOrders").get(authenticateUser, getCurrentUserOrders);

router
  .route("/:orderId")
  .get(authenticateUser, getSingleOrder)
  .patch([authenticateUser, authorizePermissions("admin")], updateOrder)
  .delete(authenticateUser, deleteOrder);

module.exports = router;
