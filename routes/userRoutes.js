const express = require("express");
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updatePassword,
  updateUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const userRouter = express.Router();
userRouter
  .route("/")
  .get(authenticateUser, authorizePermissions("admin", "owner"), getAllUsers);
userRouter.route("/showMe").get(authenticateUser, showCurrentUser);
userRouter.route("/upatePassword").patch(authenticateUser, updatePassword);
userRouter.route("/updateUser").patch(authenticateUser, updateUser);

userRouter.route("/:id").get(authenticateUser, getSingleUser);

module.exports = userRouter;
