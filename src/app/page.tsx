import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { RoutesSection } from "@/components/RoutesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { PartnersSection } from "@/components/PartnersSection";
import { FAQSection } from "@/components/FAQSection";
import { CTABanner } from "@/components/CTABanner";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <RoutesSection />
      <HowItWorksSection />
      <PartnersSection />
      <FAQSection />
      <CTABanner />
      <Footer />
      <ScrollToTop />
    </main>
  );
}
