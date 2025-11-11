const express = require("express");
const { insightsReport } = require("../controllers/insightsController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();
// Unified insights endpoint
router.post("/", authenticateUser, insightsReport);

module.exports = router;
