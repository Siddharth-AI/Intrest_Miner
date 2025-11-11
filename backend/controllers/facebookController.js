const axios = require("axios");
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // Add this import
const { checkAndRefreshToken } = require("../utils/facebookTokenManager");
const {
  findUserByFacebookId,
  findUserByEmail,
  findUserById,
  createUserWithFacebook,
  linkFacebookToUser,
  updateFacebookToken,
  getUserFacebookStatus,
  unlinkFacebookAccount
} = require('../models/facebookModel');

// Import service functions
const {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getUserProfile,
  generateAuthUrl
} = require('../services/metaApiService');
const { findConnection, findUserConnections } = require("../models/facebookConnectionModel");


// ==================== PUBLIC ROUTES ====================

const initiateFacebookLogin = async (req, res) => {
  try {
    console.log("🚀 Initiating Facebook OAuth login...");

    // Get current user from JWT token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    let currentUserId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.user_id;
        console.log("🔍 Found current user ID:", currentUserId);
      } catch (err) {
        console.log("⚠️ Invalid token, proceeding without user context");
      }
    }

    // Pass user ID in state parameter
    const state = currentUserId ? `dashboard_${currentUserId}` : 'dashboard';
    const fbAuthUrl = generateAuthUrl(state);

    console.log("✅ Facebook OAuth URL generated with state:", state);

    return res.status(200).json({
      success: true,
      data: {
        authUrl: fbAuthUrl
      }
    });

  } catch (error) {
    console.error("❌ Facebook login initiation error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to initiate Facebook login'
    });
  }
};

const handleFacebookCallback = async (req, res) => {
  try {
    const { code, state, error } = req.query;

    console.log("📝 Processing Facebook OAuth callback with state:", state);

    // Extract user ID from state
    const stateUserId = state && state.startsWith('dashboard_')
      ? state.replace('dashboard_', '')
      : null;

    console.log("🔍 Extracted user ID from state:", stateUserId);

    if (error) {
      console.error("❌ Facebook OAuth error:", error);
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=facebook_auth_denied`);
    }

    if (!code) {
      console.error("❌ No authorization code provided");
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=no_auth_code`);
    }

    // Step 1: Exchange code for short-lived token
    const shortLivedToken = await exchangeCodeForToken(code);
    console.log("✅ Got short-lived token");

    // Step 2: Exchange for long-lived token
    const longTokenData = await exchangeForLongLivedToken(shortLivedToken);
    console.log("✅ Exchanged for long-lived token");

    // Step 3: Get user profile from Facebook
    const fbProfile = await getUserProfile(longTokenData.access_token);
    console.log("✅ Retrieved user profile:", fbProfile.name);

    let user = null;

    // Step 4: If we have user ID from state, use that user (PRIORITY)
    if (stateUserId) {
      console.log("🎯 Using current logged-in user from state");
      const currentUser = await findUserById(parseInt(stateUserId));

      if (currentUser) {
        // Link Facebook to the current logged-in user
        await linkFacebookToUser(currentUser.uuid, {
          fb_user_id: fbProfile.id,
          fb_access_token: longTokenData.access_token,
          fb_token_expires_in: longTokenData.expires_in
        });
        console.log("✅ Linked Facebook to current logged-in user");
        user = currentUser;
      } else {
        console.error("❌ Current user not found in database");
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=user_not_found`);
      }
    }
    // Step 5: Fallback - check by Facebook ID or email
    else {
      const existingFacebookUsers = await findUserByFacebookId(fbProfile.id);

      if (existingFacebookUsers && existingFacebookUsers.length > 0) {
        // Use first user with this Facebook connection
        const existingUser = existingFacebookUsers[0];
        await updateFacebookToken(existingUser.id, {
          fb_access_token: longTokenData.access_token,
          fb_token_expires_in: longTokenData.expires_in
        });
        user = existingUser;
        console.log("✅ Updated existing Facebook user's token");
      } else {
        // Check if user exists by email
        const existingEmailUser = await findUserByEmail(fbProfile.email);

        if (existingEmailUser) {
          // Link Facebook to existing user account
          await linkFacebookToUser(existingEmailUser.id, {
            fb_user_id: fbProfile.id,
            fb_access_token: longTokenData.access_token,
            fb_token_expires_in: longTokenData.expires_in
          });
          user = existingEmailUser;
          console.log("✅ Linked Facebook to existing user account by email");
        } else {
          // Create new user with Facebook (last resort)
          user = await createUserWithFacebook({
            uuid: uuidv4(),
            name: fbProfile.name,
            email: fbProfile.email || `fb_${fbProfile.id}@facebook.com`,
            fb_user_id: fbProfile.id,
            fb_access_token: longTokenData.access_token,
            fb_token_expires_in: longTokenData.expires_in,
            avatar_path: fbProfile.picture?.data?.url
          });
          console.log("✅ Created new user with Facebook");
        }
      }
    }

    // Step 6: Generate JWT token for app authentication
    const jwtToken = jwt.sign(
      {
        uuid: user.uuid,
        user_id: user.id,
        facebook_id: fbProfile.id,
        email: user.email
      },
      process.env.JWT_SECRET
    );

    // Step 7: Always redirect to dashboard with success indication
    const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?token=${jwtToken}&facebook_connected=true`;

    console.log("🎉 Facebook OAuth completed successfully");
    res.redirect(redirectUrl);

  } catch (error) {
    console.error("❌ Facebook callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=auth_failed`);
  }
};

// ==================== PROTECTED ROUTES ====================

const getFacebookStatus = async (req, res) => {
  try {
    const userUuid = req.user.uuid; // Use UUID
    console.log(`🔍 Getting Facebook status for user: ${userUuid}`);

    const statusData = await getUserFacebookStatus(userUuid);
    console.log("🔍 Status data:", statusData);

    if (!statusData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // 🔥 NEW: Get token expiry from primary_connection data (no need to query users table)
    if (statusData.facebook_connected && statusData.facebook_token_valid && statusData.primary_connection) {
      const primaryConnection = statusData.primary_connection;
      console.log("🔍 Primary connection found:", primaryConnection);

      const tokenUpdatedAt = new Date(primaryConnection.fb_token_updated_at);
      const expiresAt = new Date(tokenUpdatedAt.getTime() + (primaryConnection.fb_token_expires_in * 1000));
      const daysUntilExpiry = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));

      statusData.token_expires_in_days = daysUntilExpiry;
      statusData.token_expires_at = expiresAt;

      console.log("✅ Token expiry calculated:", {
        tokenUpdatedAt,
        expiresAt,
        daysUntilExpiry
      });
    }

    return res.status(200).json({
      success: true,
      data: statusData
    });

  } catch (error) {
    console.error("❌ Get Facebook status error:", error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get Facebook status'
    });
  }
};



const unlinkFacebook = async (req, res) => {
  try {
    const userUuid = req.user.uuid; // Get UUID from JWT token
    const connectionId = req.params.connectionId; // Get connection ID from URL params (optional)

    console.log(`🔗 Unlinking Facebook connection - User: ${userUuid}, ConnectionID: ${connectionId || 'ALL'}`);

    if (connectionId) {
      // Unlink specific connection
      // First, get the fb_user_id for this connection
      const connections = await findUserConnections(userUuid);
      const targetConnection = connections.find(conn => conn.id === parseInt(connectionId));

      if (!targetConnection) {
        return res.status(404).json({
          success: false,
          error: 'Facebook connection not found'
        });
      }

      await unlinkFacebookAccount(userUuid, targetConnection.fb_user_id);
      console.log(`✅ Specific Facebook connection unlinked: ${connectionId}`);

      return res.status(200).json({
        success: true,
        message: 'Facebook connection unlinked successfully',
        connectionId: connectionId
      });
    } else {
      // Unlink all connections
      await unlinkFacebookAccount(userUuid);
      console.log(`✅ All Facebook connections unlinked for user: ${userUuid}`);

      return res.status(200).json({
        success: true,
        message: 'All Facebook connections unlinked successfully'
      });
    }

  } catch (error) {
    console.error("❌ Unlink Facebook error:", error);
    return res.status(500).json({
      success: false,
      error: 'Failed to unlink Facebook account'
    });
  }
};


// Search Facebook Ad Interests
const searchAdInterests = async (req, res) => {
  try {
    const { query, limit = 1000 } = req.body;
    const user_uuid = req.user.uuid;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return customResponse("Search query is required", 400, false)(req, res);
    }

    // Check and refresh token if needed
    await checkAndRefreshToken();

    const accessToken = process.env.FB_ACCESS_TOKEN;
    // console.log(accessToken, "===============>token")
    if (!accessToken) {
      return customResponse(
        "Facebook access token not configured",
        500,
        false
      )(req, res);
    }

    // Make request to Facebook Graph API
    const facebookApiUrl = `https://graph.facebook.com/v18.0/search`;
    const params = {
      type: "adinterest",
      q: query.trim(),
      limit: Math.min(limit, 1000), // Facebook API limit
      access_token: accessToken,
    };

    console.log(`Searching Facebook Ad Interests for: "${query}"`);

    const response = await axios.get(facebookApiUrl, { params });

    // Check if the response is successful
    if (response.data.error) {
      console.error("Facebook API Error:", response.data.error);
      return customResponse(
        `Facebook API Error: ${response.data.error.message}`,
        400,
        false
      )(req, res);
    }

    const interests = response.data.data || [];
    const paging = response.data.paging || {};

    // Format the response
    const formattedInterests = interests.map((interest) => ({
      id: interest.id,
      name: interest.name,
      audience_size: interest.audience_size || 0,
      audience_size_lower_bound: interest.audience_size_lower_bound || 0,
      audience_size_upper_bound: interest.audience_size_upper_bound || 0,
      path: interest.path || [],
      description: interest.description || "",
      topic: interest.topic || "",
    }));

    return res.status(200).json({
      message: "Ad interests retrieved successfully",
      status: 200,
      success: true,
      data: {
        query: query.trim(),
        total_results: formattedInterests.length,
        interests: formattedInterests,
        paging: paging,
      },
    });
  } catch (error) {
    console.error("Facebook search error:", error);

    // Handle specific Facebook API errors
    if (error.response && error.response.data && error.response.data.error) {
      const fbError = error.response.data.error;

      // Token expired or invalid
      if (fbError.code === 190 || fbError.subcode === 463) {
        return customResponse(
          "Facebook access token expired or invalid. Please contact administrator.",
          401,
          false
        )(req, res);
      }

      // Rate limit exceeded
      if (fbError.code === 4 || fbError.code === 17) {
        return customResponse(
          "Facebook API rate limit exceeded. Please try again later.",
          429,
          false
        )(req, res);
      }

      return customResponse(
        `Facebook API Error: ${fbError.message}`,
        400,
        false
      )(req, res);
    }

    // Network or other errors
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return customResponse(
        "Unable to connect to Facebook API. Please check your internet connection.",
        503,
        false
      )(req, res);
    }

    return customResponse(
      "Failed to search ad interests",
      500,
      false
    )(req, res);
  }
};

// Get Facebook API status and token info
const getApiStatus = async (req, res) => {
  try {
    const accessToken = process.env.FB_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(200).json({
        status: 200,
        success: true,
        data: {
          configured: false,
          message: "Facebook access token not configured",
        },
      });
    }

    // Test the token by making a simple API call
    try {
      const testUrl = "https://graph.facebook.com/v18.0/me";
      const response = await axios.get(testUrl, {
        params: { access_token: accessToken },
      });

      return res.status(200).json({
        status: 200,
        success: true,
        data: {
          configured: true,
          valid: true,
          app_id: response.data.id || "Unknown",
          message: "Facebook API is working correctly",
        },
      });
    } catch (error) {
      return res.status(200).json({
        status: 200,
        success: true,
        data: {
          configured: true,
          valid: false,
          error:
            error.response?.data?.error?.message || "Token validation failed",
          message: "Facebook access token may be expired or invalid",
        },
      });
    }
  } catch (error) {
    console.error("API status check error:", error);
    return customResponse("Failed to check API status", 500, false)(req, res);
  }
};

// Manual token refresh (Admin only)
const refreshToken = async (req, res) => {
  try {
    const result = await checkAndRefreshToken(true); // Force refresh

    if (result.success) {
      return res.status(200).json({
        message: "Token refreshed successfully",
        status: 200,
        success: true,
        data: {
          refreshed: true,
          expires_in: result.expires_in,
          message: "New token has been saved to environment",
        },
      });
    } else {
      return customResponse(
        result.message || "Failed to refresh token",
        500,
        false
      )(req, res);
    }
  } catch (error) {
    console.error("Manual token refresh error:", error);
    return customResponse("Failed to refresh token", 500, false)(req, res);
  }
};


module.exports = {
  searchAdInterests,
  getApiStatus,
  refreshToken,
  initiateFacebookLogin,
  handleFacebookCallback,
  getFacebookStatus,
  unlinkFacebook
};
