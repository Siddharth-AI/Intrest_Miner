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
// Allow all origins
app.use(cors());

// Or explicitly specify all origins
app.use(cors({
  origin: '*'
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use("/", router);
app.use("/facebook", require("./routes/facebookRoutes"));
app.use("/api/adaccounts", require("./routes/adAccounts"));
app.use("/api/campaigns", require("./routes/campaigns"));
app.use("/api/insights", require("./routes/insights"));

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
