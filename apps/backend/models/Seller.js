const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      minlength: [2, "Business name must be at least 2 characters"],
      maxlength: [100, "Business name must be at most 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Food & Desserts",
          "Clothing",
          "Services",
          "Electronics",
          "Other",
        ],
        message: "Category must be one of the allowed values",
      },
    },
    instapayNumber: {
      type: String,
      required: [true, "InstaPay number is required"],
      trim: true,
      validate: {
        validator: (v) => v.length > 0,
        message: "InstaPay number cannot be empty",
      },
    },
    maskedFullName: {
      type: String,
      required: [true, "Masked full name is required"],
      trim: true,
      validate: {
        validator: (v) => v.length > 0 && v.includes("*"),
        message: "Masked full name must contain at least one * character",
      },
    },
    whatsappNumber: {
      type: String,
      required: [true, "WhatsApp number is required"],
      unique: true,
      validate: {
        validator: (v) => /^20[0-9]{10}$/.test(v),
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
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

sellerSchema.index({ instapayNumber: 1 });
sellerSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Seller", sellerSchema);
