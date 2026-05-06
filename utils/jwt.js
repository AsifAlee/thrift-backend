const jwt = require("jsonwebtoken");
const createJWTToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  return token;
};

const isValidToken = (token) => {
  const isMatch = jwt.verify(token, process.env.JWT_SECRET);
  return isMatch;
};

const attachCookiesToResponse = (res, tokenUser) => {
  const token = createJWTToken(tokenUser);
  res.cookie("token", token, {
    httpOnly: true,
    signed: true,
    secure: process.env.NODE_ENV == "production",
  });
};

module.exports = { createJWTToken, isValidToken, attachCookiesToResponse };
