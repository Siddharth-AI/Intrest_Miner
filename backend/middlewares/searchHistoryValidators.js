const Joi = require("joi")

// Validation schema for storing search history
const storeSearchSchema = Joi.object({
  search_text: Joi.string().min(1).max(1000).required().messages({
    "string.empty": "Search text cannot be empty",
    "string.min": "Search text must be at least 1 character long",
    "string.max": "Search text cannot exceed 1000 characters",
    "any.required": "Search text is required",
  }),
  type: Joi.string().valid("text", "image", "video", "location", "other").default("text"),
  category: Joi.string().max(100).default("general"),
  filters: Joi.object().default({}),
})

// Validation schema for get search history query parameters
const getSearchHistorySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
  sort_by: Joi.string().valid("created_at", "last_visited", "visit_count", "raw_search_text").default("last_visited"),
  sort_order: Joi.string().valid("asc", "desc", "ASC", "DESC").default("DESC"),
  type: Joi.string().valid("text", "image", "video", "location", "other"),
  category: Joi.string().max(100),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso().min(Joi.ref("start_date")),
  search_term: Joi.string().min(1).max(255),
  group_by: Joi.string().valid("date", "category", "type"),
}).unknown(true)

// Validation schema for search suggestions
const searchSuggestionsSchema = Joi.object({
  query: Joi.string().min(1).max(255).required().messages({
    "string.empty": "Query cannot be empty",
    "string.min": "Query must be at least 1 character long",
    "string.max": "Query cannot exceed 255 characters",
    "any.required": "Query is required",
  }),
}).unknown(true)

// Validation for storing search
const validateStoreSearch = (req, res, next) => {
  const { error, value } = storeSearchSchema.validate(req.body)
  if (error) {
    return res.status(422).json({
      message: error.details[0].message,
      status: 422,
      success: false,
    })
  }

  // Use the validated values
  req.body = value
  next()
}

// Validation for getting search history
const validateGetSearchHistory = (req, res, next) => {
  const { error, value } = getSearchHistorySchema.validate(req.query)
  if (error) {
    return res.status(422).json({
      message: error.details[0].message,
      status: 422,
      success: false,
    })
  }

  // Use the validated values
  req.query = value
  next()
}

// Validation for search suggestions
const validateSearchSuggestions = (req, res, next) => {
  const { error, value } = searchSuggestionsSchema.validate(req.query)
  if (error) {
    return res.status(422).json({
      message: error.details[0].message,
      status: 422,
      success: false,
    })
  }

  // Use the validated values
  req.query = value
  next()
}

module.exports = {
  validateStoreSearch,
  validateGetSearchHistory,
  validateSearchSuggestions,
}
