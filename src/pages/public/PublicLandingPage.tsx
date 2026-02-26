import { Navbar } from '../../components/landing/Navbar';
import { HeroSection } from '../../components/landing/HeroSection';
import { LogoBar } from '../../components/landing/LogoBar';
import { WhySection } from '../../components/landing/WhySection';
import { MetricsSection } from '../../components/landing/MetricsSection';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { SocialProofSection } from '../../components/landing/SocialProofSection';
import { PricingSection } from '../../components/landing/PricingSection';
import { FAQSection } from '../../components/landing/FAQSection';
import { ComplianceSection } from '../../components/landing/ComplianceSection';
import { CTASection } from '../../components/landing/CTASection';
import { Footer } from '../../components/landing/Footer';

export function PublicLandingPage() {
  return (
    <main className="min-h-screen w-full bg-cream text-charcoal font-sans selection:bg-terracotta/30">
      <Navbar />
      <HeroSection />
      <LogoBar />
      <WhySection />
      <MetricsSection />
      <FeaturesSection />
      <SocialProofSection />
      <PricingSection />
      <FAQSection />
      <ComplianceSection />
      <CTASection />
      <Footer />
    </main>
  );
}
