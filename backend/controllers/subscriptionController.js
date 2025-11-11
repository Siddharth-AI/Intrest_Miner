const { v4: uuidv4 } = require("uuid");
const { insertRecord, selectRecord, updateRecord, checkRecordExists } = require("../utils/sqlFunctions");
const { customResponse } = require("../utils/customResponse");
const userSubscriptionSchema = require("../schema/userSubscriptionSchema");
const paymentSchema = require("../schema/paymentSchema");
const billingHistorySchema = require("../schema/billingHistorySchema");
const { createOrder, verifySignature } = require("../utils/razorpayHelper");
const { applyCoupon, recordCouponUsage } = require("./couponController");


// Subscribe to a plan
// This function now allows users to purchase any plan, and if an active subscription exists,
// its remaining searches will be added to the new plan's search limit.
const subscribeToPlan = async (req, res) => {
    try {
        const { plan_id, payment_method, auto_renew, payment_token } = req.body;
        const user_uuid = req.user?.uuid;

        if (!user_uuid) {
            return customResponse("User not authenticated", 401, false)(req, res);
        }

        // Get selected new plan details
        const plan = await checkRecordExists("subscription_plans", "id", plan_id, "is_active = 1 AND is_deleted = 0");

        if (!plan || typeof plan.duration_days !== "number" || plan.duration_days <= 0) {
            return customResponse("Invalid or inactive subscription plan", 400, false)(req, res);
        }

        let totalSearchesForNewSubscription = plan.search_limit;
        let subscriptionActionType = "new_subscription"; // Default action type for billing history

        // Check for current active subscription
        const activeSubscriptions = await selectRecord(
            `SELECT * FROM user_subscriptions
            WHERE user_uuid = ? AND status = 'active' AND end_date > NOW() AND is_deleted = 0`,
            [user_uuid]
        );

        if (activeSubscriptions.length > 0) {
            const current = activeSubscriptions[0];

            // Add remaining searches from the current plan to the new plan's searches
            totalSearchesForNewSubscription += current.searches_remaining;
            console.log(`User ${user_uuid} has an active subscription. Carrying over ${current.searches_remaining} searches. New total: ${totalSearchesForNewSubscription}`);

            // Cancel the old subscription as a new one is being created
            await updateRecord(
                "user_subscriptions",
                {
                    status: "cancelled",
                    cancelled_at: new Date(),
                    cancellation_reason: "New plan purchased (searches accumulated)",
                },
                "uuid",
                current.uuid
            );
            subscriptionActionType = "plan_accumulation"; // Update action type for billing history
        } else {
            console.log(`No active subscription found for user ${user_uuid}. Starting fresh.`);
        }

        // Calculate new subscription dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration_days);

        // Create new subscription record (initially pending payment)
        const subscriptionData = {
            uuid: uuidv4(),
            user_uuid,
            plan_id: plan.id,
            status: "pending", // Set to pending until payment is confirmed
            searches_used: 0,
            searches_remaining: totalSearchesForNewSubscription, // This now includes accumulated searches
            start_date: startDate,
            end_date: endDate,
            auto_renew: auto_renew ?? 1, // Default to 1 (true) if not explicitly provided
        };

        await insertRecord("user_subscriptions", subscriptionData);

        // Create payment record (initially pending)
        const paymentData = {
            uuid: uuidv4(),
            user_uuid,
            subscription_uuid: subscriptionData.uuid,
            plan_id: plan.id,
            amount: plan.price,
            payment_method,
            status: "pending",
            metadata: JSON.stringify({ payment_token }),
        };

        await insertRecord("payments", paymentData);

        // Process the payment
        const paymentSuccess = await processPayment(paymentData, payment_token);

        if (paymentSuccess) {
            // Update subscription status to active upon successful payment
            await updateRecord("user_subscriptions", { status: "active" }, "uuid", subscriptionData.uuid);

            // Update payment status to completed
            await updateRecord(
                "payments",
                {
                    status: "completed",
                    payment_date: new Date(),
                    transaction_id: `txn_${Date.now()}`, // Generate a unique transaction ID
                },
                "uuid",
                paymentData.uuid
            );

            // Create billing history entry with the determined action type
            await createBillingHistory(subscriptionData, paymentData, plan, subscriptionActionType);

            return res.status(201).json({
                message: "Plan subscribed successfully. Searches accumulated.",
                status: 201,
                success: true,
                data: {
                    subscription_id: subscriptionData.uuid,
                    plan_name: plan.name,
                    searches_remaining: subscriptionData.searches_remaining,
                    end_date: endDate,
                },
            });
        } else {
            // Payment failed: Update payment record to failed
            await updateRecord(
                "payments",
                {
                    status: "failed",
                    failure_reason: "Payment processing failed",
                },
                "uuid",
                paymentData.uuid
            );
            // Also mark the newly created subscription as failed if payment didn't go through
            await updateRecord(
                "user_subscriptions",
                { status: "failed", cancellation_reason: "Payment failed" },
                "uuid",
                subscriptionData.uuid
            );

            return customResponse("Payment processing failed", 400, false)(req, res);
        }
    } catch (error) {
        console.error("Subscribe error:", error);
        return customResponse("Failed to create subscription", 500, false)(req, res);
    }
};

// Get user's current subscription
const getCurrentSubscription = async (req, res) => {
    try {
        const user_uuid = req.user.uuid;

        const query = `
      SELECT 
        us.uuid,
        us.status,
        us.searches_used,
        us.searches_remaining,
        us.start_date,
        us.end_date,
        us.auto_renew,
        sp.name as plan_name,
        sp.description as plan_description,
        sp.price,
        sp.search_limit,
        sp.duration_days,
        sp.features
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
            return res.status(200).json({
                status: 200,
                success: true,
                data: null,
                message: "No active subscription found",
            });
        }

        const subscription = subscriptions[0];
        const formattedSubscription = {
            ...subscription,
            features: subscription.features ? JSON.parse(subscription.features) : [],
            days_remaining: Math.ceil((new Date(subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24)),
        };

        return res.status(200).json({
            status: 200,
            success: true,
            data: formattedSubscription,
        });
    } catch (error) {
        console.error("Get subscription error:", error);
        return customResponse("Failed to fetch subscription details", 500, false)(req, res);
    }
};

// Get subscription history
const getSubscriptionHistory = async (req, res) => {
    try {
        const user_uuid = req.user.uuid;
        const { limit = 10, offset = 0 } = req.query;

        const query = `
      SELECT 
        us.uuid,
        us.status,
        us.searches_used,
        us.start_date,
        us.end_date,
        us.created_at,
        sp.name as plan_name,
        sp.price,
        sp.search_limit
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_uuid = ? AND us.is_deleted = 0
      ORDER BY us.created_at DESC
      LIMIT ? OFFSET ?
    `;

        const subscriptions = await selectRecord(query, [user_uuid, Number.parseInt(limit), Number.parseInt(offset)]);

        return res.status(200).json({
            status: 200,
            success: true,
            data: subscriptions,
        });
    } catch (error) {
        console.error("Get subscription history error:", error);
        return customResponse("Failed to fetch subscription history", 500, false)(req, res);
    }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
    try {
        const user_uuid = req.user.uuid;
        const { reason } = req.body;

        // Get active subscription
        const activeSubscription = await selectRecord(
            `SELECT * FROM user_subscriptions 
       WHERE user_uuid = ? AND status = 'active' AND end_date > NOW() AND is_deleted = 0
       ORDER BY end_date DESC LIMIT 1`,
            [user_uuid]
        );

        if (activeSubscription.length === 0) {
            return customResponse("No active subscription found to cancel", 404, false)(req, res);
        }

        const subscription = activeSubscription[0];

        // Update subscription
        await updateRecord(
            "user_subscriptions",
            {
                status: "cancelled",
                auto_renew: 0,
                cancelled_at: new Date(),
                cancellation_reason: reason || "User requested cancellation",
            },
            "uuid",
            subscription.uuid
        );

        return customResponse("Subscription cancelled successfully", 200, true)(req, res);
    } catch (error) {
        console.error("Cancel subscription error:", error);
        return customResponse("Failed to cancel subscription", 500, false)(req, res);
    }
};

// Upgrade/Downgrade subscription
const changeSubscription = async (req, res) => {
    try {
        const { new_plan_id, payment_method, payment_token } = req.body;
        const user_uuid = req.user.uuid;

        // Get current active subscription
        const currentSubscription = await selectRecord(
            `SELECT us.*, sp.price as current_price, sp.search_limit as current_limit
       FROM user_subscriptions us
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_uuid = ? AND us.status = 'active' AND us.end_date > NOW() AND us.is_deleted = 0
       ORDER BY us.end_date DESC LIMIT 1`,
            [user_uuid]
        );

        if (currentSubscription.length === 0) {
            return customResponse("No active subscription found", 404, false)(req, res);
        }

        // Get new plan details
        const newPlan = await checkRecordExists("subscription_plans", "id", new_plan_id, "is_active = 1 AND is_deleted = 0");
        if (!newPlan) {
            return customResponse("Invalid or inactive subscription plan", 404, false)(req, res);
        }

        const current = currentSubscription[0];

        // Calculate prorated amount
        const remainingDays = Math.ceil((new Date(current.end_date) - new Date()) / (1000 * 60 * 60 * 24));
        const dailyRate = current.current_price / current.duration_days;
        const refundAmount = dailyRate * remainingDays;
        const upgradeAmount = newPlan.price - refundAmount;

        // Cancel current subscription
        await updateRecord("user_subscriptions", { status: "cancelled", cancelled_at: new Date() }, "uuid", current.uuid);

        // Create new subscription
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + newPlan.duration_days);

        const newSubscriptionData = {
            uuid: uuidv4(),
            user_uuid,
            plan_id: newPlan.id,
            status: "active",
            searches_used: 0,
            searches_remaining: newPlan.search_limit,
            start_date: new Date(),
            end_date: newEndDate,
            auto_renew: current.auto_renew,
        };

        await insertRecord("user_subscriptions", newSubscriptionData);

        // Process payment if upgrade
        if (upgradeAmount > 0) {
            const paymentData = {
                uuid: uuidv4(),
                user_uuid,
                subscription_uuid: newSubscriptionData.uuid,
                plan_id: newPlan.id,
                amount: upgradeAmount,
                payment_method,
                status: "completed",
                payment_date: new Date(),
                transaction_id: `upgrade_${Date.now()}`,
            };

            await insertRecord("payments", paymentData);
            await createBillingHistory(newSubscriptionData, paymentData, newPlan, "upgrade");
        }

        return res.status(200).json({
            message: "Subscription changed successfully",
            status: 200,
            success: true,
            data: {
                subscription_id: newSubscriptionData.uuid,
                plan_name: newPlan.name,
                searches_remaining: newPlan.search_limit,
                end_date: newEndDate,
                amount_charged: Math.max(0, upgradeAmount),
            },
        });
    } catch (error) {
        console.error("Change subscription error:", error);
        return customResponse("Failed to change subscription", 500, false)(req, res);
    }
};

/**
 * Create Razorpay order for subscription
 * POST /subscriptions/razorpay/order
 * Body: { plan_id }
 */
// Modified createRazorpayOrder function
const createRazorpayOrder = async (req, res) => {
    try {
        const { plan_id, coupon_code } = req.body; // Added coupon_code
        const user_uuid = req.user?.uuid;

        if (!user_uuid) {
            return customResponse("User not authenticated", 401, false)(req, res);
        }

        const plan = await checkRecordExists("subscription_plans", "id", plan_id, "is_active = 1 AND is_deleted = 0");
        if (!plan) {
            return customResponse("Invalid or inactive subscription plan", 404, false)(req, res);
        }

        let finalPrice = parseFloat(plan.price);
        let couponData = null;
        let discountAmount = 0;

        // Apply coupon if provided
        if (coupon_code) {
            try {
                // Validate coupon first
                const couponValidation = await selectRecord(
                    `SELECT * FROM coupons 
           WHERE code = ? AND is_active = 1 AND is_deleted = 0 
           AND (valid_until IS NULL OR valid_until > NOW())
           AND valid_from <= NOW()`,
                    [coupon_code.toUpperCase()]
                );

                if (couponValidation.length > 0) {
                    const coupon = couponValidation[0];

                    // Check usage limits
                    const userUsageCount = await selectRecord(
                        `SELECT COUNT(*) as count FROM coupon_usage 
             WHERE coupon_uuid = ? AND user_uuid = ?`,
                        [coupon.uuid, user_uuid]
                    );

                    if (userUsageCount[0].count < coupon.user_usage_limit) {
                        // Calculate discount
                        if (coupon.discount_type === 'percentage') {
                            discountAmount = (finalPrice * coupon.discount_value) / 100;
                        } else if (coupon.discount_type === 'fixed_amount') {
                            discountAmount = Math.min(coupon.discount_value, finalPrice);
                        }

                        if (coupon.maximum_discount_amount) {
                            discountAmount = Math.min(discountAmount, coupon.maximum_discount_amount);
                        }

                        finalPrice = Math.max(0, finalPrice - discountAmount);
                        couponData = coupon;
                    }
                }
            } catch (couponError) {
                console.log("Coupon application error:", couponError);
                // Continue without coupon if there's an error
            }
        }

        // Amount in paise (assuming INR)
        const amount = Math.round(finalPrice * 87 * 100);
        const receipt = `subscr_${Date.now()}`;
        const order = await createOrder(amount, "INR", receipt, { user_uuid, plan_id, coupon_code });

        // Create a pending payment record with coupon info
        const paymentData = {
            uuid: uuidv4(),
            user_uuid,
            plan_id: plan.id,
            amount: finalPrice,
            payment_method: "razorpay",
            payment_gateway: "razorpay",
            status: "pending",
            gateway_payment_id: null,
            metadata: JSON.stringify({
                order_id: order.id,
                coupon_applied: couponData ? {
                    coupon_uuid: couponData.uuid,
                    coupon_code: couponData.code,
                    discount_amount: discountAmount,
                    original_amount: parseFloat(plan.price)
                } : null
            }),
        };

        await insertRecord("payments", paymentData);

        return res.status(200).json({
            success: true,
            order,
            payment_uuid: paymentData.uuid,
            plan,
            coupon_applied: couponData ? {
                code: couponData.code,
                discount_amount: discountAmount,
                original_amount: parseFloat(plan.price),
                final_amount: finalPrice
            } : null
        });

    } catch (error) {
        console.error("Create Razorpay order error:", error);
        return customResponse("Failed to create Razorpay order", 500, false)(req, res);
    }
};

/**
 * Verify Razorpay payment and activate subscription
 * POST /subscriptions/razorpay/verify
 * Body: { order_id, payment_id, signature, payment_uuid, plan_id, auto_renew }
 */
// Modified verifyRazorpayPayment function
const verifyRazorpayPayment = async (req, res) => {
    try {
        const { order_id, payment_id, signature, payment_uuid, plan_id, auto_renew } = req.body;
        const user_uuid = req.user?.uuid;

        if (!user_uuid) {
            return customResponse("User not authenticated", 401, false)(req, res);
        }

        // Verify signature
        const isValid = verifySignature(order_id, payment_id, signature);
        if (!isValid) {
            await updateRecord("payments", { status: "failed", failure_reason: "Invalid signature" }, "uuid", payment_uuid);
            return customResponse("Invalid payment signature", 400, false)(req, res);
        }

        // Get payment record to check for coupon
        const paymentRecord = await selectRecord(
            `SELECT * FROM payments WHERE uuid = ?`,
            [payment_uuid]
        );

        if (paymentRecord.length === 0) {
            return customResponse("Payment record not found", 404, false)(req, res);
        }

        const payment = paymentRecord[0];
        const metadata = payment.metadata ? JSON.parse(payment.metadata) : {};

        // Update payment record
        await updateRecord(
            "payments",
            {
                status: "completed",
                gateway_payment_id: payment_id,
                payment_date: new Date(),
                transaction_id: payment_id,
            },
            "uuid",
            payment_uuid
        );

        // Activate subscription
        const plan = await checkRecordExists("subscription_plans", "id", plan_id, "is_active = 1 AND is_deleted = 0");
        if (!plan) {
            return customResponse("Invalid or inactive subscription plan", 404, false)(req, res);
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration_days);

        const subscriptionData = {
            uuid: uuidv4(),
            user_uuid,
            plan_id: plan.id,
            status: "active",
            searches_used: 0,
            searches_remaining: plan.search_limit,
            start_date: startDate,
            end_date: endDate,
            auto_renew: auto_renew ?? 1,
        };

        await insertRecord("user_subscriptions", subscriptionData);

        await updateRecord(
            "payments",
            { subscription_uuid: subscriptionData.uuid },
            "uuid",
            payment_uuid
        );

        // Record coupon usage if coupon was applied
        if (metadata.coupon_applied) {
            try {
                await recordCouponUsage(
                    metadata.coupon_applied.coupon_uuid,
                    user_uuid,
                    subscriptionData.uuid,
                    payment_uuid,
                    metadata.coupon_applied.discount_amount,
                    metadata.coupon_applied.original_amount,
                    payment.amount
                );

                // Update coupon usage count
                await updateRecord(
                    "coupons",
                    { usage_count: `usage_count + 1` }, // This should be handled properly in your SQL function
                    "uuid",
                    metadata.coupon_applied.coupon_uuid
                );
            } catch (couponError) {
                console.error("Error recording coupon usage:", couponError);
                // Don't fail the payment, just log the error
            }
        }

        // Create billing history
        await createBillingHistory(subscriptionData, { uuid: payment_uuid, amount: payment.amount }, plan, "subscription");

        return res.status(200).json({
            success: true,
            message: "Payment verified and subscription activated",
            subscription: subscriptionData,
            coupon_applied: metadata.coupon_applied || null
        });

    } catch (error) {
        console.error("Verify Razorpay payment error:", error);
        return customResponse("Failed to verify payment", 500, false)(req, res);
    }
};

// Helper function to process payment (simplified)
const processPayment = async (paymentData, paymentToken) => {
    try {
        // In a real application, integrate with payment gateways like Stripe, PayPal, etc.
        // For now, we'll simulate payment processing

        // Simulate payment processing delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate 95% success rate
        // If paymentToken is 'FAIL_TOKEN', simulate failure for testing purposes
        if (paymentToken === 'FAIL_TOKEN') {
            return false;
        }
        return Math.random() > 0.05; // 95% success rate
    } catch (error) {
        console.error("Payment processing error:", error);
        return false;
    }
};

// Helper function to create billing history
const createBillingHistory = async (subscriptionData, paymentData, plan, billingType) => {
    try {
        const billingData = {
            uuid: uuidv4(),
            user_uuid: subscriptionData.user_uuid,
            subscription_uuid: subscriptionData.uuid,
            payment_uuid: paymentData.uuid,
            plan_id: plan.id,
            billing_type: billingType,
            amount: paymentData.amount,
            billing_period_start: subscriptionData.start_date,
            billing_period_end: subscriptionData.end_date,
            status: "completed",
            invoice_number: `INV-${Date.now()}`,
            description: `${billingType} for ${plan.name} plan`,
        };

        await insertRecord("billing_history", billingData);
    } catch (error) {
        console.error("Billing history creation error:", error);
    }
};

module.exports = {
    subscribeToPlan,
    getCurrentSubscription,
    getSubscriptionHistory,
    cancelSubscription,
    changeSubscription,
    createRazorpayOrder,
    verifyRazorpayPayment,
};

