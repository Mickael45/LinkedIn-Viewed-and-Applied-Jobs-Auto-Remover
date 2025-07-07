import { FeatureCard } from "../ui/FeatureCard";
import { FEATURES } from "../../data/landingPageData";

export const FeaturesSection = () => (
  <section className="py-24 bg-theme-panel/50">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
          Two Problems. <span className="text-theme-accent">One Solution.</span>
        </h2>
        <p className="text-xl text-theme-text-secondary max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
          Stop wasting time on LinkedIn's broken job feed. Our extension fixes
          what LinkedIn can't.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-12">
        {FEATURES.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            {...feature}
            animationDelay={`${(index + 2) * 200}ms`}
          />
        ))}
      </div>
    </div>
  </section>
);
