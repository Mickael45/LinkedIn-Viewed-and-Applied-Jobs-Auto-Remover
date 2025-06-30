import { FaqItem } from "../ui/FaqItem";
import { FAQ_DATA } from "../../data/landingPageData";

export const FaqSection = () => (
  <section className="py-24 bg-gray-900">
    <div className="max-w-4xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
          Questions? <span className="text-blue-400">We've Got Answers.</span>
        </h2>
      </div>
      <div className="space-y-4">
        {FAQ_DATA.map((faq, index) => (
          <FaqItem
            key={faq.question}
            {...faq}
            animationDelay={`${(index + 1) * 100}ms`}
          />
        ))}
      </div>
    </div>
  </section>
);
