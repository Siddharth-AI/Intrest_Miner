const { adjustDateRange, classifyCampaign, getTokenFromHeader } = require("../utils/helper");
const { getCampaigns, getCampaignInsights } = require("../services/metaApiService");
const { calculateTotals, recommendCampaign } = require("../utils/calculateKpi");


const insightsReport = async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    const { mode, adAccountId, campaignId, date_start, date_stop, campaign_status, objective } = req.body;

    if (!adAccountId) return res.status(400).json({ error: "adAccountId is required in body" });

    // ========== MODE: SINGLE ==========
    if (mode === "single") {
      if (!campaignId) return res.status(400).json({ error: "campaignId is required for single mode" });

      const campaigns = await getCampaigns(adAccountId, token);
      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });

      let filters = {};
      if (date_start && date_stop) {
        const { since, until } = adjustDateRange(date_start, date_stop, campaign);
        filters.time_range = JSON.stringify({ since, until });
      } else {
        filters.date_preset = "maximum"; // fallback
      }
      const insights = await getCampaignInsights(campaignId, token, filters);
      const totals = calculateTotals(insights);

      return res.json({ mode, campaignId, campaign_name: campaign.name, totals, insights });
    }

    // ========== MODE: ANALYZE ==========
    if (mode === "analyze") {
      const campaigns = await getCampaigns(adAccountId, token);
      let campaignAnalysis = [];
      let overallTotals = {
        impressions: 0,
        clicks: 0,
        reach: 0,
        spend: 0,
        ctr: 0,
        cpc: 0,
        cpp: 0,
        actions: { add_to_cart: 0, purchase: 0, initiate_checkout: 0, add_payment_info: 0 }
      };

      for (let campaign of campaigns) {
        if ((campaign_status && campaign.status !== campaign_status) ||
          (objective && campaign.objective !== objective)) continue;

        let filters = {};
        if (date_start && date_stop) {
          const { since, until } = adjustDateRange(date_start, date_stop, campaign);
          filters.time_range = JSON.stringify({ since, until });
        } else {
          filters.date_preset = "maximum";
        }

        const insights = await getCampaignInsights(campaign.id, token, filters);
        const totals = calculateTotals(insights);

        // 🔮 classify each campaign
        const verdict = classifyCampaign(campaign, totals);

        campaignAnalysis.push({ ...campaign, totals, verdict });

        // accumulate totals
        overallTotals.impressions += totals.impressions;
        overallTotals.clicks += totals.clicks;
        overallTotals.reach += totals.reach;
        overallTotals.spend += totals.spend;
        for (let key in totals.actions) {
          overallTotals.actions[key] = (overallTotals.actions[key] || 0) + totals.actions[key];
        }
      }

      overallTotals.ctr = overallTotals.clicks && overallTotals.impressions
        ? (overallTotals.clicks / overallTotals.impressions) * 100
        : 0;
      overallTotals.cpc = overallTotals.clicks ? overallTotals.spend / overallTotals.clicks : 0;
      overallTotals.cpp = overallTotals.actions.purchase ? overallTotals.spend / overallTotals.actions.purchase : 0;

      const topCampaign = recommendCampaign(campaignAnalysis);
      const stableCampaigns = campaignAnalysis.filter(c => c.totals.ctr > 1 && c.totals.cpc < 5);
      const underperforming = campaignAnalysis.filter(c => !stableCampaigns.includes(c));

      return res.json({ mode, overallTotals, campaignAnalysis, topCampaign, stableCampaigns, underperforming });
    }

    // invalid mode
    return res.status(400).json({ error: "Invalid mode. Use 'single' or 'analyze'." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { insightsReport };