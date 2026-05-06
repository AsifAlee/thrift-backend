const { StatusCodes } = require("http-status-codes");
const bcyrpt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail.js");
const {
  CustomAPIError,
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
} = require("../errors/index.js");
const User = require("../models/User");
const { attachCookiesToResponse, createJWTToken } = require("../utils/jwt.js");
const createTokenUser = require("../utils/createTokenUser.js");

const register = async (req, res) => {
  let { name, email, password } = req.body;
  const emailAlreadyExists = await User.findOne({ email: email });
  const isFirstUser = (await User.countDocuments()) == 0;
  const role = isFirstUser ? "admin" : "user";

  if (emailAlreadyExists) {
    throw new BadRequestError("Email already Registered!");
  }
  const salt = await bcyrpt.genSalt(10);
  password = await bcyrpt.hash(password, salt);
  const user = await User.create({ name, email, password, role });
  const payload = createTokenUser(user);
  attachCookiesToResponse(res, payload);

  res
    .status(StatusCodes.CREATED)
    .json({ user, message: "User registered successfully" });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email: email });

  // console.log("the current user:", user);
  if (!user) throw new NotFoundError("User not found");
  const payload = createTokenUser(user);
  const isPasswordMatched = await bcyrpt.compare(password, user.password);
  if (!isPasswordMatched) throw new UnauthenticatedError("Incorrect Password!");
  attachCookiesToResponse(res, payload);
  const token = createJWTToken(payload);

  // res.status(StatusCodes.OK).json({
  //   user,
  //   token,
  //   message: "Login Success!",
  // });

  res.status(StatusCodes.OK).json({
    ...user._doc,
    token,
    message: "Login Success dear!",
  });
};
const logout = async (req, res) => {
  res.cookie("token", "logout", {
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({
    msg: "Logout successfully!",
  });
};

const forgotPassword = async (req, res) => {
  // res.send("forgot password called");
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `Forgot your password?\nClick here to reset: ${resetURL}`;
  // console.log("email message", message);

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      text: message,
    });

    res.status(200).json({ msg: "Reset link sent to email" });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({ msg: "Email could not be sent" });
  }
};

const resetPassword = async (req, res) => {
  // res.send("reset password callled");
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  // console.log("hashed token :", hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ msg: "Token is invalid or expired" });
  }
  const salt = await bcyrpt.genSalt(10);
  user.password = await bcyrpt.hash(password, salt);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.status(200).json({ msg: "Password reset successful" });
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
