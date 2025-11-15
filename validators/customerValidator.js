const { body, param } = require("express-validator");

exports.registerCustomerValidator = [
  body("first_name")
    .trim()
    .notEmpty().withMessage("First name is required")
    .isString().withMessage("First name must be a string"),

  body("last_name")
    .trim()
    .notEmpty().withMessage("Last name is required")
    .isString().withMessage("Last name must be a string"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("phone")
    .optional()
    .isString().withMessage("Phone must be a string"),

  body("billing_address")
    .optional()
    .isString().withMessage("Billing address must be a string"),

  body("shipping_address")
    .optional()
    .isString().withMessage("Shipping address must be a string"),
];

exports.loginCustomerValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email"),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

exports.updateCustomerValidator = [
  param("id")
    .isInt().withMessage("Customer ID must be an integer"),

  body("first_name")
    .optional()
    .isString().withMessage("First name must be a string"),

  body("last_name")
    .optional()
    .isString().withMessage("Last name must be a string"),

  body("email")
    .optional()
    .isEmail().withMessage("Invalid email format"),

  body("phone")
    .optional()
    .isString().withMessage("Phone must be a string"),

  body("billing_address")
    .optional()
    .isString().withMessage("Billing address must be a string"),

  body("shipping_address")
    .optional()
    .isString().withMessage("Shipping address must be a string"),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .isString().withMessage("Password must be at least 6 characters long if provided")
];

exports.customerIdValidator = [
  param("id")
    .isInt().withMessage("Customer ID must be a valid number")
];
