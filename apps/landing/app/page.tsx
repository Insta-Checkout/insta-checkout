import { AuthRedirect } from "@/components/auth-redirect"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { PainPointsSection } from "@/components/pain-points-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { DemoSection } from "@/components/demo/demo-section"
import { FeaturesSection } from "@/components/features-section"
import { SocialProofSection } from "@/components/social-proof-section"
import { PricingSection } from "@/components/pricing-section"
import { FinalCtaSection } from "@/components/final-cta-section"
import { Footer } from "@/components/footer"

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <AuthRedirect />
      <Navbar />
      <main>
        <HeroSection />
        <PainPointsSection />
        <HowItWorksSection />
        <DemoSection />
        <FeaturesSection />
        <SocialProofSection />
        <PricingSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  )
}
