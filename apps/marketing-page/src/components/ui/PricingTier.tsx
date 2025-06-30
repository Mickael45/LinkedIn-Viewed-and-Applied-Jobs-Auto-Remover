import React from "react";
import { Icon } from "./Icon";

type PricingTierProps = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
  isRecommended: boolean;
  animationDelay: string;
};

const PricingTierComponent = ({
  name,
  price,
  period,
  description,
  features,
  buttonText,
  buttonLink,
  isRecommended,
  animationDelay,
}: PricingTierProps) => {
  const tierClasses = isRecommended
    ? "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-500 relative transform md:scale-105 hover:scale-110"
    : "bg-gray-800 border border-gray-700 hover:border-gray-600";

  const buttonClasses = isRecommended
    ? "bg-blue-600 hover:bg-blue-700 group-hover:shadow-xl group-hover:shadow-blue-500/50"
    : "bg-gray-700 hover:bg-gray-600 group-hover:shadow-lg";

  return (
    <div
      className={`rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl animate-fade-in-up group ${tierClasses}`}
      style={{ animationDelay }}
    >
      {isRecommended && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse">
            RECOMMENDED
          </span>
        </div>
      )}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors duration-300">
          {name}
        </h3>
        <div className="text-4xl font-bold mb-4">
          {price}
          <span className="text-lg text-gray-400">{period}</span>
        </div>
        <p className="text-gray-300">{description}</p>
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
        href={buttonLink}
        className={`block w-full text-center py-3 px-6 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${buttonClasses}`}
      >
        {buttonText}
      </a>
    </div>
  );
};

export const PricingTier = React.memo(PricingTierComponent);
