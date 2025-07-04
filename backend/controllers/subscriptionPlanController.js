const { v4: uuidv4 } = require("uuid");
const { createTable, insertRecord, selectRecord, updateRecord, softDeleteRecord, checkRecordExists } = require("../utils/sqlFunctions");
const { customResponse } = require("../utils/customResponse");
const subscriptionPlanSchema = require("../schema/subscriptionPlanSchema");

// Initialize default plans
const initializeDefaultPlans = async () => {
    try {
        // Make sure the table exists first
        await createTable(subscriptionPlanSchema);

        const defaultPlans = [
            {
                uuid: uuidv4(),
                name: "Trial",
                description: "Perfect for trying out our service",
                price: 2.0,
                search_limit: 3,
                duration_days: 7,
                features: JSON.stringify(["3 searches", "7 days access", "Basic support"]),
                sort_order: 1,
            },
            {
                uuid: uuidv4(),
                name: "Basic",
                description: "Great for regular users",
                price: 15.0,
                search_limit: 50,
                duration_days: 30,
                features: JSON.stringify(["50 searches", "30 days access", "Email support", "Search history"]),
                sort_order: 2,
            },
            {
                uuid: uuidv4(),
                name: "Pro",
                description: "Best for power users",
                price: 30.0,
                search_limit: 100,
                duration_days: 30,
                features: JSON.stringify(["100 searches", "30 days access", "Priority support", "Advanced analytics", "Export data"]),
                is_popular: 1,
                sort_order: 3,
            },
        ];

        for (const plan of defaultPlans) {
            const exists = await checkRecordExists("subscription_plans", "name", plan.name);
            if (!exists) {
                await insertRecord("subscription_plans", plan);
            }
        }
    } catch (error) {
        console.error("Error initializing default plans:", error);
    }
};

// Get all subscription plans
const getAllPlans = async (req, res) => {
    try {
        const { active_only = "true", popular_only = "false" } = req.query;

        let query = `
      SELECT uuid, name, description, price, search_limit, duration_days, 
             features, is_active, is_popular, sort_order, created_at, updated_at
      FROM subscription_plans 
      WHERE is_deleted = 0
    `;

        const params = [];

        if (active_only === "true") {
            query += " AND is_active = 1";
        }

        if (popular_only === "true") {
            query += " AND is_popular = 1";
        }

        query += " ORDER BY sort_order ASC, price ASC";

        const plans = await selectRecord(query, params);

        const formattedPlans = plans.map((plan) => {
            // let features = [];
            // if (plan.features) {
            //   try {
            //     features = JSON.parse(plan.features);
            //   } catch (e) {
            //     console.error(`Error parsing features for plan ${plan.uuid}:`, e);
            //     features = [];
            //   }
            // }

            let features = [];
            if (plan.features) {
                try {
                    if (typeof plan.features === "string") {
                        let parsed = JSON.parse(plan.features);

                        // Handle possible double-encoded case
                        if (typeof parsed === "string") {
                            parsed = JSON.parse(parsed);
                        }

                        features = parsed;
                    } else if (typeof plan.features === "object") {
                        features = plan.features;
                    }
                } catch (e) {
                    console.error(`Error parsing features for plan ${plan.uuid}:`, e);
                    features = [];
                }
            }

            return {
                ...plan,
                features,
            };
        });

        return res.status(200).json({
            status: 200,
            success: true,
            data: formattedPlans,
        });
    } catch (error) {
        console.error("Get plans error:", error);
        return customResponse("Failed to fetch subscription plans", 500, false)(req, res);
    }
};

// Create new subscription plan (Admin only)
const createPlan = async (req, res) => {
    try {
        const { name, description, price, search_limit, duration_days, features, is_popular, sort_order, is_active } = req.body;

        // Check if plan name already exists
        const existingPlan = await checkRecordExists("subscription_plans", "name", name, "is_deleted = 0");
        if (existingPlan) {
            return customResponse("Plan with this name already exists", 409, false)(req, res);
        }

        const planData = {
            uuid: uuidv4(),
            name,
            description: description || "",
            price,
            search_limit,
            duration_days: duration_days || 30,
            features: JSON.stringify(features || []),
            is_popular: is_popular ? 1 : 0,
            sort_order: sort_order || 0,
            is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1, // Default to active
        };

        await insertRecord("subscription_plans", planData);

        return res.status(201).json({
            message: "Subscription plan created successfully",
            status: 201,
            success: true,
            data: {
                uuid: planData.uuid,
                name: planData.name,
                is_active: planData.is_active,
            },
        });
    } catch (error) {
        console.error("Create plan error:", error);
        return customResponse("Failed to create subscription plan", 500, false)(req, res);
    }
};

const togglePlanStatus = async (req, res) => {
    try {
        const { planId } = req.params;
        const { is_active } = req.body;

        // Validate the request body
        if (is_active === undefined || ![0, 1].includes(is_active)) {
            return customResponse("Invalid status. Please provide is_active as 0 (deactivate) or 1 (activate)", 400, false)(req, res);
        }

        const existingPlan = await checkRecordExists("subscription_plans", "uuid", planId, "is_deleted = 0");
        if (!existingPlan) {
            return customResponse("Subscription plan not found", 404, false)(req, res);
        }

        // Check if the plan is already in the requested state
        if (existingPlan.is_active === is_active) {
            return customResponse(`Subscription plan is already ${is_active ? "active" : "inactive"}`, 200, true)(req, res);
        }

        // Update the status
        await updateRecord("subscription_plans", { is_active }, "uuid", planId);

        return customResponse(`Subscription plan ${is_active ? "activated" : "deactivated"} successfully`, 200, true)(req, res);
    } catch (error) {
        console.error("Toggle plan status error:", error);
        return customResponse("Failed to update subscription plan status", 500, false)(req, res);
    }
};

// Update subscription plan (Admin only)
const updatePlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const updateData = { ...req.body };

        const existingPlan = await checkRecordExists("subscription_plans", "uuid", planId, "is_deleted = 0");
        if (!existingPlan) {
            return customResponse("Subscription plan not found", 404, false)(req, res);
        }

        // If updating features, stringify them
        if (updateData.features) {
            updateData.features = JSON.stringify(updateData.features);
        }

        // Check for duplicate name if name is being updated
        if (updateData.name && updateData.name !== existingPlan.name) {
            const duplicateName = await checkRecordExists("subscription_plans", "name", updateData.name, "is_deleted = 0 AND uuid != ?", [planId]);
            if (duplicateName) {
                return customResponse("Plan with this name already exists", 409, false)(req, res);
            }
        }

        await updateRecord("subscription_plans", updateData, "uuid", planId);

        return customResponse("Subscription plan updated successfully", 200, true)(req, res);
    } catch (error) {
        console.error("Update plan error:", error);
        return customResponse("Failed to update subscription plan", 500, false)(req, res);
    }
};

module.exports = {
    getAllPlans,
    createPlan,
    updatePlan,
    togglePlanStatus,
    initializeDefaultPlans,
};
