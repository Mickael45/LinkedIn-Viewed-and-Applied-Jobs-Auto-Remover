import { Icon } from "../ui/Icon";

type FooterProps = { onGetStartedClick: () => void };

export const FooterSection = ({ onGetStartedClick }: FooterProps) => (
  <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
    <div className="relative max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up">
        Ready to Transform Your Job Search?
      </h2>
      <p className="text-xl mb-8 text-blue-100 animate-fade-in-up animation-delay-200">
        Join thousands of professionals who've already upgraded their LinkedIn
        experience.
      </p>
      <button
        onClick={onGetStartedClick}
        className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold text-lg rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl animate-fade-in-up animation-delay-400 group"
      >
        Choose Your Plan
        <Icon
          name="Shield"
          className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform duration-300"
        />
      </button>
    </div>
  </section>
);
