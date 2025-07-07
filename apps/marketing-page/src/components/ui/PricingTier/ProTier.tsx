import React, { useState } from "react";
import { Icon } from "../Icon";
import { useAuth, useUser } from "@clerk/clerk-react";
import { subscribe, unsubscribe } from "../../../lib/subscriptions";
import { useNavigate } from "react-router";
import CancelSubscriptionConfirmationModal from "../CancelSubscriptionConfirmationModal";

type ProTierProps = {
  animationDelay: string;
  subscription: any;
};

const features = [
  "Everything in Free, plus:",
  "AI-Powered Job Summaries",
  "Priority Support",
];

const ProTierComponent = ({ animationDelay, subscription }: ProTierProps) => {
  const { isSignedIn } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);

  const openCancellationModal = () => {
    setIsCancellationModalOpen(true);
  };

  const handleConfirmCancellation = async () => {
    setIsCancellationModalOpen(false);
    setIsProcessing(true);
    setError(null);
    const token = await getToken();

    if (!isSignedIn || !token) {
      setError("Please sign in to manage your subscription.");
      setIsProcessing(false);
      return;
    }

    return cancelProSubscription(token);
  };

  const closeCancellationModal = () => {
    setIsCancellationModalOpen(false);
  };

  if (!subscription) {
    return null;
  }

  const subscriptionCancelled = subscription?.cancelAtPeriodEnd;
  const isProPlanSubscribed = subscription?.status === "active";
  const subscribedUntil = new Date(
    subscription?.currentPeriodEnd * 1000
  ).toLocaleDateString();
  const tierClasses = isProPlanSubscribed
    ? "bg-gradient-to-br from-green-600/20 to-blue-600/20 border-2 border-green-500 relative transform md:scale-105"
    : "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-500 relative transform md:scale-105 hover:scale-110";
  const currentButtonText =
    isProPlanSubscribed && !subscriptionCancelled
      ? "Cancel Subscription"
      : "Go AI Pro";
  const buttonAction =
    isProPlanSubscribed && !subscriptionCancelled ? "cancel" : "checkout";

  // New logic for button classes
  const getButtonClasses = () => {
    if (isProcessing) {
      return "processing-button"; // New class for the loading state
    }
    if (buttonAction === "cancel") {
      return "bg-red-600 hover:bg-red-700";
    }
    return "bg-blue-600 hover:bg-blue-700";
  };

  const subscribeToPro = async (token: string) => {
    try {
      const response = await subscribe(token);

      if (!response) {
        setError("Failed to create checkout session.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Checkout failed.");
      }
      const session = await response.json();

      window.location.href = session.url;
    } catch (err: any) {
      setError(err.message);
      navigate("/subscription-error");
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelProSubscription = async (token: string) => {
    try {
      await unsubscribe(token, subscription.subscriptionId);

      navigate("/unsubscription-success");
    } catch (err: any) {
      setError(err.message);
      navigate("/unsubscription-error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = async () => {
    setIsProcessing(true);
    setError(null);
    const token = await getToken();

    if (!isSignedIn || !token) {
      setError("Please sign in to manage your subscription.");
      setIsProcessing(false);
      return;
    }

    if (buttonAction === "cancel") {
      return cancelProSubscription(token);
    }
    subscribeToPro(token);
  };
  return (
    <div
      className={`rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl animate-fade-in-up group ${tierClasses}`}
      style={{ animationDelay }}
    >
      <CancelSubscriptionConfirmationModal
        isOpen={isCancellationModalOpen}
        onClose={closeCancellationModal}
        onConfirm={handleConfirmCancellation}
        endDate={subscribedUntil!}
      />

      {isProPlanSubscribed ? (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
            CURRENT PLAN
          </span>
        </div>
      ) : (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse">
            RECOMMENDED
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors duration-300">
          AI Pro
        </h3>
        <div className="text-4xl font-bold mb-4">
          €5.99
          <span className="text-lg text-gray-400">/month</span>
        </div>
        <p className="text-gray-300">Maximum efficiency with AI power</p>
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

      <button
        onClick={
          buttonAction === "cancel" ? openCancellationModal : handleClick
        }
        disabled={subscriptionCancelled || isProcessing}
        className={`relative overflow-hidden block w-full text-center py-3 px-6 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${getButtonClasses()} disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <span className="relative z-10">
          {isProcessing ? "Processing..." : currentButtonText}
        </span>
        {isProcessing && <div className="button-loader" />}
      </button>

      {error && (
        <p className="text-red-500 mt-2 text-center text-sm">{error}</p>
      )}
      {subscribedUntil && subscriptionCancelled && (
        <p className="text-gray-400 text-sm mt-4 text-center">
          Subscribed until:{" "}
          <span className="font-semibold">{subscribedUntil}</span>
        </p>
      )}
    </div>
  );
};

export const ProTier = React.memo(ProTierComponent);
