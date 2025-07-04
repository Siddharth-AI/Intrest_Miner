const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const { checkAdminAccess } = require("../middlewares/subscriptionMiddleware");
const {
  validateCreatePlan,
  validateUpdatePlan,
} = require("../middlewares/subscriptionValidators");
const {
  getAllPlans,
  createPlan,
  updatePlan,
  togglePlanStatus,
} = require("../controllers/subscriptionPlanController");

// Public routes
router.get("/", getAllPlans);

// Admin only routes
router.post(
  "/",
  authenticateUser,
  checkAdminAccess,
  validateCreatePlan,
  createPlan
);
router.put(
  "/:planId",
  authenticateUser,
  checkAdminAccess,
  validateUpdatePlan,
  updatePlan
);
router.patch(
  "/:planId/toggle-status",
  authenticateUser,
  checkAdminAccess,
  togglePlanStatus
);

module.exports = router;
