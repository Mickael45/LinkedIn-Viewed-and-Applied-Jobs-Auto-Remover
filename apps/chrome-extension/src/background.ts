import {
  CACHE_PRUNE_ALARM_NAME,
  LINKEDIN_JOBS_URL_PREFIX,
  PRUNE_PERIOD_MINUTES,
} from "./config";
import { extractJobSummary } from "./core/extraction";
import { CommandType, LlmTaskType } from "./shared/comms";
import { dismissedJobsManager } from "./storage/DismissedJobManager";
import { lruCache } from "./storage/LruCache";

const BACKEND_API_URL = import.meta.env.VITE_API_URL;

async function getAuthStatus() {
  const { token, user } = await chrome.storage.local.get(["token", "user"]);
  console.log("Retrieved token and user from local storage:", {
    token,
    user,
  });

  if (!token || !user) {
    return { isLoggedIn: false };
  }
  console.log("Token and user are available, checking subscription status...");
  console.log(`${BACKEND_API_URL}/subscription-status`);
  console.log("Authorization header:", `Bearer ${token}`);
  try {
    const response = await fetch(`${BACKEND_API_URL}/subscription-status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.error(
        "Failed to fetch subscription status:",
        response.statusText
      );
      return { isLoggedIn: false };
    }
    const data = await response.json();
    console.log("Subscription status response:", data);
    return {
      isLoggedIn: true,
      subscribed: data.status === "active",
      subscriptionEndDate: data.cancelAtPeriodEnd
        ? new Date(data.currentPeriodEnd * 1000).toLocaleDateString()
        : null,
    };
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return { isLoggedIn: false };
  }
}

// Listen for the token from the marketing page
chrome.runtime.onMessageExternal.addListener(
  async (request, _, sendResponse) => {
    console.log("Incomming ! ", request.type);
    if (request.type === "SET_CLERK_TOKEN") {
      await chrome.storage.local.set({
        token: request.token,
        user: request.user,
      });
      console.log("Token and user data saved to local storage.");
      const response = await getAuthStatus();
      sendResponse({
        success: true,
      });
      chrome.runtime.sendMessage({
        type: "ON_LOGIN_SUCCESS",
        ...response,
      });
      return true;
    }
    if (request.type === "GET_AUTH_STATUS") {
      const response = await getAuthStatus().then(sendResponse);

      chrome.runtime.sendMessage({
        type: "GET_AUTH_STATUS_RESPONSE",
        ...response,
      });
      return true;
    }

    if (request.type === "LOGOUT") {
      console.log("Logging out user.");
      chrome.storage.local.remove(["token", "user"], () => {
        sendResponse({ success: true });
      });
      chrome.runtime.sendMessage({
        type: "LOGOUT_SUCCESS",
        isLoggedIn: false,
      });
      return true;
    }
  }
);

const tabState = new Map<number, { currentJobId: string | null }>();

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(CACHE_PRUNE_ALARM_NAME, {
    periodInMinutes: PRUNE_PERIOD_MINUTES,
  });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === CACHE_PRUNE_ALARM_NAME) {
    try {
      await lruCache.prune();
      await dismissedJobsManager.prune();
    } catch (error) {
      console.error("Failed to prune caches:", error);
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "updateStyle") {
    // applyStyle(request.style);
    console.log("Received updateStyle message:", request.style);
    chrome.runtime.sendMessage({
      type: "ON_UPDATE_STYLE",
    });
    return true; // async response
  }
  if (request.type === "GET_AUTH_STATUS") {
    getAuthStatus().then(sendResponse);
    return true; // async response
  }

  if (request.type === "LOGOUT") {
    chrome.storage.local.remove(["token", "user"], () => {
      sendResponse({ success: true });
    });
    return true;
  }

  const tabId = sender.tab?.id;
  if (request.type === LlmTaskType.EXTRACT_JOB_SUMMARY) {
    const jobId = tabId ? tabState.get(tabId)?.currentJobId : null;

    if (!jobId && !request.jobId) {
      sendResponse({
        success: false,
        error: "No active Job ID found for this tab.",
      });
      return true;
    }
    extractJobSummary(request.text, jobId || request.jobId).then(sendResponse);
    return true;
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    console.log("[Background] URL updated:", details.url);

    if (details.frameId !== 0) return;
    const currentUrl = new URL(details.url);
    const newJobId = currentUrl.searchParams.get("currentJobId");
    const tabId = details.tabId;

    const previousState = tabState.get(tabId);
    const oldJobId = previousState?.currentJobId;

    if (newJobId === oldJobId) return;

    tabState.set(tabId, { currentJobId: newJobId });
    console.log(
      `[Background] Job ID updated for tab ${tabId}: ${oldJobId} -> ${newJobId}`
    );
    chrome.tabs.sendMessage(tabId, {
      type: CommandType.URL_UPDATED,
      jobId: newJobId,
    });
    console.log(
      `[Background] Sent URL_UPDATED message to tab ${tabId} with jobId: ${newJobId}`
    );
  },
  { url: [{ urlPrefix: LINKEDIN_JOBS_URL_PREFIX }] }
);

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabState.has(tabId)) {
    tabState.delete(tabId);
  }
});
