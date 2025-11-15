// validators/inventoryValidator.js

// -----------------------------
// Validate Create Inventory
// -----------------------------
exports.validateCreateInventory = (req, res, next) => {
  const { product_id, warehouse_id, quantity } = req.body;

  // Required checks
  if (!product_id)
    return res.status(400).json({ success: false, message: "product_id is required" });

  if (!warehouse_id)
    return res.status(400).json({ success: false, message: "warehouse_id is required" });

  if (quantity === undefined)
    return res.status(400).json({ success: false, message: "quantity is required" });

  // Type checks
  if (isNaN(product_id))
    return res.status(400).json({ success: false, message: "product_id must be a number" });

  if (isNaN(warehouse_id))
    return res.status(400).json({ success: false, message: "warehouse_id must be a number" });

  if (isNaN(quantity))
    return res.status(400).json({ success: false, message: "quantity must be a number" });

  if (quantity < 0)
    return res.status(400).json({ success: false, message: "quantity cannot be negative" });

  next();
};

// -----------------------------
// Validate Update Inventory
// -----------------------------
exports.validateUpdateInventory = (req, res, next) => {
  const { quantity } = req.body;

  // quantity is required for update
  if (quantity === undefined)
    return res.status(400).json({ success: false, message: "quantity is required" });

  if (isNaN(quantity))
    return res.status(400).json({ success: false, message: "quantity must be a number" });

  if (quantity < 0)
    return res.status(400).json({ success: false, message: "quantity cannot be negative" });

  next();
};
