const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
} = require("../controllers/authController");
const validateRegistration = require("../middleware/validateRegistration");

// Register
router.post("/register", validateRegistration, register);
//Login
router.post("/login", validateRegistration, login);
// Refresh
router.post("/refresh", refresh);
// Logout
router.post("/logout", logout);

module.exports = router;
