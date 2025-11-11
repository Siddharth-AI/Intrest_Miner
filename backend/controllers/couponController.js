const { v4: uuidv4 } = require("uuid");
const { insertRecord, selectRecord, updateRecord, checkRecordExists } = require("../utils/sqlFunctions");
const { customResponse } = require("../utils/customResponse");

/**
 * Validate coupon code
 * POST /coupons/validate
 * Body: { coupon_code, plan_id }
 */
const validateCoupon = async (req, res) => {
  try {
    const { coupon_code, plan_id } = req.body;
    const user_uuid = req.user?.uuid;

    if (!user_uuid) {
      return customResponse("User not authenticated", 401, false)(req, res);
    }

    if (!coupon_code || !plan_id) {
      return customResponse("Coupon code and plan ID are required", 400, false)(req, res);
    }

    // Get coupon details
    const coupon = await selectRecord(
      `SELECT * FROM coupons 
       WHERE code = ? AND is_active = 1 AND is_deleted = 0 
       AND (valid_until IS NULL OR valid_until > NOW())
       AND valid_from <= NOW()`,
      [coupon_code.toUpperCase()]
    );

    if (coupon.length === 0) {
      return customResponse("Invalid or expired coupon code", 400, false)(req, res);
    }

    const couponData = coupon[0];

    // Check usage limit
    if (couponData.usage_limit && couponData.usage_count >= couponData.usage_limit) {
      return customResponse("Coupon usage limit exceeded", 400, false)(req, res);
    }

    // Check user usage limit
    const userUsageCount = await selectRecord(
      `SELECT COUNT(*) as count FROM coupon_usage 
       WHERE coupon_uuid = ? AND user_uuid = ?`,
      [couponData.uuid, user_uuid]
    );

    if (userUsageCount[0].count >= couponData.user_usage_limit) {
      return customResponse("You have already used this coupon", 400, false)(req, res);
    }

    // Get plan details
    const plan = await checkRecordExists("subscription_plans", "id", plan_id, "is_active = 1 AND is_deleted = 0");
    if (!plan) {
      return customResponse("Invalid subscription plan", 400, false)(req, res);
    }

    // Check if coupon is applicable to this plan
    if (couponData.applicable_plans) {
      const applicablePlans = JSON.parse(couponData.applicable_plans);
      if (applicablePlans.length > 0 && !applicablePlans.includes(plan_id)) {
        return customResponse("Coupon is not applicable to this plan", 400, false)(req, res);
      }
    }

    // Check minimum order amount
    if (couponData.minimum_order_amount > plan.price) {
      return customResponse(`Minimum order amount of $${couponData.minimum_order_amount} required`, 400, false)(req, res);
    }

    // Calculate discount
    let discountAmount = 0;
    const originalAmount = parseFloat(plan.price);

    if (couponData.discount_type === 'percentage') {
      discountAmount = (originalAmount * couponData.discount_value) / 100;
    } else if (couponData.discount_type === 'fixed_amount') {
      discountAmount = Math.min(couponData.discount_value, originalAmount);
    }

    // Apply maximum discount limit if set
    if (couponData.maximum_discount_amount) {
      discountAmount = Math.min(discountAmount, couponData.maximum_discount_amount);
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return res.status(200).json({
      success: true,
      message: "Coupon is valid",
      data: {
        coupon: {
          uuid: couponData.uuid,
          code: couponData.code,
          name: couponData.name,
          description: couponData.description,
          discount_type: couponData.discount_type,
          discount_value: couponData.discount_value
        },
        pricing: {
          original_amount: originalAmount,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          savings_percentage: ((discountAmount / originalAmount) * 100).toFixed(2)
        }
      }
    });

  } catch (error) {
    console.error("Validate coupon error:", error);
    return customResponse("Failed to validate coupon", 500, false)(req, res);
  }
};

/**
 * Apply coupon during payment
 * This function is called internally during payment processing
 */
const applyCoupon = async (couponUuid, userUuid, planId, originalAmount) => {
  try {
    // Get coupon details
    const coupon = await selectRecord(
      `SELECT * FROM coupons WHERE uuid = ? AND is_active = 1 AND is_deleted = 0`,
      [couponUuid]
    );

    if (coupon.length === 0) {
      throw new Error("Invalid coupon");
    }

    const couponData = coupon[0];

    // Calculate discount (same logic as validation)
    let discountAmount = 0;

    if (couponData.discount_type === 'percentage') {
      discountAmount = (originalAmount * couponData.discount_value) / 100;
    } else if (couponData.discount_type === 'fixed_amount') {
      discountAmount = Math.min(couponData.discount_value, originalAmount);
    }

    if (couponData.maximum_discount_amount) {
      discountAmount = Math.min(discountAmount, couponData.maximum_discount_amount);
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    // Update coupon usage count
    await updateRecord(
      "coupons",
      { usage_count: couponData.usage_count + 1 },
      "uuid",
      couponUuid
    );

    return {
      original_amount: originalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      coupon_data: couponData
    };

  } catch (error) {
    console.error("Apply coupon error:", error);
    throw error;
  }
};

/**
 * Record coupon usage
 */
const recordCouponUsage = async (couponUuid, userUuid, subscriptionUuid, paymentUuid, discountAmount, originalAmount, finalAmount) => {
  try {
    const usageData = {
      uuid: uuidv4(),
      coupon_uuid: couponUuid,
      user_uuid: userUuid,
      subscription_uuid: subscriptionUuid,
      payment_uuid: paymentUuid,
      discount_amount: discountAmount,
      original_amount: originalAmount,
      final_amount: finalAmount
    };

    await insertRecord("coupon_usage", usageData);
    return usageData;

  } catch (error) {
    console.error("Record coupon usage error:", error);
    throw error;
  }
};

/**
 * Get user's coupon usage history
 * GET /coupons/usage-history
 */
const getCouponUsageHistory = async (req, res) => {
  try {
    const user_uuid = req.user?.uuid;
    const { limit = 10, offset = 0 } = req.query;

    if (!user_uuid) {
      return customResponse("User not authenticated", 401, false)(req, res);
    }

    const usageHistory = await selectRecord(
      `SELECT 
        cu.*,
        c.code,
        c.name as coupon_name,
        c.discount_type,
        c.discount_value,
        sp.name as plan_name
      FROM coupon_usage cu
      JOIN coupons c ON cu.coupon_uuid = c.uuid
      LEFT JOIN user_subscriptions us ON cu.subscription_uuid = us.uuid
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE cu.user_uuid = ?
      ORDER BY cu.used_at DESC
      LIMIT ? OFFSET ?`,
      [user_uuid, Number.parseInt(limit), Number.parseInt(offset)]
    );

    return res.status(200).json({
      success: true,
      data: usageHistory
    });

  } catch (error) {
    console.error("Get coupon usage history error:", error);
    return customResponse("Failed to fetch coupon usage history", 500, false)(req, res);
  }
};

module.exports = {
  validateCoupon,
  applyCoupon,
  recordCouponUsage,
  getCouponUsageHistory
};
