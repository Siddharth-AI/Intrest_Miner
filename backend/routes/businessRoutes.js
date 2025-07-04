const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const {
  checkSubscriptionLimits,
  updateSearchUsage,
} = require("../middlewares/subscriptionMiddleware");
const {
  validateBusinessInterest,
} = require("../middlewares/businessValidators");
const {
  generateBusinessInterests,
} = require("../controllers/businessController");
const {
  storeFormDetails,
} = require("../controllers/businessController");
// All routes require authentication and active subscription
router.use(authenticateUser);

// Generate business interests (requires active subscription)
router.post(
  "/generate-interests",
  validateBusinessInterest,
  // checkSubscriptionLimits,
  generateBusinessInterests,
  updateSearchUsage
);
router.post(
  "/businesSearchistory",
  storeFormDetails
);


module.exports = router;
