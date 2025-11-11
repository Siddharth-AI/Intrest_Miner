const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const {
  validateCoupon,
  getCouponUsageHistory
} = require("../controllers/couponController");

// All routes require authentication
router.use(authenticateUser);

// Coupon validation
router.post("/validate", validateCoupon);

// Get user's coupon usage history
router.get("/usage-history", getCouponUsageHistory);

module.exports = router;
