import {
  CACHE_PRUNE_ALARM_NAME,
  PRUNE_PERIOD_MINUTES,
  LINKEDIN_JOBS_URL_PREFIX,
} from "./config";
import { extractJobSummary } from "./core/extraction";
import { LlmTaskType, CommandType } from "./shared/comms";
import { dismissedJobsManager } from "./storage/DismissedJobManager";
import { lruCache } from "./storage/LruCache";

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
  const tabId = sender.tab?.id;

  if (request.type === LlmTaskType.EXTRACT_JOB_SUMMARY) {
    const jobId = tabId ? tabState.get(tabId)?.currentJobId : null;
    if (!jobId) {
      sendResponse({
        success: false,
        error: "No active Job ID found for this tab.",
      });
      return true;
    }
    extractJobSummary(request.text, jobId).then(sendResponse);
    return true;
  }

  if (request.type === CommandType.GET_CURRENT_JOB_ID) {
    const jobId = (tabId && tabState.get(tabId)?.currentJobId) || null;

    sendResponse({ jobId });

    return;
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    if (details.frameId !== 0) return;

    const currentUrl = new URL(details.url);
    const newJobId = currentUrl.searchParams.get("currentJobId");
    const tabId = details.tabId;

    const previousState = tabState.get(tabId);
    const oldJobId = previousState?.currentJobId;

    if (newJobId === oldJobId) return;

    tabState.set(tabId, { currentJobId: newJobId });

    chrome.tabs.sendMessage(tabId, {
      type: CommandType.URL_UPDATED,
      jobId: newJobId,
    });
  },
  { url: [{ urlPrefix: LINKEDIN_JOBS_URL_PREFIX }] }
);

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabState.has(tabId)) {
    tabState.delete(tabId);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url?.startsWith(LINKEDIN_JOBS_URL_PREFIX)
  ) {
    const currentUrl = new URL(tab.url);
    const newJobId = currentUrl.searchParams.get("currentJobId");

    tabState.set(tabId, { currentJobId: newJobId });
  }
});
