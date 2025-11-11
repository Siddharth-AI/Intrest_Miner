const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const {
  initiateFacebookLogin,
  handleFacebookCallback,
  getFacebookStatus,
  unlinkFacebook,
  searchAdInterests,
  getApiStatus,
  refreshToken,
} = require("../controllers/facebookController");

const {
  checkSubscriptionLimits,
  updateSearchUsage,
  checkAdminAccess,
} = require("../middlewares/subscriptionMiddleware");
const {
  validateSearchAdInterests,
} = require("../middlewares/facebookValidators");

// Public routes for Facebook and OAuth
router.get("/facebooktokenstatus", getApiStatus);
router.get("/login", initiateFacebookLogin);
router.get("/callback", handleFacebookCallback);

// ==================== PROTECTED ROUTES ====================
router.get("/status", authenticateUser, getFacebookStatus);

// 🔥 NEW: Add specific connection unlink route FIRST
router.delete("/unlink/:connectionId", authenticateUser, unlinkFacebook);

// Keep the existing unlink route for unlinking ALL connections
router.delete("/unlink", authenticateUser, unlinkFacebook);

// Search ad interests (requires active subscription)
router.post(
  "/search", authenticateUser,
  validateSearchAdInterests,
  searchAdInterests,
  updateSearchUsage
);

// Admin only routes
router.post("/refresh-token", authenticateUser, refreshToken);

module.exports = router;
