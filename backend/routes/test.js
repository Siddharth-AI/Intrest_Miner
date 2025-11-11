const express = require("express");
const {
  getAllSearchResults,
  searchWithFilters,
  getPaginatedResults,
  searchByPageId,
  testTokenAccess
} = require('../controllers/test');

const router = express.Router();

// Route documentation endpoint
router.get("/", (req, res) => {
  res.json({
    message: "Facebook Ad Library API Test Routes",
    endpoints: [
      {
        path: "/test/search",
        method: "GET",
        description: "Basic ad search (single page)",
        required_params: ["search_terms"],
        optional_params: ["ad_type", "ad_active_status", "media_type", "limit"],
        example: "/test/search?search_terms=skincare&limit=50"
      },
      {
        path: "/test/advanced-search",
        method: "GET",
        description: "Advanced search with all filters",
        required_params: ["search_terms"],
        optional_params: [
          "ad_type", "ad_active_status", "media_type", "publisher_platforms",
          "ad_delivery_date_min", "ad_delivery_date_max", "languages",
          "ad_reached_countries", "search_type", "limit"
        ],
        example: "/test/advanced-search?search_terms=fitness&ad_type=ALL&media_type=VIDEO&ad_delivery_date_min=2024-01-01"
      },
      {
        path: "/test/paginated-search",
        method: "GET",
        description: "Get ALL results across multiple pages",
        required_params: ["search_terms"],
        optional_params: ["max_pages", "ad_type", "ad_active_status", "media_type", "limit"],
        example: "/test/paginated-search?search_terms=technology&max_pages=3&limit=500",
        warning: "Can take 10-30 seconds for large datasets"
      },
      {
        path: "/test/page-search",
        method: "GET",
        description: "Search ads from specific Facebook page IDs",
        required_params: ["page_ids"],
        optional_params: ["ad_type", "ad_active_status", "limit"],
        example: "/test/page-search?page_ids=123456789,987654321&limit=100",
        note: "page_ids should be comma-separated (max 10 IDs)"
      }
    ],
    available_filters: {
      ad_type: ["ALL", "CREDIT_ADS", "EMPLOYMENT_ADS", "HOUSING_ADS", "POLITICAL_AND_ISSUE_ADS"],
      ad_active_status: ["ALL", "ACTIVE", "INACTIVE"],
      media_type: ["ALL", "IMAGE", "MEME", "VIDEO", "VIDEO_WITH_CAPTIONS"],
      publisher_platforms: ["FACEBOOK", "INSTAGRAM", "AUDIENCE_NETWORK", "MESSENGER", "WHATSAPP", "OCULUS", "THREADS"],
      search_type: ["KEYWORD_UNORDERED", "KEYWORD_EXACT_PHRASE"],
      date_format: "YYYY-MM-DD"
    }
  });
});

// Basic search route
router.get("/search", getAllSearchResults);
router.get("/test-token", testTokenAccess);

// // Advanced search route with filters
// router.get("/advanced-search", searchWithFilters);

// // Paginated search route (gets ALL results)
// router.get("/paginated-search", getPaginatedResults);

// // Search by page ID route
// router.get("/page-search", searchByPageId);

module.exports = router;
