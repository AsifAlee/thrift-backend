const bcrypt = require("bcryptjs/dist/bcrypt");
const { NotFoundError, BadRequestError } = require("../errors");
const User = require("../models/User");
const { createTokenUser } = require("../utils");
const { attachCookiesToResponse } = require("../utils/jwt");
const { StatusCodes } = require("http-status-codes");
const checkPermission = require("../utils/checkPermission");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.send(users);
};
const getSingleUser = async (req, res) => {
  // console.log("single user:", req.user);
  const user = await User.findById({ _id: req.params.id }).select("-password");

  if (!user)
    throw new NotFoundError(`User not found with id: ${req.params.id}`);
  checkPermission(req.user, req.params.id);
  res.send(user);
};
const showCurrentUser = (req, res) => {
  // console.log("current user:", req.user);
  res.json({ user: req.user });
};
const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) throw new BadRequestError("Please provide the details");
  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { name: name, email: email },
    { new: true, runValidators: true }
  );
  const payload = createTokenUser(user);
  attachCookiesToResponse(res, payload);
  res
    .status(StatusCodes.OK)
    .json({ user: payload, msg: "User Updated successfully!" });
};
const updatePassword = async (req, res) => {
  const { body } = req;
  const { oldPassword, newPassword } = body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Please provide both the passwords");
  }
  const userId = req.user.userId;
  const user = await User.findById({ _id: userId });
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  // console.log("is Match:", isMatch);
  if (!isMatch) {
    throw new NotFoundError("Password Do not match");
  }
  const newHashedPwd = await bcrypt.hash(newPassword, 10);
  user.password = newHashedPwd;
  await user.save();

  res.status(200).json({ msg: "Password reset success!" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updatePassword,
};
