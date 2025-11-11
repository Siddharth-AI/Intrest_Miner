const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/search-history", require("./searchHistoryRoutes"));
router.use("/subscription-plans", require("./subscriptionPlanRoutes"));
router.use("/subscriptions", require("./subscriptionRoutes"));
router.use("/billing", require("./billingRoutes"));
router.use("/api/facebook", require("./facebookRoutes"));
router.use("/business", require("./businessRoutes"));
router.use("/onboarding", require("./onboarding"));

module.exports = router;
