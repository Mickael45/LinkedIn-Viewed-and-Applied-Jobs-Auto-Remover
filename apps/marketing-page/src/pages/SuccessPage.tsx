// apps/marketing-page/src/pages/UnsubscriptionPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { pollForActiveSubscription } from "../lib/poll";
import { ArcSpinner } from "../components/ui/ArcSpinner";
import { Icon } from "../components/ui/Icon";
import { PollingTimeoutMessage } from "../components/ui/PollingTimeout/PollingTimeout";

type SuccessType = "unsubscription" | "subscription";

type TextObj = {
  title: string;
  description: string;
};

interface SuccessPageProps {
  type: SuccessType;
}

const successTypeToText: Record<SuccessType, TextObj> = {
  unsubscription: {
    title: "Unsubscription Successful",
    description:
      "Your subscription has been set to cancel at the end of the current billing period. You can continue to use the premium features until then.",
  },
  subscription: {
    title: "Subscription Successful",
    description:
      "Your subscription has been successfully activated. You can now enjoy all the premium features of LinkedIn JobLens AI.",
  },
};

const SuccessPage = ({ type }: SuccessPageProps) => {
  const navigate = useNavigate();
  const [isPolling, setIsPolling] = useState(true);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  const confirmSubscription = async () => {
    setIsPolling(true);
    setShowTimeoutMessage(false);

    try {
      const finalStatus = await pollForActiveSubscription();
      console.log("Subscription confirmed!", finalStatus);
      setIsPolling(false);
      navigate("/");
    } catch (error) {
      console.error(error.message); // "Polling timed out."
      setIsPolling(false);
      setShowTimeoutMessage(true); // Show our message on timeout
    }
  };

  useEffect(() => {
    confirmSubscription();
  }, [type]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-xl max-w-lg mx-auto">
        {!isPolling ? (
          <>
            <Icon
              name="Check"
              className="w-16 h-16 text-green-400 mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold text-white mb-4">
              {successTypeToText[type].title}
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              {successTypeToText[type].description}
            </p>
            <a
              href="/"
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300"
            >
              Back to Home
            </a>
          </>
        ) : !showTimeoutMessage ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
              background: "#1F2937",
            }}
          >
            <ArcSpinner />
          </div>
        ) : (
          <PollingTimeoutMessage
            show={showTimeoutMessage}
            onManualRefresh={confirmSubscription}
          />
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
