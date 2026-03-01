const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Seller ID is required"],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0.01, "Price must be greater than 0"],
    },
    buyerPhone: {
      type: String,
      required: [true, "Buyer phone number is required"],
    },
    screenshotUrl: {
      type: String,
      required: [true, "Screenshot URL is required"],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["pending", "confirmed", "rejected"],
        message: "Status must be pending, confirmed, or rejected",
      },
      default: "pending",
    },
    checkoutPageUrl: {
      type: String,
      required: [true, "Checkout page URL is required"],
      unique: true,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ sellerId: 1, status: 1 });
orderSchema.index({ sellerId: 1, createdAt: 1 });
orderSchema.index({ buyerPhone: 1, sellerId: 1 });

module.exports = mongoose.model("Order", orderSchema);
