import React from "react";
import { Icon } from "../Icon";

type FreeTierProps = {
  animationDelay: string;
  subscription: any;
};

const features = ["Unlimited Job Filtering", "Works locally in browser"];

const FreeTierComponent = ({ subscription, animationDelay }: FreeTierProps) => {
  if (!subscription) {
    return null;
  }
  const isPlanActive = subscription?.status === "free";

  const tierClasses = isPlanActive
    ? "bg-gradient-to-br from-green-600/20 to-blue-600/20 border-2 border-green-500 relative transform md:scale-105"
    : "bg-gray-800 border border-gray-700 hover:border-gray-600";

  const buttonClasses = isPlanActive
    ? "bg-green-600 hover:bg-green-700"
    : "bg-gray-700 hover:bg-gray-600";

  return (
    <div
      className={`rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl animate-fade-in-up group ${tierClasses}`}
      style={{ animationDelay }}
    >
      {isPlanActive && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
            CURRENT PLAN
          </span>
        </div>
      )}

      {/* --- Card Content --- */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors duration-300">
          Free
        </h3>
        <div className="text-4xl font-bold mb-4">
          €0
          <span className="text-lg text-gray-400">/month</span>
        </div>
        <p className="text-gray-300">Perfect for getting started</p>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-center transform hover:translate-x-2 transition-transform duration-200"
          >
            <Icon
              name="Check"
              className="w-5 h-5 text-green-400 mr-3 flex-shrink-0"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href="https://chrome.google.com/webstore/detail/your-app-name/your-app-id"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button
          className={`block w-full text-center py-3 px-6 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${buttonClasses} disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          Get Started Now
        </button>
      </a>
    </div>
  );
};

export const FreeTier = React.memo(FreeTierComponent);
