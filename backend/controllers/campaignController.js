const { getTokenFromHeader } = require("../utils/helper");
const { getCampaigns } = require("../services/metaApiService");
const { getFacebookToken } = require("../models/facebookModel");

// 1️⃣ All campaigns
const fetchCampaigns = async (req, res) => {
  try {
    const userUuid = req.user.uuid; // 🔥 CHANGED: Use UUID instead of user_id
    // console.log("🔄 Fetching campaigns for user:", userUuid);

    // Get user's Facebook token from database (now uses connections)
    const userFacebookToken = await getFacebookToken(userUuid); // 🔥 CHANGED: Pass UUID

    if (!userFacebookToken) {
      return res.status(400).json({
        success: false,
        error: 'Facebook account not connected. Please connect your Facebook account first.'
      });
    }

    // console.log("✅ Found user's Facebook token");
    const data = await getCampaigns(req.params.adAccountId, userFacebookToken);
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// const fetchCampaignsByStatus = async (req, res) => {
//   try {
//     const userUuid = req.user.uuid; // 🔥 CHANGED: Use UUID instead of user_id
//     console.log("🔄 Fetching campaigns by status for user:", userUuid);

//     // Get user's Facebook token from database (now uses connections)
//     const userFacebookToken = await getFacebookToken(userUuid); // 🔥 CHANGED: Pass UUID

//     if (!userFacebookToken) {
//       return res.status(400).json({
//         success: false,
//         error: 'Facebook account not connected. Please connect your Facebook account first.'
//       });
//     }

//     console.log("✅ Found user's Facebook token");
//     const { status } = req.query;
//     console.log(status);

//     if (!status) return res.status(400).json({ error: "status query param required" });

//     const filters = { effective_status: status.split(",") };
//     const data = await getCampaigns(req.params.adAccountId, userFacebookToken, filters);
//     res.json(data);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // 3️⃣ Campaigns by objective
// const fetchCampaignsByObjective = async (req, res) => {
//   try {
//     const userUuid = req.user.uuid; // 🔥 CHANGED: Use UUID instead of user_id
//     console.log("🔄 Fetching campaigns by objective for user:", userUuid);

//     // Get user's Facebook token from database (now uses connections)
//     const userFacebookToken = await getFacebookToken(userUuid); // 🔥 CHANGED: Pass UUID

//     if (!userFacebookToken) {
//       return res.status(400).json({
//         success: false,
//         error: 'Facebook account not connected. Please connect your Facebook account first.'
//       });
//     }

//     console.log("✅ Found user's Facebook token");
//     const { objective } = req.query;

//     if (!objective) return res.status(400).json({ error: "objective query param required" });

//     // Fetch all campaigns
//     const allCampaigns = await getCampaigns(req.params.adAccountId, userFacebookToken);

//     // Filter by objective manually
//     const filtered = allCampaigns.filter(c => c.objective === objective.toUpperCase());
//     res.json(filtered);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };




module.exports = { fetchCampaigns };
