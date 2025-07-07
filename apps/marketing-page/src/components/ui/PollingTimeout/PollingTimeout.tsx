import { Icon } from "../../../components/ui/Icon";
import React from "react";
import "./PollingTimeout.css";

interface PollingTimeoutMessageProps {
  show: boolean;
  onManualRefresh: () => void;
}

export const PollingTimeoutMessage: React.FC<PollingTimeoutMessageProps> = ({
  show,
  onManualRefresh,
}) => {
  if (!show) {
    return null;
  }

  return (
    <div className="polling-container" role="alert">
      <Icon
        name="Hourglass"
        className="w-16 h-16 text-orange-400 mx-auto mb-6"
      />
      <div className="polling-content">
        <h3 className="polling-title">Still Processing...</h3>
        <p className="my-6 text-lg text-gray-400">
          We're still confirming your subscription status with Stripe. Please
          wait a moment or click refresh. You'll also receive a confirmation
          email shortly.
        </p>
        <button onClick={onManualRefresh} className="polling-button">
          Refresh Status
        </button>
      </div>
    </div>
  );
};
