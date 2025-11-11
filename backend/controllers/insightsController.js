const { adjustDateRange, classifyCampaign } = require("../utils/helper");
const { getCampaigns, getCampaignInsights } = require("../services/metaApiService");
const { calculateTotals, recommendCampaign, getPerformanceCategory } = require("../utils/calculateKpi");
const { getFacebookToken } = require("../models/facebookModel");

const insightsReport = async (req, res) => {
  try {
    const userUuid = req.user.uuid; // 🔥 CHANGED: Use UUID instead of user_id
    console.log("🔄 Fetching insights for user:", userUuid);

    // Get user's Facebook token from database (now uses connections)
    const userFacebookToken = await getFacebookToken(userUuid); // 🔥 CHANGED: Pass UUID

    if (!userFacebookToken) {
      return res.status(400).json({
        success: false,
        error: 'Facebook account not connected. Please connect your Facebook account first.'
      });
    }

    console.log("✅ Found user's Facebook token");

    const { mode, adAccountId, campaignId, date_start, date_stop, campaign_status, objective } = req.body;

    if (!adAccountId) return res.status(400).json({ error: "adAccountId is required in body" });

    // ========== MODE: SINGLE ==========
    if (mode === "single") {
      if (!campaignId) return res.status(400).json({ error: "campaignId is required for single mode" });

      const campaigns = await getCampaigns(adAccountId, userFacebookToken);
      const campaign = campaigns.find(c => c.id === campaignId);

      if (!campaign) return res.status(404).json({ error: "Campaign not found" });

      let filters = {};
      if (date_start && date_stop) {
        const { since, until } = adjustDateRange(date_start, date_stop, campaign);
        filters.time_range = JSON.stringify({ since, until });
      } else {
        filters.date_preset = "maximum";
      }

      const insights = await getCampaignInsights(campaignId, userFacebookToken, filters);
      const totals = calculateTotals(insights);

      return res.json({ mode, campaignId, campaign_name: campaign.name, totals, insights });
    }

    // ========== MODE: ANALYZE ==========
    if (mode === "analyze") {
      const campaigns = await getCampaigns(adAccountId, userFacebookToken);
      let campaignAnalysis = [];
      let overallTotals = {
        impressions: 0,
        clicks: 0,
        reach: 0,
        spend: 0,
        ctr: 0,
        cpc: 0,
        cpp: 0,
        actions: {
          add_to_cart: 0,
          purchase: 0,
          initiate_checkout: 0,
          add_payment_info: 0,
          lead: 0
        },
        cost_per_action_type: {},
        total_leads: 0,
        total_lead_value: 0,
        average_lead_cost: 0
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

        const insights = await getCampaignInsights(campaign.id, userFacebookToken, filters);
        const totals = calculateTotals(insights);

        // 🔮 classify each campaign with human-like analysis
        const verdict = classifyCampaign(campaign, totals);
        campaignAnalysis.push({ ...campaign, totals, verdict });

        // accumulate totals
        overallTotals.impressions += totals.impressions;
        overallTotals.clicks += totals.clicks;
        overallTotals.reach += totals.reach;
        overallTotals.spend += totals.spend;

        // Accumulate leads
        overallTotals.total_leads += totals.total_leads;
        overallTotals.total_lead_value += totals.total_lead_value;

        for (let key in totals.actions) {
          overallTotals.actions[key] = (overallTotals.actions[key] || 0) + totals.actions[key];
        }

        // Accumulate cost per action types
        for (let actionType in totals.cost_per_action_type) {
          if (!overallTotals.cost_per_action_type[actionType]) {
            overallTotals.cost_per_action_type[actionType] = totals.cost_per_action_type[actionType];
          } else {
            overallTotals.cost_per_action_type[actionType] += totals.cost_per_action_type[actionType];
          }
        }
      }

      // Calculate overall derived metrics
      overallTotals.ctr = overallTotals.clicks && overallTotals.impressions
        ? (overallTotals.clicks / overallTotals.impressions) * 100
        : 0;
      overallTotals.cpc = overallTotals.clicks ? overallTotals.spend / overallTotals.clicks : 0;
      overallTotals.cpp = overallTotals.actions.purchase ? overallTotals.spend / overallTotals.actions.purchase : 0;

      // Calculate overall lead metrics
      if (overallTotals.total_leads > 0) {
        overallTotals.average_lead_cost = overallTotals.total_lead_value / overallTotals.total_leads;
      }

      // 🎯 NEW IMPROVED CATEGORIZATION
      const excellentCampaigns = campaignAnalysis.filter(c => {
        const category = getPerformanceCategory(c, c.totals);
        return category === 'excellent';
      });

      const stableCampaigns = campaignAnalysis.filter(c => {
        const category = getPerformanceCategory(c, c.totals);
        return category === 'stable';
      });

      const moderateCampaigns = campaignAnalysis.filter(c => {
        const category = getPerformanceCategory(c, c.totals);
        return category === 'moderate';
      });

      const underperforming = campaignAnalysis.filter(c => {
        const category = getPerformanceCategory(c, c.totals);
        return category === 'underperforming';
      });

      const topCampaign = recommendCampaign(campaignAnalysis);

      return res.json({
        mode,
        overallTotals,
        campaignAnalysis,
        topCampaign,
        excellentCampaigns,
        stableCampaigns,
        moderateCampaigns,
        underperforming
      });
    }

    // invalid mode
    return res.status(400).json({ error: "Invalid mode. Use 'single' or 'analyze'." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { insightsReport };
