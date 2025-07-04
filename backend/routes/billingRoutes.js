const express = require("express")
const router = express.Router()
const { authenticateUser } = require("../middlewares/authMiddleware")
const {
  getBillingHistory,
  getInvoice,
  getPaymentHistory,
  getSpendingSummary,
} = require("../controllers/billingController")

// All routes require authentication
router.use(authenticateUser)

// Billing and payment routes
router.get("/history", getBillingHistory)
router.get("/invoice/:invoiceId", getInvoice)
router.get("/payments", getPaymentHistory)
router.get("/summary", getSpendingSummary)

module.exports = router
