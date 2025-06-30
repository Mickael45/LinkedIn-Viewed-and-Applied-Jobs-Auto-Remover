import React, { useState } from "react";
import { Icon } from "./Icon";
import { useUser, useAuth } from "@clerk/clerk-react";

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
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<null | string>(null);
  const tierClasses = isRecommended
    ? "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-500 relative transform md:scale-105 hover:scale-110"
    : "bg-gray-800 border border-gray-700 hover:border-gray-600";

  const buttonClasses = isRecommended
    ? "bg-blue-600 hover:bg-blue-700 group-hover:shadow-xl group-hover:shadow-blue-500/50"
    : "bg-gray-700 hover:bg-gray-600 group-hover:shadow-lg";

  const handleClick = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    if (!isSignedIn) {
      setPaymentError("You must be signed in to subscribe.");
      setIsProcessing(false);
      return;
    }

    try {
      const token = await getToken();
      console.log("Clerk token:", token);
      const response = await fetch(
        "https://linkedin-joblens-5g3fbax1c-mickael45s-projects.vercel.app/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ priceId: "price_1RfgOWD7sdskX7mhigNmvh3L" }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      const session = await response.json();

      window.location.href = session.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setPaymentError(err.message);
      setIsProcessing(false);
    }
  };

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
      {isRecommended ? (
        <a
          onClick={handleClick}
          className={`block flex items-center justify-center w-full text-center py-3 px-6 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${buttonClasses}`}
        >
          {buttonText}
        </a>
      ) : (
        <a
          href={buttonLink}
          className={`block flex items-center justify-center w-full text-center py-3 px-6 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${buttonClasses}`}
        >
          {buttonText}
        </a>
      )}
      {paymentError && <p className="text-red-500 mt-2">{paymentError}</p>}
    </div>
  );
};

export const PricingTier = React.memo(PricingTierComponent);
