const axios = require('axios');
const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/search-history", require("./searchHistoryRoutes"));
router.use("/subscription-plans", require("./subscriptionPlanRoutes"));
router.use("/subscriptions", require("./subscriptionRoutes"));
router.use("/billing", require("./billingRoutes"));
router.use("/facebook", require("./facebookRoutes"));
router.use("/business", require("./businessRoutes"));



module.exports = router;
