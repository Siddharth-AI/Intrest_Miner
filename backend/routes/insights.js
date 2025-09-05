const express = require("express");
const { insightsReport } = require("../controllers/insightsController");

const router = express.Router();
// Unified insights endpoint
router.post("/", insightsReport);

module.exports = router;
