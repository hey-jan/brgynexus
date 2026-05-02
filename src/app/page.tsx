import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/features/landing/HeroSection";
import { ServicesSection } from "@/components/features/landing/ServicesSection";
import { AboutSection } from "@/components/features/landing/AboutSection";
import { FAQSection } from "@/components/features/landing/FAQSection";
import { ContactSection } from "@/components/features/landing/ContactSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
