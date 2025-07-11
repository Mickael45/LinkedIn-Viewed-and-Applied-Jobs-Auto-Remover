import { JobProcessor } from "./jobProcessor";
import { UIManager } from "./uiManager";
import { JobListManager } from "./jobListManager";
import { waitForElement } from "../utils/domUtils";
import { dismissedJobsManager } from "../storage/DismissedJobManager";
import { DOM_SELECTORS } from "../shared/domSelectors";

class ContentController {
  private static instance: ContentController | null = null;
  private processor: JobProcessor | null = null;
  private uiManager: UIManager | null = null;
  private jobListManager: JobListManager | null = null;
  private currentJobId: string | null = null;

  public static main(): void {
    if (ContentController.instance) return;
    ContentController.instance = new ContentController();
    ContentController.instance.start();
  }

  public static restart(): void {
    if (!ContentController.instance) return;
    ContentController.instance.start();
  }

  private async start(): Promise<void> {
    console.log("[ContentController] Starting...");

    this.uiManager = new UIManager(this.handleRefresh.bind(this));

    try {
      const jobListElement = await waitForElement(DOM_SELECTORS.JOB_LIST, {
        timeout: 5000,
      });
      this.jobListManager = new JobListManager(jobListElement, {
        onDismiss: this.handleJobDismiss.bind(this),
        onUndo: this.handleJobDismissUndo.bind(this),
      });
      await this.jobListManager.start();

      this.processor = new JobProcessor(this.uiManager);

      this.initialize();
    } catch (error) {
      console.error(
        "[ContentController] Failed to initialize core components:",
        error
      );
    }
  }

  private async initialize(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "GET_AUTH_STATUS",
      });
      const { isLoggedIn, subscribed } = response;
      const { aiSummaryEnabled } = (await chrome.storage.sync.get([
        "aiSummaryEnabled",
      ])) || { aiSummaryEnabled: false };

      console.log("Test", isLoggedIn, subscribed, aiSummaryEnabled);
      if (isLoggedIn && !subscribed) {
        this.uiManager?.renderUnsuscribed();
        return;
      }
      if (!aiSummaryEnabled || !isLoggedIn || !subscribed) {
        this.uiManager?.hide();
        return;
      }
      const jobId = await this.findActiveJobId();

      if (!jobId || jobId === this.currentJobId) {
        return;
      }

      this.currentJobId = jobId;
      this.processor?.runExtraction(jobId);
    } catch (error) {
      console.warn("[Controller] Could not determine active Job ID.", error);
      this.currentJobId = null;
    }
  }

  private async findActiveJobId(): Promise<string | null> {
    const url = new URL(window.location.href);
    const jobIdFromUrl = url.searchParams.get("currentJobId");

    if (jobIdFromUrl) {
      return jobIdFromUrl;
    }

    return null;
  }

  private handleRefresh = (): void => {
    if (this.currentJobId) {
      this.processor?.runExtraction(this.currentJobId);
    } else {
      console.warn(
        "[ContentController] Refresh triggered but no current job ID is set."
      );
    }
  };

  private handleJobDismiss = async (
    jobId: string,
    jobItem: HTMLLIElement
  ): Promise<void> => {
    await dismissedJobsManager.add(jobId);
    this.jobListManager?.addDismissedId(jobId);
    this.jobListManager?.applyDismissedStyle(jobItem);
  };

  private handleJobDismissUndo = async (
    jobId: string,
    jobItem: HTMLLIElement
  ): Promise<void> => {
    await dismissedJobsManager.remove(jobId);
    this.jobListManager?.removeDismissedId(jobId);
    this.jobListManager?.removeStyles(jobItem);
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ContentController.main, {
    once: true,
  });
} else {
  ContentController.main();
}

chrome.storage.sync.onChanged.addListener(() => {
  console.log("[ContentController] Storage changed, reinitializing...");
  ContentController.restart();
});
