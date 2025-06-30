import { StepCard } from "../ui/StepCard";
import { HOW_IT_WORKS_STEPS } from "../../data/landingPageData";

export const HowItWorksSection = () => (
  <section className="py-24 bg-gray-900">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
          Simple Setup. <span className="text-blue-400">Instant Results.</span>
        </h2>
        <p className="text-xl text-gray-300 animate-fade-in-up animation-delay-200">
          Get up and running in under 60 seconds.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <StepCard
            key={step.title}
            {...step}
            animationDelay={`${index * 200 + 300}ms`}
          />
        ))}
      </div>
    </div>
  </section>
);
