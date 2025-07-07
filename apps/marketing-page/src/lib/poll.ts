type SuccessCondition = (data: any) => boolean;

type StripeSubCache =
  | {
      subscriptionId: string;
      status:
        | "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "unpaid"
        | "paused";
      priceId: string;
      currentPeriodEnd: number;
      currentPeriodStart: number;
      cancelAtPeriodEnd: boolean;
    }
  | {
      status: "none";
    };

interface PollerOptions {
  successCondition: SuccessCondition;
  interval?: number;
  maxAttempts?: number;
}

const BACKEND_API_URL = import.meta.env.VITE_API_URL;

function createStripeStatusPoller({
  successCondition,
  interval = 2500,
  maxAttempts = 6,
}: PollerOptions) {
  return function startPolling(token: string): Promise<StripeSubCache> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      console.log("Starting polling for subscription status...");
      console.log("Token:", token);
      const intervalId = setInterval(async () => {
        try {
          attempts++;
          const response = await fetch(
            `${BACKEND_API_URL}/subscription-status`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
          }
          const data = await response.json();
          console.log("Polling response data:", data);
          if (successCondition(data)) {
            clearInterval(intervalId);
            resolve(data);
            return;
          }
        } catch (error) {
          clearInterval(intervalId);
          reject(error);
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          reject(new Error("Polling timed out."));
        }
      }, interval);
    });
  };
}

export const pollForActiveSubscription = createStripeStatusPoller({
  successCondition: (data) => {
    console.log(data);
    return data?.status === "active" && !data?.cancelAtPeriodEnd;
  },
});

export const pollForCancelledSubscription = createStripeStatusPoller({
  successCondition: (data) => data?.cancelAtPeriodEnd === true,
});
