const Joi = require("joi");
const JoiPhoneNumber = require("joi-phone-number");
const { authError } = require("../utils/customResponse");

const myCustomJoi = Joi.extend(JoiPhoneNumber);

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const userRegisterSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name cannot exceed 30 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .pattern(passwordRegex)
    .min(8)
    .max(75)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 75 characters",
      "any.required": "Password is required",
    }),
  confirm_password: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Confirm password must match password",
      "any.required": "Confirm password is required",
    }),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

const validateRegister = (req, res, next) => {
  const { error } = userRegisterSchema.validate(req.body);
  if (error) {
    const response = authError(error);
    return res.status(422).send(response);
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = userLoginSchema.validate(req.body);
  if (error) {
    const response = authError(error);
    return res.status(422).send(response);
  }
  next();
};

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  otp_code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.length": "OTP must be exactly 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
      "any.required": "OTP code is required",
    }),
});

const resetPasswordSchema = Joi.object({
  reset_token: Joi.string().required().messages({
    "any.required": "Reset token is required",
  }),
  new_password: Joi.string()
    .pattern(passwordRegex)
    .min(8)
    .max(75)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 75 characters",
      "any.required": "New password is required",
    }),
  confirm_password: Joi.string()
    .valid(Joi.ref("new_password"))
    .required()
    .messages({
      "any.only": "Confirm password must match new password",
      "any.required": "Confirm password is required",
    }),
});

const validateForgotPassword = (req, res, next) => {
  const { error } = forgotPasswordSchema.validate(req.body);
  if (error) {
    const response = authError(error);
    return res.status(422).send(response);
  }
  next();
};

const validateVerifyOtp = (req, res, next) => {
  const { error } = verifyOtpSchema.validate(req.body);
  if (error) {
    const response = authError(error);
    return res.status(422).send(response);
  }
  next();
};

const validateResetPassword = (req, res, next) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    const response = authError(error);
    return res.status(422).send(response);
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword,
};
