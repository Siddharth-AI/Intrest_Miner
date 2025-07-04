const express = require("express")
const router = express.Router()
const { authenticateUser } = require("../middlewares/authMiddleware")
const { checkSubscriptionLimits, updateSearchUsage } = require("../middlewares/subscriptionMiddleware")
const { validateStoreSearch, validateGetSearchHistory } = require("../middlewares/searchHistoryValidators")
const {
  storeSearch,
  getSearchHistory,
  deleteSearchEntry,
  clearSearchHistory,
  updateSearchVisit,
  getSearchSuggestions,
} = require("../controllers/searchHistoryController")

// All routes require authentication
router.use(authenticateUser)

// Store new search
router.post("/", validateStoreSearch, storeSearch)

// Get search history with filters  
router.get("/", validateGetSearchHistory, getSearchHistory)

// Get search suggestions
router.get("/suggestions", getSearchSuggestions)

// Update search visit count (when user clicks on a search)
router.put("/:searchId/visit", updateSearchVisit)

// Clear all search history
router.delete("/clear", clearSearchHistory)

// Delete specific search entry
router.delete("/:searchId", deleteSearchEntry)

module.exports = router
