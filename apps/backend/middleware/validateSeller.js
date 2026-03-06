function validateSeller(req, res, next) {
  const errors = [];
  const body = req.body || {};

  const businessName = typeof body.businessName === "string" ? body.businessName.trim() : "";
  if (!businessName) {
    errors.push({ field: "businessName", message: "Business name is required" });
  } else if (businessName.length < 2 || businessName.length > 100) {
    errors.push({ field: "businessName", message: "Business name must be 2–100 characters" });
  }

  const category = typeof body.category === "string" ? body.category.trim() || null : null;

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

  const firebaseUid = typeof body.firebaseUid === "string" ? body.firebaseUid.trim() : "";
  if (!firebaseUid) {
    errors.push({ field: "firebaseUid", message: "Firebase UID is required" });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: "email", message: "Email must be a valid format" });
  }

  const locale = typeof body.locale === "string" ? body.locale.trim() : null;
  if (locale && locale !== "en" && locale !== "ar") {
    errors.push({ field: "locale", message: "Locale must be en or ar" });
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
  req.body.category = category || null;
  req.body.locale = locale === "en" || locale === "ar" ? locale : "ar";
  req.body.instapayNumber = instapayNumber;
  req.body.maskedFullName = maskedFullName;
  req.body.whatsappNumber = whatsappNumber;
  req.body.firebaseUid = firebaseUid;
  req.body.email = email;

  next();
}

module.exports = validateSeller;
