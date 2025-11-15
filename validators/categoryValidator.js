const { body, param } = require("express-validator");

exports.createCategoryValidator = [
  body("category_name")
    .notEmpty().withMessage("Category name is required")
    .isString().withMessage("Category name must be a string")
    .trim(),

  body("description")
    .optional()
    .isString().withMessage("Description must be a string")
];

exports.updateCategoryValidator = [
  param("id")
    .isInt({ min: 1 }).withMessage("Category ID must be a valid number"),

  body("category_name")
    .notEmpty().withMessage("Category name is required")
    .isString().withMessage("Category name must be a string")
    .trim(),

  body("description")
    .optional()
    .isString().withMessage("Description must be a string")
];

exports.idValidator = [
  param("id")
    .isInt({ min: 1 }).withMessage("Category ID must be a number")
];
