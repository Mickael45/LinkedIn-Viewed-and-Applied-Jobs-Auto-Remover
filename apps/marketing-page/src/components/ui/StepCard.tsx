import React from "react";
import { Icon } from "./Icon";
import { IconName } from "../../data/landingPageData";

type StepCardProps = {
  icon: IconName;
  step: number;
  title: string;
  description: string;
  animationDelay: string;
};

const StepCardComponent = ({
  icon,
  step,
  title,
  description,
  animationDelay,
}: StepCardProps) => (
  <div
    className="text-center animate-fade-in-up group"
    style={{ animationDelay }}
  >
    <div className="flex items-center justify-center w-20 h-20 bg-blue-600/20 rounded-full mb-6 mx-auto group-hover:bg-blue-600/30 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
      <Icon
        name={icon}
        className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform duration-300"
      />
    </div>
    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300">
      {step}
    </div>
    <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors duration-300">
      {title}
    </h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

export const StepCard = React.memo(StepCardComponent);
