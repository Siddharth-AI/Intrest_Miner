const { createTable } = require("./sqlFunctions");
const userSchema = require("../schema/userSchema");
const searchHistorySchema = require("../schema/searchHistorySchema");
const subscriptionPlanSchema = require("../schema/subscriptionPlanSchema");
const userSubscriptionSchema = require("../schema/userSubscriptionSchema");
const paymentSchema = require("../schema/paymentSchema");
const billingHistorySchema = require("../schema/billingHistorySchema");
const couponSchema = require("../schema/couponSchema");
const couponUsageSchema = require("../schema/couponUsageSchema");
const businessDetailHistorySchema = require("../schema/businessDetailsHIstorySchema")
const {
  initializeDefaultPlans,
} = require("../controllers/subscriptionPlanController");

/**
 * Drop and recreate tables if they have foreign key issues
 */
const dropTablesIfExists = async () => {
  try {
    const { selectRecord } = require("./sqlFunctions");

    // Disable foreign key checks temporarily
    await selectRecord("SET FOREIGN_KEY_CHECKS = 0");

    // Drop tables in reverse order of dependencies
    const dropQueries = [
      "DROP TABLE IF EXISTS billing_history",
      "DROP TABLE IF EXISTS payments",
      "DROP TABLE IF EXISTS user_subscriptions",
      "DROP TABLE IF EXISTS subscription_plans",
      "DROP TABLE IF EXISTS search_history",
      "DROP TABLE IF EXISTS users",
      "DROP TABLE IF EXISTS business_detail_history",
    ];

    for (const query of dropQueries) {
      try {
        await selectRecord(query);
      } catch (error) {
        // Ignore errors for non-existent tables
        console.log(`Note: ${query} - table may not exist`);
      }
    }

    // Re-enable foreign key checks
    await selectRecord("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✓ Existing tables dropped (if any)");
  } catch (error) {
    console.error("Error dropping tables:", error);
  }
};

const initializeDatabase = async (forceRecreate = false) => {
  try {
    const { selectRecord } = require("./sqlFunctions");

    // Test database connection first
    try {
      await selectRecord("SELECT 1 as test");
    } catch (connectionError) {
      console.error("✗ Database connection failed:");
      return false;
    }

    // If force recreate is true, drop existing tables first
    if (forceRecreate) {
      await dropTablesIfExists();
    }

    // Create tables in order (respecting foreign key constraints)
    await createTable(userSchema);

    await createTable(searchHistorySchema);

    await createTable(subscriptionPlanSchema);
    await createTable(couponSchema);
    await createTable(couponUsageSchema);

    // Initialize default plans
    await initializeDefaultPlans();

    await createTable(userSubscriptionSchema);

    await createTable(paymentSchema);

    await createTable(billingHistorySchema);

    await createTable(businessDetailHistorySchema);
    return true;
  } catch (error) {
    console.error("Database initialization error:");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);

    // If initialization fails, try recreating tables
    if (!forceRecreate) {
      console.log("Attempting to recreate tables...");
      return await initializeDatabase(true);
    }

    return false;
  }
};

module.exports = {
  initializeDatabase,
  dropTablesIfExists,
};
