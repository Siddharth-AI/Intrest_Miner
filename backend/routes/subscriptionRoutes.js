const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const { validateSubscribe } = require("../middlewares/subscriptionValidators");
const {
  subscribeToPlan,
  getCurrentSubscription,
  getSubscriptionHistory,
  cancelSubscription,
  changeSubscription,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/subscriptionController");

// All routes require authentication
router.use(authenticateUser);

// Subscription management
router.post("/subscribe", validateSubscribe, subscribeToPlan);
router.get("/current", getCurrentSubscription);
router.get("/history", getSubscriptionHistory);
router.post("/cancel", cancelSubscription);
router.post("/change", changeSubscription);

// Razorpay payment routes
router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);

module.exports = router;
