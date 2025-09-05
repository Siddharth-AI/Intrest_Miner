const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./routes/index");
require("dotenv").config();

const {
  updateExpiredSubscriptions,
  processAutoRenewals,
} = require("./utils/subscriptionHelpers");
const { initializeDatabase } = require("./utils/databaseInit");
const cron = require("node-cron");
const { scheduleTokenRefresh } = require("./utils/facebookTokenManager");

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use("/", router);
app.use("/facebook", require("./routes/facebookRoutes"));
app.use("/api/adaccounts", require("./routes/adAccounts"));
app.use("/api/campaigns", require("./routes/campaigns"));
app.use("/api/insights", require("./routes/insights"));



const APP_ID = process.env.FB_APP_ID;
const APP_SECRET = process.env.FB_APP_SECRET;
const REDIRECT_URI = 'http://localhost:8080/test';

app.get('/api/auth/facebook/login', (_req, res) => {
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=ads_read,ads_management,business_management&response_type=code`;
  res.redirect(url);
});

app.get('/api/auth/facebook/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const tokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: APP_ID,
        redirect_uri: REDIRECT_URI,
        client_secret: APP_SECRET,
        code,
      },
    });

    const accessToken = tokenRes.data.access_token;

    const adAccountsRes = await axios.get('https://graph.facebook.com/v19.0/me/adaccounts', {
      params: { access_token: accessToken },
    });

    const adAccountId = adAccountsRes.data.data[0]?.id;

    const campaignsRes = await axios.get(`https://graph.facebook.com/v19.0/${adAccountId}/campaigns`, {
      params: {
        fields: 'id,name,status,effective_status,objective,created_time,start_time,stop_time',
        access_token: accessToken,
      },
    });

    const campaigns = campaignsRes.data.data;

    const insights = await Promise.all(
      campaigns.map(async (campaign) => {
        const insightsRes = await axios.get(`https://graph.facebook.com/v19.0/${campaign.id}/insights`, {
          params: {
            fields: 'impressions,clicks,spend,cpc,ctr',
            access_token: accessToken,
          },
        });
        return {
          ...campaign,
          insights: insightsRes.data.data[0] || {},
        };
      })
    );

    res.redirect(`http://localhost:8080/test?data=${encodeURIComponent(JSON.stringify(insights))}`);
  } catch (err) {
    console.error('Facebook callback error:', err);
    res.status(500).send('Login failed');
  }
});

// Start server
const PORT = process.env.PORT || 1000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Initialize database tables before running any operations
  const dbInitialized = await initializeDatabase();

  if (dbInitialized) {
    // Only run these operations if database is initialized
    try {
      await updateExpiredSubscriptions();
    } catch (error) {
      console.error("Error updating expired subscriptions:", error);
    }

    // Set up periodic tasks for subscription management
    setInterval(updateExpiredSubscriptions, 60 * 60 * 1000); // Run every hour
    setInterval(processAutoRenewals, 24 * 60 * 60 * 1000); // Run daily

    // Schedule Facebook token refresh (runs daily at 2 AM to check if refresh is needed)
    cron.schedule("0 2 * * *", async () => {
      try {
        await scheduleTokenRefresh();
      } catch (error) {
        console.error("Error in scheduled token refresh:", error);
      }
    });
  } else {
    console.error(
      "⚠️ Database initialization failed. Some features may not work properly."
    );
  }
});
