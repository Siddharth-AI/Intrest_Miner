const { v4: uuidv4 } = require("uuid");
const { insertRecord, selectRecord, softDeleteRecord, checkRecordExists, updateRecord } = require("../utils/sqlFunctions");
const { customResponse } = require("../utils/customResponse");
const { validateSearchText } = require("../utils/validationHelpers");

// Store search with Chrome-like functionality and subscription checking
const storeSearch = async (req, res) => {
    try {
        const {
            search_text,
            type = "text", // Default type
            category = "general", // Default category
            filters = {},
        } = req.body;

        const user_uuid = req.user.uuid;

        // Validate search text
        const validation = validateSearchText(search_text);
        if (!validation.valid) {
            return customResponse(validation.message, 400, false)(req, res);
        }

        // Check subscription limits (this will be handled by middleware)
        // The middleware will attach subscription info to req.subscription

        // Verify user exists
        const userExists = await checkRecordExists("users", "uuid", user_uuid);
        if (!userExists) {
            return customResponse("User not found", 404, false)(req, res);
        }

        // Normalize search text (remove extra spaces, special chars, etc.)
        const normalizedText = search_text.trim().replace(/\s+/g, " ").substring(0, 255); // Limit to 255 chars for index

        // Check if this search already exists for the user (for updating visit count)
        const existingSearch = await checkExistingSearch(user_uuid, normalizedText);

        if (existingSearch) {
            // Update existing search (increment visit count and update timestamp)
            await updateSearchEntry(existingSearch.uuid, existingSearch.visit_count + 1);

            // Update subscription usage (handled by middleware)
            return res.status(200).json({
                message: "Search updated successfully",
                status: 200,
                success: true,
                data: {
                    search_id: existingSearch.uuid,
                    visit_count: existingSearch.visit_count + 1,
                    searches_remaining: req.subscription ? req.subscription.searches_remaining - 1 : null,
                },
            });
        }

        // Create new search entry
        const searchData = {
            uuid: uuidv4(),
            user_uuid,
            raw_search_text: search_text,
            normalized_search_text: normalizedText,
            type,
            category,
            filters: JSON.stringify(filters),
            visit_count: 1,
            last_visited: new Date(),
        };

        await insertRecord("search_history", searchData);

        return res.status(201).json({
            message: "Search stored successfully",
            status: 201,
            success: true,
            data: {
                search_id: searchData.uuid,
                visit_count: 1,
                searches_remaining: req.subscription ? req.subscription.searches_remaining - 1 : null,
            },
        });
    } catch (error) {
        console.error("Search storage error:", error);
        return customResponse("Failed to store search: " + (error.message || "Unknown error"), 500, false)(req, res);
    }
};

// Helper to check for existing searches
const checkExistingSearch = async (user_uuid, normalized_text) => {
    try {
        const query = `
      SELECT uuid, visit_count 
      FROM search_history 
      WHERE user_uuid = ? 
      AND normalized_search_text = ? 
      AND is_deleted = 0
      LIMIT 1
    `;

        const results = await selectRecord(query, [user_uuid, normalized_text]);
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        console.error("Error checking existing search:", error);
        throw error;
    }
};

// Helper to update existing search entry
const updateSearchEntry = async (uuid, visit_count) => {
    try {
        return await updateRecord(
            "search_history",
            {
                visit_count,
                last_visited: new Date(),
            },
            "uuid",
            uuid
        );
    } catch (error) {
        console.error("Error updating search entry:", error);
        throw error;
    }
};

// Get search history with filtering options

const getSearchHistory = async (req, res) => {
    try {
        const user_uuid = req.user.uuid;
        const { limit = 20, offset = 0, sort_by = "last_visited", sort_order = "DESC", type, category, start_date, end_date, search_term, group_by } = req.query;

        // Validate and sanitize pagination inputs
        const safeLimit = Math.min(Number.parseInt(limit) || 20, 100); // Max limit 100
        const safeOffset = Math.max(Number.parseInt(offset) || 0, 0);

        // Validate and sanitize sort parameters
        const validSortFields = ["created_at", "last_visited", "visit_count", "raw_search_text"];
        const validSortOrders = ["ASC", "DESC"];

        const sortField = validSortFields.includes(sort_by) ? sort_by : "last_visited";
        const sortOrder = validSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : "DESC";

        // Build query conditions
        const conditions = ["user_uuid = ? AND is_deleted = 0"];
        const params = [user_uuid];

        if (type) {
            conditions.push("type = ?");
            params.push(type);
        }

        if (category) {
            conditions.push("category = ?");
            params.push(category);
        }

        if (start_date && !isNaN(new Date(start_date))) {
            conditions.push("created_at >= ?");
            params.push(new Date(start_date));
        }

        if (end_date && !isNaN(new Date(end_date))) {
            conditions.push("created_at <= ?");
            params.push(new Date(end_date));
        }

        if (search_term) {
            conditions.push("(raw_search_text LIKE ? OR normalized_search_text LIKE ?)");
            const term = `%${search_term}%`;
            params.push(term, term);
        }

        // Get total count for pagination
        const countQuery = `
      SELECT COUNT(*) as total 
      FROM search_history 
      WHERE ${conditions.join(" AND ")}
    `;

        const countResult = await selectRecord(countQuery, params);
        const totalCount = countResult[0]?.total || 0;

        // Build the main query
        let query = "";

        if (group_by === "date") {
            query = `
        SELECT 
          DATE(last_visited) as search_date,
          COUNT(*) as entries_count,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', uuid,
              'search_text', raw_search_text,
              'normalized_text', normalized_search_text,
              'type', type,
              'category', category,
              'filters', filters,
              'visit_count', visit_count,
              'created_at', created_at,
              'last_visited', last_visited
            )
          ) as entries
        FROM search_history 
        WHERE ${conditions.join(" AND ")}
        GROUP BY DATE(last_visited)
        ORDER BY search_date ${sortOrder}
        LIMIT ? OFFSET ?
      `;
        } else {
            query = `
        SELECT uuid, raw_search_text, normalized_search_text, type, category, 
               filters, visit_count, created_at, last_visited 
        FROM search_history 
        WHERE ${conditions.join(" AND ")}
        ORDER BY ${sortField} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
        }

        // Use separate params array for main query
        const mainQueryParams = [...params, safeLimit, safeOffset];

        const history = await selectRecord(query, mainQueryParams);

        if (group_by === "date") {
            formattedData = history.map((item) => ({
                date: item.search_date,
                count: item.entries_count,
                entries: (typeof item.entries === "string" ? JSON.parse(item.entries) : item.entries).map((entry) => ({
                    ...entry,
                    filters: entry.filters ? (typeof entry.filters === "string" ? JSON.parse(entry.filters) : entry.filters) : {},
                })),
            }));
        } else {
            formattedData = history.map((item) => ({
                id: item.uuid,
                search_text: item.raw_search_text,
                normalized_text: item.normalized_search_text,
                type: item.type,
                category: item.category,
                filters: item.filters ? (typeof item.filters === "string" ? JSON.parse(item.filters) : item.filters) : {},
                visit_count: item.visit_count,
                created_at: item.created_at,
                last_visited: item.last_visited,
            }));
        }

        return res.status(200).json({
            status: 200,
            success: true,
            data: formattedData,
            pagination: {
                limit: safeLimit,
                offset: safeOffset,
                total: totalCount,
            },
        });
    } catch (error) {
        console.error("Fetch history error:", error);
        return customResponse("Failed to fetch search history: " + (error.message || "Unknown error"), 500, false)(req, res);
    }
};

// Clear all search history
const clearSearchHistory = async (req, res) => {
    try {
        const user_uuid = req.user.uuid;

        const query = `
      UPDATE search_history 
      SET is_deleted = 1 
      WHERE user_uuid = ? AND is_deleted = 0
    `;

        const result = await selectRecord(query, [user_uuid]);
        const affectedRows = result.affectedRows || 0;

        return res.status(200).json({
            message: "Search history cleared successfully",
            status: 200,
            success: true,
            data: {
                cleared_entries: affectedRows,
            },
        });
    } catch (error) {
        console.error("Clear history error:", error);
        return customResponse("Failed to clear search history: " + (error.message || "Unknown error"), 500, false)(req, res);
    }
};

// Delete search entry
const deleteSearchEntry = async (req, res) => {
    try {
        const { searchId } = req.params;
        const user_uuid = req.user.uuid;

        if (!searchId) {
            return customResponse("Search ID is required", 400, false)(req, res);
        }

        // Verify ownership
        const searchEntry = await checkRecordExists("search_history", "uuid", searchId, "user_uuid = ? AND is_deleted = 0", [user_uuid]);

        if (!searchEntry) {
            return customResponse("Search entry not found or unauthorized", 404, false)(req, res);
        }

        await softDeleteRecord("search_history", "uuid", searchId);
        return customResponse("Search deleted successfully", 200, true)(req, res);
    } catch (error) {
        console.error("Delete error:", error);
        return customResponse("Failed to delete search: " + (error.message || "Unknown error"), 500, false)(req, res);
    }
};

// Update search visit (when user clicks on a search result)
const updateSearchVisit = async (req, res) => {
    try {
        const { searchId } = req.params;
        const user_uuid = req.user.uuid;

        if (!searchId) {
            return customResponse("Search ID is required", 400, false)(req, res);
        }

        // Verify ownership and get current visit count
        const query = `
      SELECT uuid, visit_count 
      FROM search_history 
      WHERE uuid = ? AND user_uuid = ? AND is_deleted = 0
      LIMIT 1
    `;

        const results = await selectRecord(query, [searchId, user_uuid]);

        if (results.length === 0) {
            return customResponse("Search entry not found or unauthorized", 404, false)(req, res);
        }

        const existingSearch = results[0];
        const newVisitCount = existingSearch.visit_count + 1;

        // Update the search entry
        await updateRecord(
            "search_history",
            {
                visit_count: newVisitCount,
                last_visited: new Date(),
            },
            "uuid",
            searchId
        );

        return res.status(200).json({
            message: "Search visit updated successfully",
            status: 200,
            success: true,
            data: {
                search_id: searchId,
                visit_count: newVisitCount,
            },
        });
    } catch (error) {
        console.error("Update visit error:", error);
        return customResponse("Failed to update search visit: " + (error.message || "Unknown error"), 500, false)(req, res);
    }
};

// Get search suggestions based on past searches
const getSearchSuggestions = async (req, res) => {
    try {
        const { query } = req.query;
        const user_uuid = req.user.uuid;

        if (!query || typeof query !== "string") {
            return customResponse("Valid query parameter is required", 400, false)(req, res);
        }

        // Get suggestions based on past searches
        const searchQuery = `
      SELECT normalized_search_text, visit_count
      FROM search_history
      WHERE user_uuid = ?
      AND normalized_search_text LIKE ?
      AND is_deleted = 0
      ORDER BY visit_count DESC, last_visited DESC
      LIMIT 10
    `;

        const suggestions = await selectRecord(searchQuery, [user_uuid, `${query}%`]);

        return res.status(200).json({
            status: 200,
            success: true,
            data: suggestions.map((item) => ({
                suggestion: item.normalized_search_text,
                visit_count: item.visit_count,
            })),
        });
    } catch (error) {
        console.error("Get suggestions error:", error);
        return customResponse("Failed to get search suggestions: " + (error.message || "Unknown error"), 500, false)(req, res);
    }
};

module.exports = {
    storeSearch,
    getSearchHistory,
    deleteSearchEntry,
    clearSearchHistory,
    updateSearchVisit,
    getSearchSuggestions,
};
