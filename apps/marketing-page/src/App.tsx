import { useCallback, useState } from "react";
import { HeroSection } from "./components/sections/HeroSection";
import { FeaturesSection } from "./components/sections/FeaturesSection";
import { HowItWorksSection } from "./components/sections/HowItWorksSection";
import { PricingSection } from "./components/sections/PricingSection";
import { FaqSection } from "./components/sections/FaqSection";
import { FooterSection } from "./components/sections/FooterSection";
import AuthModal from "./components/ui/AuthModal";
import Header from "./components/ui/Header";

function App() {
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: "signin" | "signup";
  }>({
    isOpen: false,
    mode: "signin",
  });

  const handleAuthClick = (mode: "signin" | "signup") => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: "signin" });
  };

  const handleAuthModeChange = (mode: "signin" | "signup") => {
    setAuthModal({ isOpen: true, mode });
  };

  const scrollToPricing = useCallback(() => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Header onAuthClick={handleAuthClick} />
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
        onModeChange={handleAuthModeChange}
      />
      <HeroSection onGetStartedClick={scrollToPricing} />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <FaqSection />
      <FooterSection onGetStartedClick={scrollToPricing} />
    </main>
  );
}

export default App;
