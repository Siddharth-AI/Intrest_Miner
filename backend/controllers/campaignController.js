const { getTokenFromHeader } = require("../utils/helper");
const { getCampaigns } = require("../services/metaApiService");

// 1️⃣ All campaigns
const fetchCampaigns = async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    const data = await getCampaigns(req.params.adAccountId, token);
    res.json(data); ``
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2️⃣ Campaigns by status
const fetchCampaignsByStatus = async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    const { status } = req.query;
    console.log(status);
    if (!status) return res.status(400).json({ error: "status query param required" });

    const filters = { effective_status: status.split(",") };
    const data = await getCampaigns(req.params.adAccountId, token, filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3️⃣ Campaigns by objective
const fetchCampaignsByObjective = async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    const { objective } = req.query;
    if (!objective) return res.status(400).json({ error: "objective query param required" });

    // Fetch all campaigns
    const allCampaigns = await getCampaigns(req.params.adAccountId, token);

    // Filter by objective manually
    const filtered = allCampaigns.filter(c => c.objective === objective.toUpperCase());

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { fetchCampaigns, fetchCampaignsByStatus, fetchCampaignsByObjective };