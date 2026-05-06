const express = require("express");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  uploadImage,
} = require("../controllers/productController");

const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");
const productRouter = express.Router();

productRouter
  .route("/")
  .post([authenticateUser, authorizePermissions("admin")], createProduct);
productRouter.route("/").get(getAllProducts);
productRouter
  .route("/:id")
  .patch([authenticateUser, authorizePermissions("admin")], updateProduct)
  .delete([authenticateUser, authorizePermissions("admin")], deleteProduct)
  .get(getSingleProduct);
// productRouter.route("/uploadImage").post(uploadImage);

module.exports = productRouter;
