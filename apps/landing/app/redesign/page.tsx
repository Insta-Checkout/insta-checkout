import { RedesignNavbar } from "@/components/redesign/RedesignNavbar"
import { RedesignHeroSection } from "@/components/redesign/RedesignHeroSection"
import { RedesignPainPointsSection } from "@/components/redesign/RedesignPainPointsSection"
import { RedesignHowItWorksSection } from "@/components/redesign/RedesignHowItWorksSection"
import { RedesignDemoSection } from "@/components/redesign/RedesignDemoSection"
import { RedesignFeaturesSection } from "@/components/redesign/RedesignFeaturesSection"
import { RedesignSocialProofSection } from "@/components/redesign/RedesignSocialProofSection"
import { RedesignPricingSection } from "@/components/redesign/RedesignPricingSection"
import { RedesignFinalCtaSection } from "@/components/redesign/RedesignFinalCtaSection"
import { RedesignFooter } from "@/components/redesign/RedesignFooter"

export const dynamic = "force-dynamic"

export default function RedesignPage() {
  return (
    <>
      <RedesignNavbar />
      <main>
        <RedesignHeroSection />
        <RedesignPainPointsSection />
        <RedesignHowItWorksSection />
        <RedesignDemoSection />
        <RedesignFeaturesSection />
        <RedesignSocialProofSection />
        <RedesignPricingSection />
        <RedesignFinalCtaSection />
      </main>
      <RedesignFooter />
    </>
  )
}
