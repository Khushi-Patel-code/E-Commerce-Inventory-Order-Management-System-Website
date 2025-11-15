// validators/paymentValidator.js

const allowedMethods = [
  "card",
  "paypal",
  "cod",
  "bank_transfer",
  "apple_pay",
  "google_pay",
  "gift_card",
  "crypto",
  "other"
];

const allowedStatuses = [
  "pending",
  "processing",
  "completed",
  "failed",
  "refunded",
  "cancelled",
  "chargeback"
];

// Validate Create Payment
exports.validateCreatePayment = (req, res, next) => {
  const { order_id, payment_method, payment_status, amount, paid_at, transaction_ref } = req.body;

  // Required fields
  if (!order_id) return res.status(400).json({ success: false, message: "order_id is required" });
  if (!payment_method) return res.status(400).json({ success: false, message: "payment_method is required" });
  if (!payment_status) return res.status(400).json({ success: false, message: "payment_status is required" });
  if (amount === undefined) return res.status(400).json({ success: false, message: "amount is required" });

  // Type checks
  if (isNaN(order_id)) return res.status(400).json({ success: false, message: "order_id must be a number" });
  if (isNaN(amount)) return res.status(400).json({ success: false, message: "amount must be a number" });

  // Allowed payment methods
  if (!allowedMethods.includes(payment_method)) {
    return res.status(400).json({
      success: false,
      message: `Invalid payment_method. Allowed: ${allowedMethods.join(", ")}`
    });
  }

  // Allowed payment statuses
  if (!allowedStatuses.includes(payment_status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid payment_status. Allowed: ${allowedStatuses.join(", ")}`
    });
  }

  // paid_at (if provided)
  if (paid_at && isNaN(Date.parse(paid_at))) {
    return res.status(400).json({ success: false, message: "paid_at must be a valid date" });
  }

  // transaction_ref (optional but must be string)
  if (transaction_ref && typeof transaction_ref !== "string") {
    return res.status(400).json({
      success: false,
      message: "transaction_ref must be a string"
    });
  }

  next();
};


// Validate Update Payment
exports.validateUpdatePayment = (req, res, next) => {
  const { payment_status, paid_at, transaction_ref } = req.body;

  // Status must be valid if provided
  if (payment_status && !allowedStatuses.includes(payment_status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid payment_status. Allowed: ${allowedStatuses.join(", ")}`
    });
  }

  // paid_at must be valid if provided
  if (paid_at && isNaN(Date.parse(paid_at))) {
    return res.status(400).json({
      success: false,
      message: "paid_at must be a valid date"
    });
  }

  // transaction_ref must be string if provided
  if (transaction_ref && typeof transaction_ref !== "string") {
    return res.status(400).json({
      success: false,
      message: "transaction_ref must be a string"
    });
  }

  next();
};
