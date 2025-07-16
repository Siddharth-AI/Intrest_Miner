const Joi = require("joi");

// Validation schema for business interest generation
const businessInterestSchema = Joi.object({
  productName: Joi.string().min(2).max(100).required().messages({
    "string.min": "Product name must be at least 2 characters long",
    "string.max": "Product name cannot exceed 100 characters",
    "any.required": "Product name is required",
  }),
  category: Joi.string().min(2).max(50).required().messages({
    "string.min": "Category must be at least 2 characters long",
    "string.max": "Category cannot exceed 50 characters",
    "any.required": "Category is required",
  }),
  productDescription: Joi.string().min(10).max(1000).required().messages({
    "string.min": "Product description must be at least 10 characters long",
    "string.max": "Product description cannot exceed 1000 characters",
    "any.required": "Product description is required",
  }),
  location: Joi.string().max(100).allow("").optional(),
  promotionGoal: Joi.string().max(100).allow("").optional(),
  targetAudience: Joi.string().min(5).max(500).required().messages({
    "string.min": "Target audience must be at least 5 characters long",
    "string.max": "Target audience cannot exceed 500 characters",
    "any.required": "Target audience is required",
  }),
  contactEmail: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Contact email is required",
  }),
});
const GetBusinessDetailsHistory = Joi.object({
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
//
const validateGetBusinessDetailsHistory = (req, res, next) => {
  const { error, value } = GetBusinessDetailsHistory.validate(req.query)
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


// Middleware function for validating business interest generation
const validateBusinessInterest = (req, res, next) => {
  const { error, value } = businessInterestSchema.validate(req.body);
  if (error) {
    return res.status(422).json({
      message: error.details[0].message,
      status: 422,
      success: false,
    });
  }
  req.body = value;
  next();
};

module.exports = {
  validateBusinessInterest,
  validateGetBusinessDetailsHistory,
};
