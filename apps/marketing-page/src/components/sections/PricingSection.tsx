// apps/marketing-page/src/components/sections/PricingSection.tsx
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ProTier } from "../ui/PricingTier/ProTier";
import { FreeTier } from "../ui/PricingTier/FreeTier";

const BACKEND_API_URL = import.meta.env.VITE_API_URL;

export const PricingSection = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const fetchSubscriptionStatus = async () => {
      if (!isSignedIn) {
        setSubscription({ status: "none" });
        return;
      }

      try {
        const token = await getToken();
        const response = await fetch(`${BACKEND_API_URL}/subscription-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === "none") {
            setSubscription({ status: "free" });
          } else {
            setSubscription(data);
          }
        } else {
          setSubscription({ status: "none" });
        }
      } catch (error) {
        console.error("Failed to fetch subscription status:", error);
        setSubscription({ status: "none" });
      }
    };

    fetchSubscriptionStatus();
  }, [isSignedIn, isLoaded, getToken]);

  return (
    <section id="pricing" className="py-24 bg-gray-800/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
            Choose Your <span className="text-blue-400">Power Level</span>
          </h2>
          <p className="text-xl text-gray-300 animate-fade-in-up animation-delay-200">
            Start saving time today with our flexible pricing options.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <FreeTier subscription={subscription} animationDelay="400ms" />
          <ProTier subscription={subscription} animationDelay="500ms" />
        </div>
      </div>
    </section>
  );
};
