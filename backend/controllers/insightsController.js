
// ========================================
// COMPLETE insightsController.js
// ========================================

const { adjustDateRange } = require("../utils/helper");
const { getCampaigns, getCampaignInsights } = require("../services/metaApiService");
const { calculateTotals, recommendCampaign, getPerformanceCategory } = require("../utils/calculateKpi");
const { getFacebookToken } = require("../models/facebookModel");
const { analyzeAndEnrichCampaigns } = require("../utils/aiAnalysisService");

const insightsReport = async (req, res) => {
  try {
    const userUuid = req.user.uuid;

    // Get user's Facebook token from database
    const userFacebookToken = await getFacebookToken(userUuid);
    if (!userFacebookToken) {
      return res.status(400).json({
        success: false,
        error: 'Facebook account not connected. Please connect your Facebook account first.'
      });
    }

    const { mode, adAccountId, campaignId, date_start, date_stop, campaign_status, objective, enableAI = false } = req.body;

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

      let campaignsForAnalysis = [];

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

        const totalConversions = totals.actions.purchase + totals.actions.add_to_cart +
          totals.actions.initiate_checkout + totals.actions.add_payment_info;

        const avgCTR = totals.ctr;
        const avgCPM = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
        const avgCPA = totalConversions > 0 ? totals.spend / totalConversions : 0;
        const avgROAS = totals.spend > 0
          ? (totals.revenue / totals.spend)
          : 0;

        campaignsForAnalysis.push({
          ...campaign,
          totals,
          campaignName: campaign.name,
          id: campaign.id,
          objective: campaign.objective || 'Not specified',
          totalSpend: totals.spend,
          totalImpressions: totals.impressions,
          totalClicks: totals.clicks,
          totalReach: totals.reach,
          avgCTR: avgCTR,
          avgCPM: avgCPM,
          avgCPC: totals.cpc,
          totalPurchases: totals.actions.purchase,
          totalAddToCart: totals.actions.add_to_cart,
          totalInitiateCheckout: totals.actions.initiate_checkout,
          totalAddPaymentInfo: totals.actions.add_payment_info,
          totalConversions: totalConversions,
          totalRevenue: totals.revenue || 0,
          avgCPA: avgCPA,
          avgROAS: avgROAS,
          hasData: insights.length > 0
        });

        // Accumulate totals
        overallTotals.impressions += totals.impressions;
        overallTotals.clicks += totals.clicks;
        overallTotals.reach += totals.reach;
        overallTotals.spend += totals.spend;
        overallTotals.total_leads += totals.total_leads;
        overallTotals.total_lead_value += totals.total_lead_value;

        for (let key in totals.actions) {
          overallTotals.actions[key] = (overallTotals.actions[key] || 0) + totals.actions[key];
        }

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

      if (overallTotals.total_leads > 0) {
        overallTotals.average_lead_cost = overallTotals.total_lead_value / overallTotals.total_leads;
      }

      // 🔥 CONDITIONAL AI: Only if enableAI = true
      let campaignsWithAI;

      if (enableAI === true) {
        console.log(`🤖 AI ENABLED: Running AI analysis on ${campaignsForAnalysis.length} campaigns...`);
        campaignsWithAI = await analyzeAndEnrichCampaigns(campaignsForAnalysis, overallTotals.spend);
      } else {
        console.log(`📊 AI DISABLED: Using rule-based analysis (FREE)`);

        // 🔥 FIXED: Create verdict using getPerformanceCategory (no classifyCampaign needed)
        campaignsWithAI = campaignsForAnalysis.map(campaign => {
          const category = getPerformanceCategory(campaign, campaign.totals);
          return {
            ...campaign,
            verdict: {
              category: category,
              description: `Performance level: ${category}`
            }
          };
        });
      }

      // 🔥 Categorize: Use AI verdict if available, else old verdict
      const excellentCampaigns = campaignsWithAI.filter(c => {
        if (enableAI && c.ai_verdict) {
          return c.ai_verdict?.includes('Excellent');
        } else {
          const category = getPerformanceCategory(c, c.totals);
          return category === 'excellent';
        }
      });

      const stableCampaigns = campaignsWithAI.filter(c => {
        if (enableAI && c.ai_verdict) {
          return c.ai_verdict?.includes('Good') || c.ai_verdict?.toLowerCase().includes('stable');
        } else {
          const category = getPerformanceCategory(c, c.totals);
          return category === 'stable';
        }
      });

      const moderateCampaigns = campaignsWithAI.filter(c => {
        if (enableAI && c.ai_verdict) {
          return c.ai_verdict?.includes('Average');
        } else {
          const category = getPerformanceCategory(c, c.totals);
          return category === 'moderate';
        }
      });

      const underperforming = campaignsWithAI.filter(c => {
        if (enableAI && c.ai_verdict) {
          return c.ai_verdict?.includes('Needs') || c.ai_verdict?.includes('Poor');
        } else {
          const category = getPerformanceCategory(c, c.totals);
          return category === 'underperforming';
        }
      });

      // Find top campaign
      const topCampaign = campaignsWithAI.length > 0 ? campaignsWithAI.reduce((best, current) => {
        const currentScore = (current.totalClicks || 0) +
          5 * (current.totalPurchases || 0) +
          3 * (current.totals?.actions?.lead || 0) -
          (current.totalSpend || 0) / 50;
        const bestScore = (best.totalClicks || 0) +
          5 * (best.totalPurchases || 0) +
          3 * (best.totals?.actions?.lead || 0) -
          (best.totalSpend || 0) / 50;
        return currentScore > bestScore ? current : best;
      }, campaignsWithAI) : null;

      return res.json({
        mode,
        overallTotals,
        campaignAnalysis: campaignsWithAI,
        topCampaign,
        excellentCampaigns,
        stableCampaigns,
        moderateCampaigns,
        underperforming,
        aiEnabled: enableAI
      });
    }

    return res.status(400).json({ error: "Invalid mode. Use 'single' or 'analyze'." });

  } catch (err) {
    console.error('❌ Error in insightsReport:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { insightsReport };
