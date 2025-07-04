const { selectRecord } = require("../utils/sqlFunctions")
const { customResponse } = require("../utils/customResponse")

// Check if user has active subscription and search quota
const checkSubscriptionLimits = async (req, res, next) => {
  try {
    const user_uuid = req.user.uuid

    // Get user's active subscription
    const query = `
      SELECT 
        us.uuid,
        us.searches_used,
        us.searches_remaining,
        us.status,
        us.end_date,
        sp.search_limit,
        sp.name as plan_name
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_uuid = ? 
      AND us.status = 'active' 
      AND us.end_date > NOW()
      AND us.is_deleted = 0
      ORDER BY us.end_date DESC
      LIMIT 1
    `

    const subscriptions = await selectRecord(query, [user_uuid])

    if (subscriptions.length === 0) {
      return customResponse(
        "No active subscription found. Please subscribe to a plan to continue searching.",
        403,
        false,
      )(req, res)
    }

    const subscription = subscriptions[0]

    // Check if user has remaining searches
    if (subscription.searches_remaining <= 0) {
      return customResponse(
        `Search limit exceeded for ${subscription.plan_name} plan. Please upgrade or wait for renewal.`,
        403,
        false,
      )(req, res)
    }

    // Attach subscription info to request
    req.subscription = subscription
    next()
  } catch (error) {
    console.error("Subscription check error:", error)
    return customResponse("Failed to verify subscription status", 500, false)(req, res)
  }
}

// Check if user is admin (for plan management)
const checkAdminAccess = async (req, res, next) => {
  try {
    const user_uuid = req.user.uuid

    const query = `SELECT is_admin FROM users WHERE uuid = ? AND is_deleted = 0`
    const users = await selectRecord(query, [user_uuid])

    if (users.length === 0 || !users[0].is_admin) {
      return customResponse("Admin access required", 403, false)(req, res)
    }

    next()
  } catch (error) {
    console.error("Admin check error:", error)
    return customResponse("Failed to verify admin access", 500, false)(req, res)
  }
}

// Update search usage after successful search
const updateSearchUsage = async (req, res, next) => {
  try {
    if (req.subscription) {
      const { uuid } = req.subscription

      const updateQuery = `
        UPDATE user_subscriptions 
        SET searches_used = searches_used + 1,
            searches_remaining = searches_remaining - 1,
            updated_at = NOW()
        WHERE uuid = ?
      `

      await selectRecord(updateQuery, [uuid])
    }
    next()
  } catch (error) {
    console.error("Search usage update error:", error)
    // Don't block the response, just log the error
    next()
  }
}

module.exports = {
  checkSubscriptionLimits,
  checkAdminAccess,
  updateSearchUsage,
}
