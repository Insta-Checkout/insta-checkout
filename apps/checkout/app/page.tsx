import type { Metadata } from "next"
import { SplashPage } from "@/components/splash/splash-page"

export const metadata: Metadata = {
  title: "Insta Checkout — لينكات دفع InstaPay للبائعين",
  description:
    "Insta Checkout powers secure InstaPay payment links for Egyptian sellers. Create a link, share it, get paid.",
  openGraph: {
    title: "Insta Checkout — InstaPay Payment Links for Sellers",
    description:
      "The payment link platform built for Egyptian sellers. Create a link in seconds, share it on WhatsApp or Instagram, and get paid via InstaPay.",
    type: "website",
  },
}

export default function CheckoutPage(): React.JSX.Element {
  return <SplashPage />
}
