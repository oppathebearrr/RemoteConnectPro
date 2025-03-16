import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/sections/HeroSection";
import FeaturesSection from "@/sections/FeaturesSection";
import ClientServerSection from "@/sections/ClientServerSection";
import PricingSection from "@/sections/PricingSection";
import FAQSection from "@/sections/FAQSection";
import CTASection from "@/sections/CTASection";
import ContactSection from "@/sections/ContactSection";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ClientServerSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
