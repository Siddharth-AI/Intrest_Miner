const { selectRecord, updateRecord } = require("./sqlFunctions");

// Check and update expired subscriptions
const updateExpiredSubscriptions = async () => {
  try {
    // First check if the table exists
    const checkTableQuery = `
      SELECT COUNT(*) as table_exists 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'user_subscriptions'
    `;

    const tableCheck = await selectRecord(checkTableQuery);

    if (!tableCheck[0].table_exists) {
      console.log(
        "user_subscriptions table doesn't exist yet, skipping update"
      );
      return;
    }

    const query = `
      UPDATE user_subscriptions 
      SET status = 'expired' 
      WHERE status = 'active' 
      AND end_date <= NOW() 
      AND is_deleted = 0
    `;

    await selectRecord(query);
  } catch (error) {
    console.error("Error updating expired subscriptions:", error);
  }
};

// Process auto-renewals
const processAutoRenewals = async () => {
  try {
    // First check if the table exists
    const checkTableQuery = `
      SELECT COUNT(*) as table_exists 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'user_subscriptions'
    `;

    const tableCheck = await selectRecord(checkTableQuery);

    if (!tableCheck[0].table_exists) {
      console.log(
        "user_subscriptions table doesn't exist yet, skipping auto-renewals"
      );
      return;
    }

    // Get subscriptions that need renewal (ending in next 24 hours)
    const query = `
      SELECT us.*, sp.price, sp.duration_days, sp.search_limit, u.email
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      JOIN users u ON us.user_uuid = u.uuid
      WHERE us.status = 'active'
      AND us.auto_renew = 1
      AND us.end_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 DAY)
      AND us.is_deleted = 0
    `;

    const renewalSubscriptions = await selectRecord(query);

    for (const subscription of renewalSubscriptions) {
      try {
        // In a real application, process payment here
        // For now, we'll simulate successful renewal

        const newEndDate = new Date(subscription.end_date);
        newEndDate.setDate(newEndDate.getDate() + subscription.duration_days);

        await updateRecord(
          "user_subscriptions",
          {
            end_date: newEndDate,
            searches_used: 0,
            searches_remaining: subscription.search_limit,
            updated_at: new Date(),
          },
          "uuid",
          subscription.uuid
        );

        console.log(`Renewed subscription for user: ${subscription.user_uuid}`);
      } catch (error) {
        console.error(
          `Failed to renew subscription ${subscription.uuid}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error processing auto-renewals:", error);
  }
};

// Get user's subscription status
const getUserSubscriptionStatus = async (user_uuid) => {
  try {
    const query = `
      SELECT 
        us.status,
        us.searches_remaining,
        us.end_date,
        sp.name as plan_name
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_uuid = ? 
      AND us.status = 'active' 
      AND us.end_date > NOW()
      AND us.is_deleted = 0
      ORDER BY us.end_date DESC
      LIMIT 1
    `;

    const result = await selectRecord(query, [user_uuid]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error getting user subscription status:", error);
    return null;
  }
};

// Calculate prorated amount for plan changes
const calculateProratedAmount = (
  currentPrice,
  newPrice,
  remainingDays,
  totalDays
) => {
  const dailyCurrentRate = currentPrice / totalDays;
  const refundAmount = dailyCurrentRate * remainingDays;
  const upgradeAmount = newPrice - refundAmount;

  return {
    refundAmount: Math.max(0, refundAmount),
    upgradeAmount: Math.max(0, upgradeAmount),
    totalAmount: Math.max(0, upgradeAmount),
  };
};

module.exports = {
  updateExpiredSubscriptions,
  processAutoRenewals,
  getUserSubscriptionStatus,
  calculateProratedAmount,
};
