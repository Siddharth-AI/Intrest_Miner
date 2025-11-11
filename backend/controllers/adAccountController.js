const { getFacebookToken } = require('../models/facebookModel');
const { getAdAccounts } = require('../services/metaApiService');

const fetchAdAccounts = async (req, res) => {
  try {
    const userUuid = req.user.uuid; // 🔥 CHANGED: Use UUID instead of user_id
    console.log("🔄 Fetching ad accounts for user:", userUuid);

    // Get user's Facebook token from database (now uses connections)
    const userFacebookToken = await getFacebookToken(userUuid); // 🔥 CHANGED: Pass UUID

    if (!userFacebookToken) {
      return res.status(400).json({
        success: false,
        error: 'Facebook account not connected. Please connect your Facebook account first.'
      });
    }

    console.log("✅ Found user's Facebook token");

    // Use the user's Facebook token to get ad accounts
    const adAccounts = await getAdAccounts(userFacebookToken);
    console.log(`✅ Retrieved ${adAccounts.length} ad accounts`);

    return res.status(200).json(adAccounts); // Return data directly for compatibility

  } catch (error) {
    console.error("❌ Fetch ad accounts error:", error);

    // Handle specific Facebook API errors
    if (error.response?.data?.error?.code === 190) {
      return res.status(401).json({
        success: false,
        error: 'Facebook token expired. Please reconnect your Facebook account.'
      });
    }

    return res.status(500).json({
      error: error.message || 'Failed to fetch ad accounts'
    });
  }
};

module.exports = { fetchAdAccounts };
