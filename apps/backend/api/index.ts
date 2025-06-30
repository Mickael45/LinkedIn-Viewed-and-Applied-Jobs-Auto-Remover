import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { kv } from "@vercel/kv";
import Stripe from "stripe";

console.log("Initializing backend API...");

const app = express();

const requiredEnvVars = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "CLERK_WEBHOOK_SECRET",
  "GEMINI_API_KEY",
  "KV_REST_API_URL",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type STRIPE_SUB_CACHE =
  | {
      subscriptionId: string;
      status: Stripe.Subscription.Status;
      priceId: string;
      currentPeriodStart: number;
      currentPeriodEnd: number;
      cancelAtPeriodEnd: boolean;
      paymentMethod: {
        brand: string | null;
        last4: string | null;
      } | null;
    }
  | {
      status: "none";
    };

const allowedEvents: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.upcoming",
  "invoice.marked_uncollectible",
  "invoice.payment_succeeded",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
];

async function syncStripeDataToKV(
  customerId: string
): Promise<STRIPE_SUB_CACHE> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: "all",
      expand: ["data.default_payment_method"],
    });

    if (subscriptions.data.length === 0) {
      const subData: STRIPE_SUB_CACHE = { status: "none" };
      await kv.set(`stripe:customer:${customerId}`, subData);
      return subData;
    }

    const subscription = subscriptions.data[0];

    if (!subscription?.items?.data?.length) {
      const subData: STRIPE_SUB_CACHE = { status: "none" };
      await kv.set(`stripe:customer:${customerId}`, subData);
      return subData;
    }

    const item = subscription.items.data[0];

    const subData: STRIPE_SUB_CACHE = {
      subscriptionId: subscription.id,
      status: subscription.status,
      priceId: item?.price.id ?? "",
      currentPeriodEnd: item?.current_period_end ?? 0,
      currentPeriodStart: item?.current_period_start ?? 0,
      cancelAtPeriodEnd: subscription?.cancel_at_period_end,
      paymentMethod:
        subscription.default_payment_method &&
        typeof subscription.default_payment_method !== "string"
          ? {
              brand: subscription.default_payment_method.card?.brand ?? null,
              last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : null,
    };

    await kv.set(`stripe:customer:${customerId}`, subData);
    return subData;
  } catch (error) {
    console.error("[SYNC STRIPE] Error syncing data:", error);
    throw error;
  }
}

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://<YOUR_CHROME_EXTENSION_URL>", "http://localhost:5173"]
        : [
            "http://localhost:5173",
            "http://localhost:3000",
            "chrome-extension://*",
          ],
    credentials: true,
  })
);

app.use(clerkMiddleware());

app.use("/api/webhooks", express.raw({ type: "application/json" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  console.log("[HEALTH] /api/health endpoint was hit successfully.");
  res.json({ status: "operational", timestamp: new Date().toISOString() });
});

// app.post("/api/webhooks/clerk", async (req, res) => {
//   try {
//     const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

//     const payload = webhook.verify(req.body, {
//       "svix-id": req.headers["svix-id"] as string,
//       "svix-timestamp": req.headers["svix-timestamp"] as string,
//       "svix-signature": req.headers["svix-signature"] as string,
//     });

//     const { type, data } = payload as any;

//     if (type === "user.created") {
//       const { id: userId, primary_email_address } = data;

//       if (!primary_email_address?.email_address) {
//         console.error(
//           "[CLERK WEBHOOK] No email address found for user:",
//           userId
//         );
//         res.status(400).json({ error: "Email address required" });
//         return;
//       }

//       const stripeCustomer = await stripe.customers.create({
//         email: primary_email_address.email_address,
//         metadata: {
//           clerkUserId: userId,
//         },
//       });

//       await kv.set(`stripe:user:${userId}`, stripeCustomer.id);

//       console.log(
//         `[CLERK WEBHOOK] Created Stripe customer ${stripeCustomer.id} for user ${userId}`
//       );
//     }

//     res.json({ received: true });
//   } catch (error) {
//     console.error("[CLERK WEBHOOK] Error processing webhook:", error);
//     res.status(400).json({ error: "Webhook signature verification failed" });
//   }
// });

// app.post(
//   "/api/stripe/create-checkout-session",
//   requireAuth(),
//   async (req, res) => {
//     try {
//       const { priceId } = req.body;
//       const { userId } = getAuth(req);
//       console.log("[STRIPE CHECKOUT] Creating session for user:", userId);
//       console.log("[STRIPE CHECKOUT] Price ID:", priceId);
//       if (!userId) {
//         res.status(401).json({ error: "Unauthorized" });
//         return;
//       }

//       if (!priceId) {
//         res.status(400).json({ error: "Price ID is required" });
//         return;
//       }

//       let stripeCustomerId = await kv.get(`stripe:user:${userId}`);

//       if (!stripeCustomerId) {
//         const user = await clerkClient.users.getUser(userId);
//         const email = user.primaryEmailAddress?.emailAddress;

//         if (!email) {
//           res.status(400).json({ error: "User email not found" });
//           return;
//         }

//         const newCustomer = await stripe.customers.create({
//           email,
//           metadata: {
//             clerkUserId: userId,
//           },
//         });

//         await kv.set(`stripe:user:${userId}`, newCustomer.id);
//         stripeCustomerId = newCustomer.id;
//       }

//       const checkout = await stripe.checkout.sessions.create({
//         customer: stripeCustomerId as string,
//         payment_method_types: ["card"],
//         line_items: [
//           {
//             price: priceId,
//             quantity: 1,
//           },
//         ],
//         mode: "subscription",
//         success_url: `${req.headers.origin}/success`,
//         cancel_url: `${req.headers.origin}/pricing`,
//       });

//       res.json({ url: checkout.url });
//     } catch (error) {
//       console.error("[STRIPE CHECKOUT] Error creating session:", error);
//       res.status(500).json({ error: "Failed to create checkout session" });
//     }
//   }
// );

// app.get("/api/success", requireAuth(), async (req, res) => {
//   try {
//     const { userId } = getAuth(req);
//     const stripeCustomerId = await kv.get(`stripe:user:${userId}`);

//     if (!stripeCustomerId) {
//       res.redirect("/");
//       return;
//     }

//     if (!userId) {
//       res.status(401).json({ error: "Unauthorized" });
//       return;
//     }
//     await syncStripeDataToKV(stripeCustomerId as string);

//     res.redirect("/dashboard");
//   } catch (error) {
//     console.error("[SUCCESS] Error processing success:", error);
//     res.redirect("/");
//   }
// });

// app.post("/api/webhooks/stripe", async (req, res) => {
//   try {
//     const sig = req.headers["stripe-signature"] as string;

//     if (!sig) {
//       res.status(400).json({ error: "Missing stripe signature" });
//       return;
//     }

//     const event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );

//     console.log(`[STRIPE WEBHOOK] Processing event: ${event.type}`);

//     await processEvent(event);

//     res.json({ received: true });
//   } catch (error) {
//     console.error("[STRIPE WEBHOOK] Error processing webhook:", error);
//     res.status(400).json({ error: "Webhook processing failed" });
//   }
// });

// async function processEvent(event: Stripe.Event) {
//   if (!allowedEvents.includes(event.type)) return;

//   const { customer: customerId } = event?.data?.object as {
//     customer: string;
//   };

//   if (typeof customerId !== "string") {
//     throw new Error(
//       `[STRIPE HOOK] Customer ID isn't string.\nEvent type: ${event.type}`
//     );
//   }

//   return await syncStripeDataToKV(customerId);
// }

// app.get("/api/subscription-status", requireAuth(), async (req, res) => {
//   try {
//     const { userId } = getAuth(req);
//     const stripeCustomerId = await kv.get(`stripe:user:${userId}`);

//     if (!stripeCustomerId) {
//       res.json({ status: "none" });
//       return;
//     }

//     if (!userId) {
//       res.status(401).json({ error: "Unauthorized" });
//       return;
//     }

//     const subData = await kv.get(`stripe:customer:${stripeCustomerId}`);
//     res.json(subData || { status: "none" });
//   } catch (error) {
//     console.error("[SUBSCRIPTION STATUS] Error fetching status:", error);
//     res.status(500).json({ error: "Failed to fetch subscription status" });
//   }
// });

// app.post("/api/gemini-proxy", requireAuth(), async (req, res) => {
//   try {
//     const { userId } = getAuth(req);
//     const { prompt, model = "gemini-1.5-flash" } = req.body;

//     if (!userId) {
//       res.status(401).json({ error: "Unauthorized" });
//       return;
//     }
//     if (!prompt) {
//       res.status(400).json({ error: "Prompt is required" });
//       return;
//     }

//     const stripeCustomerId = await kv.get(`stripe:user:${userId}`);

//     if (!stripeCustomerId) {
//       res.status(403).json({ error: "Active subscription required." });
//       return;
//     }

//     const subData = (await kv.get(
//       `stripe:customer:${stripeCustomerId}`
//     )) as STRIPE_SUB_CACHE | null;

//     const isActive =
//       subData &&
//       subData.status !== "none" &&
//       (subData.status === "active" || subData.status === "trialing");

//     if (!isActive) {
//       res.status(403).json({ error: "Active subscription required." });
//       return;
//     }

//     const geminiModel = genAI.getGenerativeModel({ model });

//     res.setHeader("Content-Type", "text/plain");
//     res.setHeader("Transfer-Encoding", "chunked");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");

//     try {
//       const result = await geminiModel.generateContentStream(prompt);

//       for await (const chunk of result.stream) {
//         const chunkText = chunk.text();
//         if (chunkText) {
//           res.write(chunkText);
//         }
//       }

//       res.end();
//     } catch (geminiError) {
//       console.error("[GEMINI PROXY] Gemini API error:", geminiError);

//       if (!res.headersSent) {
//         res.status(500).json({ error: "Failed to generate response" });
//       } else {
//         res.write("\n\n[Error: Failed to complete response]");
//         res.end();
//       }
//     }
//   } catch (error) {
//     console.error("[GEMINI PROXY] Error processing request:", error);

//     if (!res.headersSent) {
//       res.status(500).json({ error: "Internal server error" });
//     }
//   }
// });

// app.use(
//   (
//     error: Error,
//     _: express.Request,
//     res: express.Response,
//     __: express.NextFunction
//   ) => {
//     console.error("[GLOBAL ERROR]", error);

//     if (!res.headersSent) {
//       res.status(500).json({
//         error: "Internal server error",
//         ...(process.env.NODE_ENV === "development" && {
//           details: error.message,
//         }),
//       });
//     }
//   }
// );

app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint not found" });
});

export default app;

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Webhooks ready at /api/webhooks/*`);
    console.log(`🔐 Protected routes secured with Clerk`);
    console.log(`🗄️ Using Vercel KV for subscription state`);
  });
}
console.log(`📡 Webhooks ready at /api/webhooks/*`);
console.log(`🔐 Protected routes secured with Clerk`);
console.log(`🗄️ Using Vercel KV for subscription state`);
