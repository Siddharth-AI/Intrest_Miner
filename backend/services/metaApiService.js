const axios = require("axios");

// Get Ad Accounts
async function getAdAccounts(token) {
  try {
    const res = await axios.get(`https://graph.facebook.com/v19.0/me/adaccounts`, {
      params: {
        access_token: token,
        fields: "name,account_status,currency,spend_cap"
      }
    });
    return res.data.data;
  } catch (err) {
    console.error("Meta API Error:", err.response?.data || err.message);
    throw err;
  }
}
// Get Campaigns with optional filters (status, objective)
async function getCampaigns(adAccountId, token, filters = {}) {
  try {
    const params = {
      access_token: token,
      fields: "id,name,objective,status,start_time,stop_time,daily_budget,lifetime_budget,source_campaign_id",
      ...filters // <-- dynamic filters from controller
    };

    const res = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/campaigns`, { params });
    return res.data.data;
  } catch (err) {
    console.error("Meta API Error:", err.response?.data || err.message);
    throw err;
  }
}

async function getCampaignInsights(campaignId, token, filters = {}) {
  const params = {
    access_token: token,
    level: "ad",
    date_preset: "maximum",
    fields: "account_currency,account_id,account_name,campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,date_start,date_stop,impressions,clicks,reach,spend,ctr,cpc,cpp,actions,action_values,conversions,conversion_values,converted_product_quantity,converted_product_value,objective,buying_type,full_view_impressions,full_view_reach,cost_per_15_sec_video_view,cost_per_action_type",
    action_breakdowns: "action_type",
    ...filters
  };
  const res = await axios.get(`https://graph.facebook.com/v19.0/${campaignId}/insights`, { params });
  return res.data.data;
}
module.exports = { getAdAccounts, getCampaigns, getCampaignInsights };