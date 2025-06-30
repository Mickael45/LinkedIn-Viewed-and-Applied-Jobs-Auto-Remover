import { PricingTier } from "../ui/PricingTier";
import { PRICING_TIERS } from "../../data/landingPageData";

export const PricingSection = () => (
  <section id="pricing" className="py-24 bg-gray-800/50">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
          Choose Your <span className="text-blue-400">Power Level</span>
        </h2>
        <p className="text-xl text-gray-300 animate-fade-in-up animation-delay-200">
          Start saving time today with our flexible pricing options.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {PRICING_TIERS.map((tier, index) => (
          <PricingTier
            key={tier.name}
            {...tier}
            animationDelay={`${(index + 2) * 200}ms`}
          />
        ))}
      </div>
    </div>
  </section>
);
