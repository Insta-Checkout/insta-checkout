const express = require("express");
const router = express.Router();
const Seller = require("../models/Seller");
const validateSeller = require("../middleware/validateSeller");
const { sendWelcomeMessage } = require("../services/whatsapp");

router.get("/health", (_req, res) => {
  res.json({ status: "ok", collection: "sellers" });
});

router.post("/", validateSeller, async (req, res) => {
  try {
    const {
      businessName,
      category,
      instapayNumber,
      maskedFullName,
      whatsappNumber,
      firebaseUid,
      email,
      socialLinks,
      locale,
    } = req.body;

    const seller = await Seller.create({
      businessName,
      category,
      instapayNumber,
      maskedFullName,
      whatsappNumber,
      firebaseUid,
      email,
      whatsappVerified: false,
      locale: locale === "en" || locale === "ar" ? locale : "ar",
      socialLinks: {
        instagram: socialLinks?.instagram || "",
        facebook: socialLinks?.facebook || "",
      },
      lastActiveAt: new Date(),
    });

    sendWelcomeMessage(whatsappNumber, businessName).catch((err) => {
      console.error("[WhatsApp] Failed to send welcome message:", err.message);
    });

    return res.status(201).json({
      success: true,
      seller: {
        _id: seller._id,
        businessName: seller.businessName,
        category: seller.category,
        instapayNumber: seller.instapayNumber,
        maskedFullName: seller.maskedFullName,
        whatsappNumber: seller.whatsappNumber,
        whatsappVerified: seller.whatsappVerified,
        locale: seller.locale,
        createdAt: seller.createdAt,
      },
      message: "Seller registered. WhatsApp verification sent.",
    });
  } catch (err) {
    if (err.name === "MongoServerError" && err.code === 11000) {
      const key = err.keyPattern ? Object.keys(err.keyPattern)[0] : "";
      if (key === "email" || key === "firebaseUid") {
        return res.status(409).json({
          success: false,
          error: "DUPLICATE_EMAIL",
          message: "A seller with this email already exists.",
        });
      }
      return res.status(409).json({
        success: false,
        error: "DUPLICATE_WHATSAPP",
        message: "A seller with this WhatsApp number already exists.",
      });
    }

    if (err.name === "ValidationError") {
      const details = Object.entries(err.errors).map(([field, e]) => ({
        field,
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        details,
      });
    }

    console.error("[POST /sellers] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      error: "INTERNAL_ERROR",
      message: "Something went wrong. Please try again.",
    });
  }
});

module.exports = router;
