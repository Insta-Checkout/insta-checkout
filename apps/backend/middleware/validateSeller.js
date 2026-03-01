const VALID_CATEGORIES = [
  "Food & Desserts",
  "Clothing",
  "Services",
  "Electronics",
  "Other",
];

function validateSeller(req, res, next) {
  const errors = [];
  const body = req.body || {};

  const businessName = typeof body.businessName === "string" ? body.businessName.trim() : "";
  if (!businessName) {
    errors.push({ field: "businessName", message: "Business name is required" });
  } else if (businessName.length < 2 || businessName.length > 100) {
    errors.push({ field: "businessName", message: "Business name must be 2–100 characters" });
  }

  const category = typeof body.category === "string" ? body.category.trim() : "";
  if (!category) {
    errors.push({ field: "category", message: "Category is required" });
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.push({ field: "category", message: `Category must be one of: ${VALID_CATEGORIES.join(", ")}` });
  }

  const instapayNumber = typeof body.instapayNumber === "string" ? body.instapayNumber.trim() : "";
  if (!instapayNumber) {
    errors.push({ field: "instapayNumber", message: "InstaPay number is required" });
  }

  const maskedFullName = typeof body.maskedFullName === "string" ? body.maskedFullName.trim() : "";
  if (!maskedFullName) {
    errors.push({ field: "maskedFullName", message: "Masked full name is required" });
  } else if (!maskedFullName.includes("*")) {
    errors.push({ field: "maskedFullName", message: "Masked full name must contain at least one * character" });
  }

  const whatsappNumber = typeof body.whatsappNumber === "string" ? body.whatsappNumber.trim() : "";
  if (!whatsappNumber) {
    errors.push({ field: "whatsappNumber", message: "WhatsApp number is required" });
  } else if (!/^20[0-9]{10}$/.test(whatsappNumber)) {
    errors.push({ field: "whatsappNumber", message: "Must be a valid Egyptian phone number (20XXXXXXXXXX)" });
  }

  if (body.socialLinks) {
    const { instagram, facebook } = body.socialLinks;
    if (instagram && typeof instagram === "string" && instagram.trim()) {
      try {
        new URL(instagram);
      } catch {
        errors.push({ field: "socialLinks.instagram", message: "Instagram link must be a valid URL" });
      }
    }
    if (facebook && typeof facebook === "string" && facebook.trim()) {
      try {
        new URL(facebook);
      } catch {
        errors.push({ field: "socialLinks.facebook", message: "Facebook link must be a valid URL" });
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "VALIDATION_ERROR",
      details: errors,
    });
  }

  req.body.businessName = businessName;
  req.body.category = category;
  req.body.instapayNumber = instapayNumber;
  req.body.maskedFullName = maskedFullName;
  req.body.whatsappNumber = whatsappNumber;

  next();
}

module.exports = validateSeller;
