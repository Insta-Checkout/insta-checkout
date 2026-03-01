async function sendWelcomeMessage(whatsappNumber, businessName) {
  const message = [
    `🎉 أهلاً بيك في InstaPay Checkout!`,
    ``,
    `أنا البوت بتاعك لإنشاء لينكات دفع. في أي وقت عايز تعمل لينك دفع، ابعتلي اسم المنتج والسعر كده:`,
    ``,
    `"شوكولاتة كيك 300"`,
    ``,
    `وأنا هبعتلك اللينك في ثانية! ✅`,
  ].join("\n");

  console.log(`[WhatsApp Stub] Sending welcome message to ${whatsappNumber}:`);
  console.log(message);
  console.log(`[WhatsApp Stub] Message sent successfully (stub)`);
}

module.exports = { sendWelcomeMessage };
