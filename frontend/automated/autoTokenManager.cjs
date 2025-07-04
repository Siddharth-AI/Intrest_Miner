const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const TOKEN_FILE = "longToken.json";
const APP_ID = process.env.VITE_APP_ID;
const APP_SECRET = process.env.VITE_APP_SECRET;
const SHORT_TOKEN = process.env.VITE_INITIAL_SHORT_TOKEN;


// console.log("Loaded APP_ID:",APP_ID);

function loadToken() {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  const data = fs.readFileSync(TOKEN_FILE);
  return JSON.parse(data);
}

function saveToken(token, expiresIn) {
  const expiresAt = Date.now() + expiresIn * 1000;
  const data = { token, expires_at: expiresAt };
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2));
  console.log("✅ Long-lived token saved.");
}

function isExpiringSoon(expireTime) {
  const tenDays = 10 * 24 * 60 * 60 * 1000;
  return Date.now() + tenDays > expireTime;
}

async function getLongLivedToken(shortToken) {
  try {
    const url = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortToken}`;
    const response = await axios.get(url);
    const { access_token, expires_in } = response.data;
    saveToken(access_token, expires_in);
  } catch (err) {
    console.error("❌ Failed to get token:", err.response?.data || err.message);
  }
}

async function run() {
  const tokenInfo = loadToken();

  if (!tokenInfo || isExpiringSoon(tokenInfo.expires_at)) {
    console.log("🔁 Refreshing token...");
    await getLongLivedToken(SHORT_TOKEN);
  } else {
    console.log("✅ Token is still valid.");
    console.log("Token:", tokenInfo.token);
  }
}

run();
