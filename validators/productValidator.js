// validators/productValidator.js

module.exports.validateProduct = (req, res, next) => {
  const {
    sku,
    product_name,
    description,
    category_id,
    price,
    retail_price,
    active
  } = req.body;

  // SKU required + string
  if (!sku || typeof sku !== "string") {
    return res.status(400).json({
      success: false,
      message: "SKU is required and must be a string."
    });
  }

  // Product name required + string
  if (!product_name || typeof product_name !== "string") {
    return res.status(400).json({
      success: false,
      message: "Product name is required and must be a string."
    });
  }

  // Description optional but must be string
  if (description && typeof description !== "string") {
    return res.status(400).json({
      success: false,
      message: "Description must be a string."
    });
  }

  // category_id must be a number if provided
  if (category_id !== undefined && isNaN(category_id)) {
    return res.status(400).json({
      success: false,
      message: "Category ID must be a number."
    });
  }

  // Price required and must be number >= 0
  if (price === undefined || isNaN(price)) {
    return res.status(400).json({
      success: false,
      message: "Price is required and must be a number."
    });
  }

  if (Number(price) < 0) {
    return res.status(400).json({
      success: false,
      message: "Price cannot be negative."
    });
  }

  // Retail price optional but must be number
  if (retail_price !== undefined && isNaN(retail_price)) {
    return res.status(400).json({
      success: false,
      message: "Retail price must be a number."
    });
  }

  // active flag must be 0 or 1 if provided
  if (active !== undefined && ![0, 1, "0", "1"].includes(active)) {
    return res.status(400).json({
      success: false,
      message: "Active must be 0 or 1."
    });
  }

  next();
};
