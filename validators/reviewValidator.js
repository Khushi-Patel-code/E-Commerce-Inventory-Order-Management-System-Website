// validators/reviewValidator.js

module.exports.validateReview = (req, res, next) => {
  const { product_id, user_id, rating, comment } = req.body;

  // Required: product_id
  if (!product_id || isNaN(product_id)) {
    return res.status(400).json({
      success: false,
      message: "product_id is required and must be a number."
    });
  }

  // Required: user_id
  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({
      success: false,
      message: "user_id is required and must be a number."
    });
  }

  // Required: rating (1–5)
  if (rating === undefined || isNaN(rating)) {
    return res.status(400).json({
      success: false,
      message: "rating is required and must be a number."
    });
  }

  const ratingValue = Number(rating);
  if (ratingValue < 1 || ratingValue > 5) {
    return res.status(400).json({
      success: false,
      message: "rating must be between 1 and 5."
    });
  }

  // comment must be a string if provided
  if (comment && typeof comment !== "string") {
    return res.status(400).json({
      success: false,
      message: "comment must be a string."
    });
  }

  next();
};
