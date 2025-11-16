// validators/orderValidator.js

// Allowed order statuses
const allowedStatuses = [
  "pending",
  "processed",
  "shipped",
  "delivered",
  "cancelled",
];

// ----------------------
// Validate Create Order
// ----------------------
exports.validateCreateOrder = (req, res, next) => {
  const {
    order_number,
    customer_id,
    order_status,
    shipping_address,
    billing_address,
    subtotal,
    tax,
    shipping_fee,
    total,
    created_by
  } = req.body;

  // Required fields
  if (!order_number)
    return res.status(400).json({ success: false, message: "order_number is required" });

  if (!customer_id)
    return res.status(400).json({ success: false, message: "customer_id is required" });

  if (!shipping_address)
    return res.status(400).json({ success: false, message: "shipping_address is required" });

  // Data types
  if (isNaN(customer_id))
    return res.status(400).json({ success: false, message: "customer_id must be a number" });

  if (subtotal !== undefined && isNaN(subtotal))
    return res.status(400).json({ success: false, message: "subtotal must be a number" });

  if (tax !== undefined && isNaN(tax))
    return res.status(400).json({ success: false, message: "tax must be a number" });

  if (shipping_fee !== undefined && isNaN(shipping_fee))
    return res.status(400).json({ success: false, message: "shipping_fee must be a number" });

  if (total !== undefined && isNaN(total))
    return res.status(400).json({ success: false, message: "total must be a number" });

  // Validate optional status
  if (order_status && !allowedStatuses.includes(order_status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid order_status. Allowed: ${allowedStatuses.join(", ")}`
    });
  }

  next();
};

// ----------------------
// Validate Update Order
// ----------------------
exports.validateUpdateOrder = (req, res, next) => {
  const { order_status, subtotal, tax, shipping_fee, total } = req.body;

  // Validate status if provided
  if (order_status && !allowedStatuses.includes(order_status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid order_status. Allowed: ${allowedStatuses.join(", ")}`
    });
  }

  // Number checks
  if (subtotal !== undefined && isNaN(subtotal))
    return res.status(400).json({ success: false, message: "subtotal must be a number" });

  if (tax !== undefined && isNaN(tax))
    return res.status(400).json({ success: false, message: "tax must be a number" });

  if (shipping_fee !== undefined && isNaN(shipping_fee))
    return res.status(400).json({ success: false, message: "shipping_fee must be a number" });

  if (total !== undefined && isNaN(total))
    return res.status(400).json({ success: false, message: "total must be a number" });

  next();
};
