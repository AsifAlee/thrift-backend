const createTokenUser = (user) => {
  return { id: user._id, email: user.email, role: user.role };
};

module.exports = createTokenUser;
