const axios = require("axios");

// Exchange authorization code for access token
const exchangeCodeForToken = async (code) => {
  try {
    const response = await axios.get('https://graph.facebook.com/oauth/access_token', {
      params: {
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code: code
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('❌ Code to token exchange error:', error.response?.data);
    throw new Error('Failed to exchange code for access token');
  }
};

// Exchange short-lived token for long-lived token
const exchangeForLongLivedToken = async (shortLivedToken) => {
  try {
    const response = await axios.get('https://graph.facebook.com/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        fb_exchange_token: shortLivedToken
      }
    });

    return {
      access_token: response.data.access_token,
      expires_in: response.data.expires_in || 5184000 // 60 days default
    };
  } catch (error) {
    console.error('❌ Long-lived token exchange error:', error.response?.data);
    throw new Error('Failed to exchange for long-lived token');
  }
};

// Get user profile from Facebook
const getUserProfile = async (accessToken) => {
  try {
    const response = await axios.get('https://graph.facebook.com/me', {
      params: {
        access_token: accessToken,
        fields: 'id,name,email,picture.type(large)'
      }
    });

    return response.data;
  } catch (error) {
    console.error('❌ Get user profile error:', error.response?.data);
    throw new Error('Failed to get user profile from Facebook');
  }
};

// Generate Facebook OAuth URL
const generateAuthUrl = (state = 'dashboard') => {
  const scopes = 'email,public_profile,ads_read,ads_management,business_management';

  return `https://www.facebook.com/v19.0/dialog/oauth?` +
    `client_id=${process.env.FB_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI)}&` +
    `scope=${scopes}&` +
    `response_type=code&` +
    `state=${state}`;
};

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

// Get Campaign Insights
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

module.exports = {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getUserProfile,
  getAdAccounts,
  getCampaigns,
  getCampaignInsights,
  generateAuthUrl
};
