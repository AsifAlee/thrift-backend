const { UnauthenticatedError } = require("../errors");
const UnAuthorizedError = require("../errors/unauthorized");
const { isValidToken } = require("../utils/jwt");

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication invalid" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = isValidToken(token);
    req.user = { userId: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication Invalid");
  }
};
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    // console.log("user is:", req.user);

    if (!roles.includes(req.user.role)) {
      throw new UnAuthorizedError("Unauthorized to access this route");
    }
    next();
  };
};
const optionalAuth = (req, res, next) => {
  console.log("optional auth called:");
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // no user → guest
  }

  const token = authHeader.split(" ")[1];
  console.log("optional auth token:", token);

  try {
    const payload = isValidToken(token);

    req.user = { userId: payload.id, email: payload.email, role: payload.role };
  } catch (err) {
    // invalid token → treat as guest
    console.log("Invalid token");
  }

  next();
};
module.exports = { authenticateUser, authorizePermissions, optionalAuth };
