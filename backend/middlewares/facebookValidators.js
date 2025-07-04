const Joi = require("joi");

// Validation schema for Facebook ad interest search
const searchAdInterestsSchema = Joi.object({
  query: Joi.string().min(1).max(255).required().messages({
    "string.empty": "Search query cannot be empty",
    "string.min": "Search query must be at least 1 character long",
    "string.max": "Search query cannot exceed 255 characters",
    "any.required": "Search query is required",
  }),
  limit: Joi.number().integer().min(1).max(1000).default(1000).messages({
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 1000",
  }),
});

// Middleware function for validating search requests
const validateSearchAdInterests = (req, res, next) => {
  const { error, value } = searchAdInterestsSchema.validate(req.body);
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
  validateSearchAdInterests,
};
