const express = require("express");
const { fetchCampaigns, fetchCampaignsByStatus, fetchCampaignsByObjective } = require("../controllers/campaignController");

const router = express.Router();

// 1️⃣ Get all campaigns for an AdAccount
router.get("/:adAccountId", fetchCampaigns);

// 2️⃣ Get campaigns filtered by status
router.get("/:adAccountId/status", fetchCampaignsByStatus);

// 3️⃣ Get campaigns filtered by objective
router.get("/:adAccountId/objective", fetchCampaignsByObjective);

module.exports = router;
