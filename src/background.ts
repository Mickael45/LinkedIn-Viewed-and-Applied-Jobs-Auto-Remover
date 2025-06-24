import { LruCache } from "./cache";
import { CACHE_PRUNE_ALARM_NAME } from "./config";
import { extractJobSummary } from "./extraction";
import { StorageManager } from "./storageManager";
import { LlmTaskType, type LlmTaskRequest, CommandType } from "./shared-types";

const LINKEDIN_JOBS_URL_PREFIX = "https://www.linkedin.com/jobs/search/";
const tabState = new Map<number, { lastUrl: string }>();

chrome.runtime.onInstalled.addListener(() => {
  console.log(
    "[Background] Extension installed. Setting up daily cache prune alarm."
  );
  chrome.alarms.create(CACHE_PRUNE_ALARM_NAME, {
    periodInMinutes: 1,
  });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === CACHE_PRUNE_ALARM_NAME) {
    await LruCache.prune();
    await StorageManager.prune();
  }
});

async function handleLlmTask(request: LlmTaskRequest) {
  try {
    switch (request.type) {
      case LlmTaskType.EXTRACT_JOB_SUMMARY:
        const data = await extractJobSummary(request.text);

        return {
          success: true,
          data,
        };
      default:
        const exhaustiveCheck: never = request.type;
        return {
          success: false,
          error: `Unknown task type: ${exhaustiveCheck}`,
        };
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    console.error(`[Background] Error handling LLM task:`, error);
    return { success: false, error: errorMessage };
  }
}

async function saveCurrentJobIdToStorage() {
  const currentTab = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (currentTab.length === 0) return;
  console.log("[Background] Saving current job ID to storage...");
  console.log("Current tab URL:", currentTab[0]);
  const currentUrl = new URL(currentTab[0].url || "");
  const currentParams = currentUrl.searchParams;
  const jobId = currentParams.get("currentJobId");

  if (jobId) {
    await chrome.storage.session.set({ currentJobIdStorage: jobId });
  }
}

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (Object.values(LlmTaskType).includes(request.type)) {
    handleLlmTask(request as LlmTaskRequest).then(sendResponse);
    return true;
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(
  async (details) => {
    if (details.frameId !== 0) return;

    const previousState = tabState.get(details.tabId);
    const previousUrl = previousState ? new URL(previousState.lastUrl) : null;
    const currentUrl = new URL(details.url);

    if (!previousUrl) {
      tabState.set(details.tabId, { lastUrl: details.url });
    }

    const prevParams = previousUrl?.searchParams;
    const currentParams = currentUrl?.searchParams;

    saveCurrentJobIdToStorage();

    if (prevParams?.get("start") !== currentParams.get("start")) {
      chrome.tabs.sendMessage(details.tabId, {
        type: CommandType.RESET_PROCESSOR,
        url: details.url,
      });
    }
    if (prevParams?.get("currentJobId") !== currentParams) {
      chrome.tabs.sendMessage(details.tabId, {
        type: CommandType.EXTRACT_JOB_CONTENT,
      });
    }
    tabState.set(details.tabId, { lastUrl: details.url });
  },
  { url: [{ urlPrefix: LINKEDIN_JOBS_URL_PREFIX }] }
);

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  saveCurrentJobIdToStorage().catch((error) => {
    console.error("[Background] Error saving current job ID:", error);
  });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabState.has(tabId)) {
    tabState.delete(tabId);
  }
});
