import { CheckoutFlow } from "@/components/checkout/checkout-flow"

export const dynamic = "force-dynamic";

// In production, this data would come from a database lookup
// based on the unique payment link ID in the URL path
const checkoutData = {
  sellerName: "حلويات سارة",
  categoryTag: "حلويات ومخبوزات",
  productName: "كيكة شوكولاتة",
  productNameAr: "كيكة شوكولاتة",
  productNameEn: "Chocolate cake",
  productImage: "/images/chocolate-cake.jpg",
  price: "300",
  instapayLink: "https://ipn.eg/S/demo",
  whatsappLink: "https://wa.me/201012345678",
}

export default function CheckoutPage() {
  return (
    <CheckoutFlow
      sellerName={checkoutData.sellerName}
      categoryTag={checkoutData.categoryTag}
      productName={checkoutData.productName}
      productNameAr={checkoutData.productNameAr}
      productNameEn={checkoutData.productNameEn}
      productImage={checkoutData.productImage}
      price={checkoutData.price}
      instapayLink={checkoutData.instapayLink}
      whatsappLink={checkoutData.whatsappLink}
    />
  )
}
