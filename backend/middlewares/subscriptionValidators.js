const Joi = require("joi");

// Validation schema for creating subscription plan
const createPlanSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.min": "Plan name must be at least 3 characters long",
    "string.max": "Plan name cannot exceed 100 characters",
    "any.required": "Plan name is required",
  }),
  description: Joi.string().max(500).allow(""),
  price: Joi.number().precision(2).min(0).required().messages({
    "number.min": "Price must be a positive number",
    "any.required": "Price is required",
  }),
  search_limit: Joi.number().integer().min(1).required().messages({
    "number.min": "Search limit must be at least 1",
    "any.required": "Search limit is required",
  }),
  duration_days: Joi.number().integer().min(1).default(30),
  features: Joi.array().items(Joi.string()).default([]),
  is_popular: Joi.boolean().default(false),
  is_active: Joi.boolean().default(true),
  sort_order: Joi.number().integer().min(0).default(0),
});

// Validation schema for updating subscription plan
const updatePlanSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().max(500).allow(""),
  price: Joi.number().precision(2).min(0),
  search_limit: Joi.number().integer().min(1),
  duration_days: Joi.number().integer().min(1),
  features: Joi.array().items(Joi.string()),
  is_active: Joi.boolean(),
  is_popular: Joi.boolean(),
  sort_order: Joi.number().integer().min(0),
});

// Validation schema for subscribing to a plan
const subscribeSchema = Joi.object({
  plan_id: Joi.number().integer().required().messages({
    "any.required": "Plan ID is required",
  }),
  payment_method: Joi.string()
    .valid(
      "credit_card",
      "debit_card",
      "paypal",
      "stripe",
      "bank_transfer",
      "wallet"
    )
    .required(),
  auto_renew: Joi.boolean().default(true),
  payment_token: Joi.string().when("payment_method", {
    is: Joi.valid("credit_card", "debit_card", "stripe"),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

// Validation schema for payment processing
const processPaymentSchema = Joi.object({
  subscription_uuid: Joi.string().uuid().required(),
  payment_method: Joi.string()
    .valid(
      "credit_card",
      "debit_card",
      "paypal",
      "stripe",
      "bank_transfer",
      "wallet",
      "razorpay"
    )
    .required(),
  payment_token: Joi.string().required(),
  amount: Joi.number().precision(2).min(0).required(),
});

// Middleware functions
const validateCreatePlan = (req, res, next) => {
  const { error, value } = createPlanSchema.validate(req.body);
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

const validateUpdatePlan = (req, res, next) => {
  const { error, value } = updatePlanSchema.validate(req.body);
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

const validateSubscribe = (req, res, next) => {
  const { error, value } = subscribeSchema.validate(req.body);
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

const validateProcessPayment = (req, res, next) => {
  const { error, value } = processPaymentSchema.validate(req.body);
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
  validateCreatePlan,
  validateUpdatePlan,
  validateSubscribe,
  validateProcessPayment,
};
