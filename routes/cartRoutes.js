const {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
} = require("../controllers/cartController");
const { authenticateUser } = require("../middleware/authentication");

const cartRouter = require("express").Router();
cartRouter
  .route("/")
  .post(authenticateUser, addToCart)
  .get(authenticateUser, getCart);

cartRouter
  .route("/:productId")
  .patch(authenticateUser, updateCartItem)
  .delete(authenticateUser, deleteCartItem);

module.exports = cartRouter;
