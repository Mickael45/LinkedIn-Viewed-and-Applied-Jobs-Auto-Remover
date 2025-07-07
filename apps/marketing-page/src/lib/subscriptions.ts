import { pollForCancelledSubscription } from "./poll";

const BACKEND_API_URL = import.meta.env.VITE_API_URL;

export const subscribe = async (token: string) => {
  try {
    const response = await fetch(
      `${BACKEND_API_URL}/stripe/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId: "price_1RfgOWD7sdskX7mhigNmvh3L" }),
      }
    );
    if (!response.ok)
      throw new Error((await response.json()).error || "Checkout failed.");
    return response;
  } catch (error: any) {
    console.error(error.message);
  }
};

export const unsubscribe = async (token: string, subscriptionId: string) => {
  try {
    const response = await fetch(
      `${BACKEND_API_URL}/stripe/cancel-subscription`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      }
    );
    if (!response.ok)
      throw new Error((await response.json()).error || "Cancellation failed.");

    const finalStatus = await pollForCancelledSubscription(token);
    console.log("Cancellation confirmed!", finalStatus);
  } catch (error: any) {
    console.error(error.message);
  }
};
