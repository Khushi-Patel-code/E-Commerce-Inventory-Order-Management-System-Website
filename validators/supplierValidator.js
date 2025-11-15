// validators/supplierValidator.js

module.exports.validateSupplier = (req, res, next) => {
  const { supplier_name, contact_name, email, phone, address } = req.body;

  // Required field check
  if (!supplier_name || supplier_name.trim() === "") {
    return res.status(400).json({ success: false, message: "Supplier name is required." });
  }

  // supplier_name must be string
  if (typeof supplier_name !== "string") {
    return res.status(400).json({ success: false, message: "Supplier name must be a string." });
  }

  // Optional string checks
  if (contact_name && typeof contact_name !== "string") {
    return res.status(400).json({ success: false, message: "Contact name must be a string." });
  }

  if (address && typeof address !== "string") {
    return res.status(400).json({ success: false, message: "Address must be a string." });
  }

  // Email format check
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }
  }

  // Phone validation (basic)
  if (phone && typeof phone !== "string") {
    return res.status(400).json({ success: false, message: "Phone must be a string." });
  }

  next();
};
