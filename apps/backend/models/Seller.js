const mongoose = require("mongoose");

const ALLOWED_CATEGORIES = [
  "Food & Beverage",
  "Clothing & Fashion",
  "Electronics",
  "Services",
  "Beauty & Care",
  "Home & Decor",
  "Sports & Fitness",
  "Books & Education",
  "Toys & Kids",
  "Jewelry & Accessories",
  "Health & Medical",
  "Automotive",
  "Art & Crafts",
  "Digital Products",
  "Other",
  // Legacy values — accepted for backwards compat
  "Food & Desserts",
  "Clothing",
];

const sellerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: false,
      default: null,
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name must be at most 100 characters"],
    },
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      minlength: [2, "Business name must be at least 2 characters"],
      maxlength: [100, "Business name must be at most 100 characters"],
    },
    category: {
      type: String,
      required: false,
      default: null,
      validate: {
        validator(v) {
          if (v == null || v === "") return true;
          return ALLOWED_CATEGORIES.includes(v);
        },
        message: "Category must be one of the allowed values",
      },
    },
    instapayInfo: {
      method: {
        type: String,
        enum: ["mobile", "bank", "ipa"],
        default: null,
      },
      mobile: { type: String, trim: true, default: null },
      bankName: { type: String, trim: true, default: null },
      bankAccountNumber: { type: String, trim: true, default: null },
      ipaAddress: { type: String, trim: true, default: null },
    },
    // Legacy field — kept for backwards compat with existing data
    instapayNumber: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },
    maskedFullName: {
      type: String,
      required: false,
      default: null,
      trim: true,
      validate: {
        validator: (v) => v == null || v === "" || v.includes("*"),
        message: "Masked full name must contain at least one * character",
      },
    },
    firebaseUid: {
      type: String,
      required: [true, "Firebase UID is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    whatsappNumber: {
      type: String,
      required: false,
      default: null,
      sparse: true,
      validate: {
        validator: (v) => v == null || v === "" || /^20[0-9]{10}$/.test(v),
        message:
          "WhatsApp number must be in Egyptian format (20 followed by 10 digits)",
      },
    },
    whatsappVerified: {
      type: Boolean,
      default: false,
    },
    logoUrl: {
      type: String,
      default: null,
    },
    plan: {
      type: String,
      enum: { values: ["free", "pro"], message: "Plan must be free or pro" },
      default: "free",
    },
    branding: {
      logoUrl: { type: String, default: null },
      primaryColor: { type: String, default: null, trim: true },
      coverPhotoUrl: { type: String, default: null },
      slogan: { type: String, default: null, trim: true, maxlength: [80, "Slogan must be at most 80 characters"] },
      sloganAr: { type: String, default: null, trim: true, maxlength: [80, "Arabic slogan must be at most 80 characters"] },
      secondaryColor: { type: String, default: null, trim: true },
      accentColor: { type: String, default: null, trim: true },
      hidePoweredBy: { type: Boolean, default: false },
    },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    locale: {
      type: String,
      enum: { values: ["en", "ar"], message: "Locale must be en or ar" },
      default: "ar",
    },
    approvalStatus: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Approval status must be pending, approved, or rejected",
      },
      default: "pending",
    },
    approvalNote: {
      type: String,
      default: null,
      trim: true,
      maxlength: [500, "Approval note must be at most 500 characters"],
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

sellerSchema.index({ "instapayInfo.mobile": 1 }, { sparse: true });
sellerSchema.index({ firebaseUid: 1 }, { unique: true });
sellerSchema.index({ createdAt: 1 });
sellerSchema.index({ approvalStatus: 1, createdAt: 1 });

module.exports = mongoose.model("Seller", sellerSchema);
