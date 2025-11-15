// validators/warehouseValidator.js
const { body, param, validationResult } = require('express-validator');

const phoneRegex = /^[0-9+\-\s()]*$/; // allow digits, +, -, spaces, parentheses

const validateCreateWarehouse = [
  body('warehouse_name')
    .exists({ checkNull: true, checkFalsy: true }).withMessage('warehouse_name is required')
    .isString().withMessage('warehouse_name must be a string')
    .trim()
    .isLength({ min: 1, max: 120 }).withMessage('warehouse_name must be 1-120 characters'),

  body('location')
    .optional({ nullable: true })
    .isString().withMessage('location must be a string')
    .trim()
    .isLength({ max: 255 }).withMessage('location max length is 255'),

  body('contact_phone')
    .optional({ nullable: true })
    .isString().withMessage('contact_phone must be a string')
    .trim()
    .isLength({ max: 30 }).withMessage('contact_phone max length is 30')
    .matches(phoneRegex).withMessage('contact_phone contains invalid characters'),

  // final middleware to check result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

const validateUpdateWarehouse = [
  param('id')
    .exists().withMessage('id param is required')
    .isInt({ gt: 0 }).withMessage('id must be a positive integer')
    .toInt(),

  // body fields are optional on update; but if present must be valid
  body('warehouse_name')
    .optional({ nullable: true })
    .isString().withMessage('warehouse_name must be a string')
    .trim()
    .isLength({ min: 1, max: 120 }).withMessage('warehouse_name must be 1-120 characters'),

  body('location')
    .optional({ nullable: true })
    .isString().withMessage('location must be a string')
    .trim()
    .isLength({ max: 255 }).withMessage('location max length is 255'),

  body('contact_phone')
    .optional({ nullable: true })
    .isString().withMessage('contact_phone must be a string')
    .trim()
    .isLength({ max: 30 }).withMessage('contact_phone max length is 30')
    .matches(phoneRegex).withMessage('contact_phone contains invalid characters'),

  // ensure at least one updatable field provided
  (req, res, next) => {
    const updatable = ['warehouse_name', 'location', 'contact_phone'];
    const provided = updatable.some(f => Object.prototype.hasOwnProperty.call(req.body, f) && req.body[f] !== undefined && req.body[f] !== null);
    if (!provided) {
      return res.status(400).json({ success: false, message: 'At least one updatable field (warehouse_name, location, contact_phone) must be provided' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

const validateIdParam = [
  param('id')
    .exists().withMessage('id param is required')
    .isInt({ gt: 0 }).withMessage('id must be a positive integer')
    .toInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];

module.exports = {
  validateCreateWarehouse,
  validateUpdateWarehouse,
  validateIdParam
};
