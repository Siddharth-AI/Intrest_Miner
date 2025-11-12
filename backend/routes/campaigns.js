const express = require("express");
const { fetchCampaigns } = require("../controllers/campaignController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

// 1️⃣ Get all campaigns for an AdAccount
router.get("/:adAccountId", authenticateUser, fetchCampaigns);

// // 2️⃣ Get campaigns filtered by status
// router.get("/:adAccountId/status", authenticateUser, fetchCampaignsByStatus);

// // 3️⃣ Get campaigns filtered by objective
// router.get("/:adAccountId/objective", authenticateUser, fetchCampaignsByObjective);

module.exports = router;
