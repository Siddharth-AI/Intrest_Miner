const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Check if token needs refresh and refresh if necessary
const checkAndRefreshToken = async (forceRefresh = false) => {
  try {
    const tokenCreatedAt = process.env.FB_TOKEN_CREATED_AT;
    const currentTime = new Date().getTime();

    // If no creation date is set, assume token needs refresh
    if (!tokenCreatedAt && !forceRefresh) {
      console.log("No token creation date found, skipping automatic refresh");
      return { success: false, message: "Token creation date not set" };
    }

    // Check if token is older than 50 days (50 * 24 * 60 * 60 * 1000 ms)
    const fiftyDaysInMs = 50 * 24 * 60 * 60 * 1000;
    const tokenAge = currentTime - Number.parseInt(tokenCreatedAt || "0");

    if (tokenAge > fiftyDaysInMs || forceRefresh) {
      console.log(
        "Token is older than 50 days or force refresh requested, attempting to refresh..."
      );
      return await refreshFacebookToken();
    }

    console.log("Token is still valid, no refresh needed");
    return { success: true, message: "Token is still valid" };
  } catch (error) {
    console.error("Error checking token:", error);
    return { success: false, message: error.message };
  }
};

// Refresh Facebook access token
const refreshFacebookToken = async () => {
  try {
    const appId = process.env.FB_APP_ID;
    const appSecret = process.env.FB_APP_SECRET;
    const shortLivedToken = process.env.FB_SHORT_LIVED_TOKEN;

    if (!appId || !appSecret || !shortLivedToken) {
      throw new Error("Missing Facebook credentials in environment variables");
    }

    const refreshUrl = "https://graph.facebook.com/v18.0/oauth/access_token";
    const params = {
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedToken,
    };

    console.log("Requesting new Facebook access token...");
    const response = await axios.get(refreshUrl, { params });

    if (response.data.error) {
      throw new Error(`Facebook API Error: ${response.data.error.message}`);
    }

    const newToken = response.data.access_token;
    const expiresIn = response.data.expires_in || 5184000; // Default 60 days

    if (!newToken) {
      throw new Error("No access token received from Facebook");
    }

    // Update environment variables
    await updateEnvFile("FB_ACCESS_TOKEN", newToken);
    await updateEnvFile("FB_TOKEN_CREATED_AT", new Date().getTime().toString());

    // Update process.env for current session
    process.env.FB_ACCESS_TOKEN = newToken;
    process.env.FB_TOKEN_CREATED_AT = new Date().getTime().toString();

    console.log("✓ Facebook access token refreshed successfully");
    console.log(`✓ New token expires in ${Math.floor(expiresIn / 86400)} days`);

    return {
      success: true,
      token: newToken,
      expires_in: expiresIn,
      message: "Token refreshed successfully",
    };
  } catch (error) {
    console.error("Error refreshing Facebook token:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// Update .env file with new values
const updateEnvFile = async (key, value) => {
  try {
    const envPath = path.resolve(process.cwd(), ".env");

    // Read current .env file
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    // Split into lines
    const lines = envContent.split("\n");
    let keyFound = false;

    // Update existing key or add new one
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith(`${key}=`)) {
        lines[i] = `${key}=${value}`;
        keyFound = true;
        break;
      }
    }

    // If key not found, add it
    if (!keyFound) {
      lines.push(`${key}=${value}`);
    }

    // Write back to file
    fs.writeFileSync(envPath, lines.join("\n"));
    console.log(`✓ Updated ${key} in .env file`);
  } catch (error) {
    console.error(`Error updating .env file for ${key}:`, error);
    throw error;
  }
};

// Schedule token refresh (called by cron job)
const scheduleTokenRefresh = async () => {
  try {
    console.log("Checking if Facebook token needs refresh...");
    const result = await checkAndRefreshToken();

    if (result.success) {
      console.log("Token refresh check completed:", result.message);
    } else {
      console.error("Token refresh check failed:", result.message);
    }
  } catch (error) {
    console.error("Scheduled token refresh error:", error);
  }
};

// Validate Facebook credentials
const validateCredentials = () => {
  const requiredVars = [
    "FB_APP_ID",
    "FB_APP_SECRET",
    "FB_SHORT_LIVED_TOKEN",
    "FB_ACCESS_TOKEN",
  ];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.warn(`⚠️ Missing Facebook credentials: ${missing.join(", ")}`);
    return false;
  }

  return true;
};

module.exports = {
  checkAndRefreshToken,
  refreshFacebookToken,
  scheduleTokenRefresh,
  validateCredentials,
  updateEnvFile,
};
