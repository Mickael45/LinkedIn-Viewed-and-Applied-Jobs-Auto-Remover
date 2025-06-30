import React, { useState } from "react";
import { Icon } from "./Icon";

type FaqItemProps = {
  question: string;
  answer: string;
  animationDelay: string;
};

const FaqItemComponent = ({
  question,
  answer,
  animationDelay,
}: FaqItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = `faq-content-${question
    .replace(/\s+/g, "-")
    .toLowerCase()}`;

  return (
    <div
      className="bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-700/50 transition-colors duration-200 group rounded-xl"
      >
        <span className="text-lg font-semibold group-hover:text-blue-400 transition-colors duration-200">
          {question}
        </span>
        <Icon
          name="ChevronDown"
          className={`w-5 h-5 transform transition-transform duration-300 group-hover:text-blue-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div
          id={contentId}
          className="p-6 text-gray-300 animate-fade-in"
          role="region"
        >
          {answer}
        </div>
      )}
    </div>
  );
};

export const FaqItem = React.memo(FaqItemComponent);
