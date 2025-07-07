import React, { useState, useEffect, useCallback } from "react";
import { PollingTimeoutMessage } from "./PollingTimeout/PollingTimeout";
import { useAuth } from "@clerk/clerk-react";

type Status = "polling" | "confirmed" | "timed_out";

interface StatusScreenProps {
  task: (token: string) => Promise<any>;
  PollingView: React.ReactNode;
  SuccessView: React.ReactNode;
  onSuccess?: (result: any) => void;
}

export const StatusScreen = ({
  task,
  PollingView,
  SuccessView,
  onSuccess,
}: StatusScreenProps) => {
  const [status, setStatus] = useState<Status>("polling");
  const { getToken } = useAuth();

  const runTask = useCallback(async () => {
    setStatus("polling");
    try {
      const result = await task((await getToken()) || "");
      setStatus("confirmed");
      onSuccess?.(result);
    } catch (error) {
      console.error("Task failed after multiple attempts:", error);
      setStatus("timed_out");
    }
  }, [task, onSuccess]);

  useEffect(() => {
    runTask();
  }, [runTask]);

  const renderContent = () => {
    switch (status) {
      case "confirmed":
        return SuccessView;
      case "timed_out":
        return <PollingTimeoutMessage show={true} onManualRefresh={runTask} />;
      case "polling":
      default:
        return PollingView;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full mx-auto animate-fade-in">
        {renderContent()}
      </div>
    </div>
  );
};
