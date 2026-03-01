const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Seller ID is required"],
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0.01, "Price must be greater than 0"],
    },
    timesGenerated: {
      type: Number,
      default: 1,
    },
    lastGeneratedAt: {
      type: Date,
      default: Date.now,
    },
    isSaved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ sellerId: 1, name: 1, price: 1 });
productSchema.index({ sellerId: 1 });

module.exports = mongoose.model("Product", productSchema);
