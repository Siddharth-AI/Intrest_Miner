const express = require("express");
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword,
} = require("../middlewares/authValidators");
const { authenticateUser } = require("../middlewares/authMiddleware")
const {
  register,
  login,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getProfile,
} = require("../controllers/authControllers");
const { updateProfile } = require('../controllers/authControllers'); 
const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/logout",logout);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/verify-otp", validateVerifyOtp, verifyOtp);
router.post("/reset-password", validateResetPassword, resetPassword);
router.get('/profile-data',authenticateUser,getProfile);
router.put('/update-profile', authenticateUser, updateProfile);


module.exports = router;
