import { useCallback } from 'react';
import { HeroSection } from './components/sections/HeroSection';
import { FeaturesSection } from './components/sections/FeaturesSection';
import { HowItWorksSection } from './components/sections/HowItWorksSection';
import { PricingSection } from './components/sections/PricingSection';
import { FaqSection } from './components/sections/FaqSection';
import { FooterSection } from './components/sections/FooterSection';

function App() {
  const scrollToPricing = useCallback(() => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
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