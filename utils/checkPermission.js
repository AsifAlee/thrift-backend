const { UnAuthorizedError } = require("../errors");

const checkPermission = (requestUser, resourceUserId) => {
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new UnAuthorizedError("You are not authorized ");
};
module.exports = checkPermission;
