import { Suspense } from "react"
import { CheckoutFlow } from "@/components/checkout/checkout-flow"
import { fetchCheckoutData } from "@/lib/api"
import { CheckoutErrorState } from "./checkout-error-state"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function CheckoutTokenPage({ params }: PageProps) {
  const { token } = await params

  const result = await fetchCheckoutData(token)

  if (!result.ok) {
    const linkStatus = result.linkStatus ?? ""
    const errorKey =
      result.error === "LINK_PREVIEW" || linkStatus === "preview"
        ? "comingSoon"
        : result.error === "LINK_EXPIRED" || linkStatus === "expired"
          ? "expired"
          : result.error === "LINK_UNAVAILABLE" && linkStatus === "cancelled"
            ? "cancelled"
            : result.error === "LINK_UNAVAILABLE" && linkStatus === "paid"
              ? "alreadyPaid"
              : "notFound"
    return <CheckoutErrorState errorKey={errorKey} />
  }

  const { data } = result
  const productName =
    data.locale === "ar"
      ? data.product.nameAr || data.product.name
      : data.product.nameEn || data.product.name

  return (
    <Suspense>
      <CheckoutFlow
        sellerName={data.seller.businessName}
        sellerLogo={data.seller.logoUrl ?? undefined}
        categoryTag={data.seller.category ?? undefined}
        productName={productName}
        productImage={data.product.imageUrl ?? undefined}
        price={String(data.product.price)}
        instapayLink={data.seller.instapayLink ?? null}
        whatsappLink={
          data.seller.whatsappNumber
            ? `https://wa.me/${data.seller.whatsappNumber}`
            : undefined
        }
        paymentLinkId={data.paymentLinkId}
        token={token}
        sellerPlan={data.seller.plan ?? "free"}
        sellerBranding={data.seller.branding ?? undefined}
      />
    </Suspense>
  )
}
