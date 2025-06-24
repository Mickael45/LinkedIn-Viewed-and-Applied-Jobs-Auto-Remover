import { extractJobSummary } from "./extraction";
import { LlmTaskType, type LlmTaskRequest, CommandType } from "./shared-types";

const LINKEDIN_JOBS_URL_PREFIX = "https://www.linkedin.com/jobs/search/";
const tabState = new Map<number, { lastUrl: string }>();

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

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (Object.values(LlmTaskType).includes(request.type)) {
    handleLlmTask(request as LlmTaskRequest).then(sendResponse);
    return true;
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    if (details.frameId !== 0) return;

    const previousState = tabState.get(details.tabId);
    const previousUrl = previousState ? new URL(previousState.lastUrl) : null;
    const currentUrl = new URL(details.url);

    if (!previousUrl) {
      tabState.set(details.tabId, { lastUrl: details.url });
      return;
    }

    const prevParams = previousUrl.searchParams;
    const currentParams = currentUrl.searchParams;

    if (prevParams.get("start") !== currentParams.get("start")) {
      chrome.tabs.sendMessage(details.tabId, {
        type: CommandType.RESET_PROCESSOR,
        url: details.url,
      });
    }
    if (prevParams.get("currentJobId") !== currentParams.get("currentJobId")) {
      chrome.tabs.sendMessage(details.tabId, {
        type: CommandType.EXTRACT_JOB_CONTENT,
      });
    }

    tabState.set(details.tabId, { lastUrl: details.url });
  },
  { url: [{ urlPrefix: LINKEDIN_JOBS_URL_PREFIX }] }
);

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabState.has(tabId)) {
    tabState.delete(tabId);
  }
});
