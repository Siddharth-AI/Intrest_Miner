const axios = require("axios");
const { customResponse } = require("../utils/customResponse");
const { checkAndRefreshToken } = require("../utils/facebookTokenManager");

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
};
