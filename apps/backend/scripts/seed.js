require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const connectDB = require("../db");
const Seller = require("../models/Seller");
const Product = require("../models/Product");

async function seed() {
  await connectDB();

  await Seller.deleteMany({});
  await Product.deleteMany({});
  const paymentLinks = mongoose.connection.db.collection("payment_links");
  await paymentLinks.deleteMany({});

  await Seller.syncIndexes();
  await Product.syncIndexes();
  console.log("Cleared existing data and synced indexes");

  const seller = await Seller.create({
    businessName: "Sweet Bites",
    category: "Food & Desserts",
    locale: "ar",
    instapayNumber: "01012345678",
    maskedFullName: "أ*** م*** أ** م***",
    whatsappNumber: "201098765432",
    firebaseUid: "seed-seller-firebase-uid-001",
    email: "sweetbites@example.com",
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

  const checkoutBase = process.env.CHECKOUT_BASE_URL || "http://localhost:3001";
  const token = "seed-link-token-" + Date.now();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const paymentLink = await paymentLinks.insertOne({
    token,
    sellerId: seller._id,
    productId: product._id,
    productName: product.name,
    price: product.price,
    checkoutUrl: `${checkoutBase.replace(/\/$/, "")}/l/${token}`,
    status: "confirmed",
    createdAt: now,
    paidAt: now,
    confirmedAt: now,
    buyerPhone: "201112345678",
    buyerName: "Test Buyer",
    screenshotUrl: "https://example.com/screenshot.png",
    expiresAt,
  });
  console.log("Created payment link:", paymentLink.insertedId.toString(), "status: confirmed");

  const readBack = {
    seller: await Seller.findById(seller._id).lean(),
    product: await Product.findById(product._id).lean(),
    paymentLink: await paymentLinks.findOne({ _id: paymentLink.insertedId }),
  };
  console.log("\nVerification — read back all documents:");
  console.log("Seller:", JSON.stringify(readBack.seller, null, 2));
  console.log("Product:", JSON.stringify(readBack.product, null, 2));
  console.log("Payment link:", JSON.stringify(readBack.paymentLink, null, 2));

  const indexes = {
    sellers: await Seller.collection.getIndexes(),
    products: await Product.collection.getIndexes(),
  };
  console.log("\nIndexes:");
  console.log("sellers:", JSON.stringify(indexes.sellers, null, 2));
  console.log("products:", JSON.stringify(indexes.products, null, 2));

  console.log("\nDuplicate WhatsApp test...");
  try {
    await Seller.create({
      businessName: "Duplicate Test",
      category: "Other",
      instapayNumber: "99999999",
      maskedFullName: "T*** T***",
      whatsappNumber: "201098765432",
      firebaseUid: "seed-duplicate-uid",
      email: "duplicate@example.com",
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
