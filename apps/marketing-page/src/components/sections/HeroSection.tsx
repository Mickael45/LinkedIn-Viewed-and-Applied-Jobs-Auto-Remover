import { useParallax } from "../../hooks/useParallax";
import { ParallaxBackground } from "../ui/ParallaxBackground";
import { Icon } from "../ui/Icon";

type HeroProps = { onGetStartedClick: () => void };

export const HeroSection = ({ onGetStartedClick }: HeroProps) => {
  const contentRef = useParallax<HTMLDivElement>(0.1);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <ParallaxBackground />
      <div
        ref={contentRef}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
      >
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 transform hover:scale-110 transition-all duration-300 hover:rotate-3 animate-bounce-gentle">
            <Icon
              name="Target"
              className="w-8 h-8 text-white animate-spin-slow"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-400 mb-2 animate-fade-in-up animation-delay-100">
            LinkedIn JobLens AI
          </h1>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up animation-delay-200">
          <span className="inline-block animate-slide-in-left">
            Stop Re-Reading.
          </span>
          <br />
          <span className="text-blue-400 bg-gradient-to-r from-blue-400 pb-4 to-purple-500 bg-clip-text text-transparent animate-gradient inline-block animate-slide-in-right animation-delay-400">
            Start Interviewing.
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-600">
          The ultimate Chrome Extension to clean up your LinkedIn job feed and
          get straight to the opportunities that matter.
          <span className="text-blue-400 animate-text-glow">
            {" "}
            Mark the noise and highlight the signal.
          </span>
        </p>
        <button
          onClick={onGetStartedClick}
          className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl hover:shadow-blue-500/25 animate-fade-in-up animation-delay-800 group animate-pulse-cta"
        >
          <span className="animate-text-shimmer">Get Started Now</span>
          <Icon
            name="Zap"
            className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform duration-300 animate-electric"
          />
        </button>
      </div>
    </section>
  );
};
