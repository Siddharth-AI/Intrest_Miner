const { selectRecord, updateRecord } = require("../utils/sqlFunctions");
const { customResponse } = require("../utils/customResponse");

// Check if user has active subscription and search quota
// const checkSubscriptionLimits = async (req, res, next) => {
//   try {
//     const user_uuid = req.user.uuid

//     // Get user's active subscription
//     const query = `
//       SELECT
//         us.uuid,
//         us.searches_used,
//         us.searches_remaining,
//         us.status,
//         us.end_date,
//         sp.search_limit,
//         sp.name as plan_name
//       FROM user_subscriptions us
//       JOIN subscription_plans sp ON us.plan_id = sp.id
//       WHERE us.user_uuid = ?
//       AND us.status = 'active'
//       AND us.end_date > NOW()
//       AND us.is_deleted = 0
//       ORDER BY us.end_date DESC
//       LIMIT 1
//     `

//     const subscriptions = await selectRecord(query, [user_uuid])

//     if (subscriptions.length === 0) {
//       return customResponse(
//         "No active subscription found. Please subscribe to a plan to continue searching.",
//         403,
//         false,
//       )(req, res)
//     }

//     const subscription = subscriptions[0]

//     // Check if user has remaining searches
//     if (subscription.searches_remaining <= 0) {
//       return customResponse(
//         `Search limit exceeded for ${subscription.plan_name} plan. Please upgrade or wait for renewal.`,
//         403,
//         false,
//       )(req, res)
//     }

//     // Attach subscription info to request
//     req.subscription = subscription
//     console.log(subscription);
//     next()
//   } catch (error) {
//     console.error("Subscription check error:", error)
//     return customResponse("Failed to verify subscription status", 500, false)(req, res)
//   }
// }
const checkSubscriptionLimits = async (req, res, next) => {
    try {
        if (!req.user || !req.user.uuid) {
            return customResponse("User not authenticated", 401, false)(req, res);
        }

        const user_uuid = req.user.uuid;

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
    `;

        const subscriptions = await selectRecord(query, [user_uuid]);

        if (subscriptions.length === 0) {
            return customResponse("No active subscription found. Please subscribe to a plan to continue searching.", 403, false)(req, res);
        }

        const subscription = subscriptions[0];

        if (subscription.searches_remaining <= 0) {
            return customResponse(`Search limit exceeded for ${subscription.plan_name} plan. Please upgrade or wait for renewal.`, 403, false)(req, res);
        }

        req.subscription = subscription;
        console.log("✅ Subscription verified:", subscription);
        next();
    } catch (error) {
        console.error("❌ Subscription check error:", error);
        return customResponse("Failed to verify subscription status", 500, false)(req, res);
    }
};

// Check if user is admin (for plan management)
const checkAdminAccess = async (req, res, next) => {
    try {
        const user_uuid = req.user.uuid;

        const query = `SELECT is_admin FROM users WHERE uuid = ? AND is_deleted = 0`;
        const users = await selectRecord(query, [user_uuid]);

        if (users.length === 0 || !users[0].is_admin) {
            return customResponse("Admin access required", 403, false)(req, res);
        }

        next();
    } catch (error) {
        console.error("Admin check error:", error);
        return customResponse("Failed to verify admin access", 500, false)(req, res);
    }
};

// Update search usage after successful search
// const updateSearchUsage = async (req, res, next) => {
//   try {
//     if (req.subscription) {
//       const { uuid } = req.subscription

//       const updateQuery = `
//         UPDATE user_subscriptions
//         SET searches_used = searches_used + 1,
//             searches_remaining = searches_remaining - 1,
//             updated_at = NOW()
//         WHERE uuid = ?
//       `

//       await updateRecord(updateQuery, [uuid])
//     }
//     next()
//   } catch (error) {
//     console.error("Search usage update error:", error)
//     // Don't block the response, just log the error
//     next()
//   }
// }

// const updateSearchUsage = async (req, res, next) => {
//     try {
//         if (!req.subscription) {
//             return next(new Error("Missing subscription"));
//         }

//         const { uuid } = req.subscription;
//         if (!uuid) throw new Error("Subscription UUID is undefined");

//         console.log("🔄 Updating subscription usage for UUID:", uuid);

//         const updateQuery = `
//           UPDATE user_subscriptions
//           SET searches_used = searches_used + 1,
//               searches_remaining = searches_remaining - 1,
//               updated_at = NOW()
//           WHERE uuid = ?
//         `;

//         await new Promise((resolve, reject) => {
//           pool.query(updateQuery, [uuid], (err, results) => {
//             if (err) {
//               console.error("Update record error:", err);
//               reject(err);
//             } else {
//               resolve(results);
//             }
//           });
//         });

//         return res.status(200).json({
//             success: true,
//             message: "Business interests generated successfully",
//             data: req.generatedInterests,
//         });
//     } catch (err) {
//         console.error("❌ updateSearchUsage error:", err.message);
//         next(err);
//     }
// };
const updateSearchUsage = async (req, res, next) => {
    try {
        if (!req.subscription) {
            return next(new Error("Missing subscription"));
        }

        const { uuid, searches_used, searches_remaining, end_date } = req.subscription;
        if (!uuid) throw new Error("Subscription UUID is undefined");

        const now = new Date();

        // Calculate new usage values
        const newSearchesUsed = searches_used + 1;
        const newSearchesRemaining = searches_remaining - 1;

        // Update usage
        await updateRecord(
            "user_subscriptions",
            {
                searches_used: newSearchesUsed,
                searches_remaining: newSearchesRemaining,
                updated_at: now,
            },
            "uuid",
            [uuid]
        );

        // Check for suspension conditions
        if (newSearchesRemaining <= 0 || (end_date && now > new Date(end_date))) {
            await updateRecord(
                "user_subscriptions",
                { status: "suspended", updated_at: now },
                "uuid",
                [uuid]
            );
            // Optionally, you can set a flag on req to be used by later middleware/handlers
            req.subscriptionSuspended = true;
        }

        // Pass control to the next middleware/handler
        console.log("update the data successfully")
        next();

    } catch (err) {
        console.error("❌ updateSearchUsage error:", err.message);
        next(err);
    }
};

module.exports = {
    checkSubscriptionLimits,
    checkAdminAccess,
    updateSearchUsage,
};
