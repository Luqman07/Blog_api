const validator = require("validator");

// function for valiating email and password when user register
const validateRegistration = (req, res, next) => {
  const { email, password } = req.body;
  if (!validator.isEmail(email) && password === "")
    throw new Error("Email or password is required");
  next();
};

module.exports = validateRegistration