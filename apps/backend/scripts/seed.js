require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const connectDB = require("../db");
const Seller = require("../models/Seller");
const Product = require("../models/Product");
const Order = require("../models/Order");

async function seed() {
  await connectDB();

  await Seller.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});

  await Seller.syncIndexes();
  await Product.syncIndexes();
  await Order.syncIndexes();
  console.log("Cleared existing data and synced indexes");

  const seller = await Seller.create({
    businessName: "Sweet Bites",
    category: "Food & Desserts",
    instapayNumber: "01012345678",
    maskedFullName: "أ*** م*** أ** م***",
    whatsappNumber: "201098765432",
    whatsappVerified: false,
    socialLinks: {
      instagram: "https://instagram.com/sweetbites",
      facebook: "",
    },
  });
  console.log("Created seller:", seller.businessName, seller._id.toString());

  const product = await Product.create({
    sellerId: seller._id,
    name: "Chocolate Cake",
    price: 300,
  });
  console.log("Created product:", product.name, product._id.toString());

  const order = await Order.create({
    sellerId: seller._id,
    productId: product._id,
    productName: product.name,
    price: product.price,
    buyerPhone: "201112345678",
    screenshotUrl: "https://example.com/screenshot.png",
    status: "pending",
    checkoutPageUrl: `https://pay.instacheckout.co/${seller._id}/${product._id}`,
  });
  console.log("Created order:", order._id.toString(), "status:", order.status);

  const readBack = {
    seller: await Seller.findById(seller._id).lean(),
    product: await Product.findById(product._id).lean(),
    order: await Order.findById(order._id).lean(),
  };
  console.log("\nVerification — read back all documents:");
  console.log("Seller:", JSON.stringify(readBack.seller, null, 2));
  console.log("Product:", JSON.stringify(readBack.product, null, 2));
  console.log("Order:", JSON.stringify(readBack.order, null, 2));

  const indexes = {
    sellers: await Seller.collection.getIndexes(),
    products: await Product.collection.getIndexes(),
    orders: await Order.collection.getIndexes(),
  };
  console.log("\nIndexes:");
  console.log("sellers:", JSON.stringify(indexes.sellers, null, 2));
  console.log("products:", JSON.stringify(indexes.products, null, 2));
  console.log("orders:", JSON.stringify(indexes.orders, null, 2));

  console.log("\nDuplicate WhatsApp test...");
  try {
    await Seller.create({
      businessName: "Duplicate Test",
      category: "Other",
      instapayNumber: "99999999",
      maskedFullName: "T*** T***",
      whatsappNumber: "201098765432",
    });
    console.log("ERROR: Duplicate should have been rejected!");
  } catch (err) {
    console.log("Correctly rejected duplicate WhatsApp number:", err.message);
  }

  await mongoose.disconnect();
  console.log("\nSeed complete. Disconnected.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
