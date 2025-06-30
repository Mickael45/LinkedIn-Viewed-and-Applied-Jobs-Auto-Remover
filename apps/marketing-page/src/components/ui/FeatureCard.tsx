import React from "react";
import { Icon } from "./Icon";
import { IconName } from "../../data/landingPageData";

type FeatureCardProps = {
  icon: IconName;
  title: string;
  description: string;
  points: string[];
  animationDelay: string;
};

const FeatureCardComponent = ({
  icon,
  title,
  description,
  points,
  animationDelay,
}: FeatureCardProps) => (
  <div
    className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 animate-fade-in-up group"
    style={{ animationDelay }}
  >
    <div className="flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-2xl mb-6 group-hover:bg-blue-600/30 transition-all duration-300 group-hover:scale-110">
      <Icon
        name={icon}
        className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-300"
      />
    </div>
    <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors duration-300">
      {title}
    </h3>
    <p className="text-gray-300 leading-relaxed mb-6">{description}</p>
    <ul className="space-y-2">
      {points.map((point) => (
        <li
          key={point}
          className="flex items-center text-gray-300 transform hover:translate-x-2 transition-transform duration-200"
        >
          <Icon
            name="Check"
            className="w-4 h-4 text-green-400 mr-2 flex-shrink-0"
          />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const FeatureCard = React.memo(FeatureCardComponent);
