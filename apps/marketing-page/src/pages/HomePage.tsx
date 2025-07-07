import { useUser, useClerk } from "@clerk/clerk-react";
import { useState, useEffect, useCallback } from "react";
import { FaqSection } from "../components/sections/FaqSection";
import { FeaturesSection } from "../components/sections/FeaturesSection";
import { FooterSection } from "../components/sections/FooterSection";
import { HeroSection } from "../components/sections/HeroSection";
import { HowItWorksSection } from "../components/sections/HowItWorksSection";
import { PricingSection } from "../components/sections/PricingSection";
import AuthModal from "../components/ui/AuthModal";
import Header from "../components/ui/Header";
import {
  sendLogoutToExtension,
  sendTokenToExtension,
} from "../lib/chromeMessageSender";

function HomePage() {
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: "signin" | "signup";
  }>({
    isOpen: false,
    mode: "signin",
  });
  const { isSignedIn, user } = useUser();
  const { session } = useClerk();

  useEffect(() => {
    if (!isSignedIn || !session || !user) {
      sendLogoutToExtension();
      return;
    }
    sendTokenToExtension(session, user);
  }, [isSignedIn, session, user]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

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

export default HomePage;
