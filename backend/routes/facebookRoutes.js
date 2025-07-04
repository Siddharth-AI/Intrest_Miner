const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const {
  checkSubscriptionLimits,
  updateSearchUsage,
  checkAdminAccess,
} = require("../middlewares/subscriptionMiddleware");
const {
  validateSearchAdInterests,
} = require("../middlewares/facebookValidators");
const {
  searchAdInterests,
  getApiStatus,
  refreshToken,
} = require("../controllers/facebookController");

// Public route for API status
router.get("/status", getApiStatus);

// Protected routes (require authentication)
router.use(authenticateUser);

// Search ad interests (requires active subscription)
router.post(
  "/search",
  validateSearchAdInterests,
  searchAdInterests,
  updateSearchUsage
);

// Admin only routes
router.post("/refresh-token", refreshToken);

module.exports = router;
