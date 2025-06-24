import { LlmTaskType, type BackgroundResponse } from "../shared/comms";
import type { JobSummaryData } from "../shared/schemas";
import { dismissedJobsManager } from "../storage/DismissedJobManager";
import { waitForElement } from "../utils/domUtils";
import { JobListManager } from "./jobListManager";
import { UIManager } from "./uiManager";

export class JobProcessor {
  private waitController: AbortController | null = null;
  private uiManager: UIManager | null = null;
  private jobListManager: JobListManager | null = null;

  private readonly SELECTORS = {
    jobList: "[data-results-list-top-scroll-sentinel] + ul",
    jobListItem: "[data-occludable-job-id]",
    jobDetailPanel: ".jobs-search__details-section-outer, .jobs-details",
    jobDescriptionContainer: ".jobs-description__container",
    dismissButton: "button[aria-label^='Dismiss']",
    undoButton: 'button[aria-label$="undo"]',
    panelContainerAnchor: `.job-details-fit-level-preferences, .jobs-description-content__toggle-button, .jobs-description-content__footer`,
    summaryContainerId: "summary-container",
  };

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    this.waitController = new AbortController();
    try {
      const jobList = await waitForElement(this.SELECTORS.jobList, {
        signal: this.waitController.signal,
      });
      this.waitController = null;

      this.uiManager = new UIManager(this.SELECTORS);
      this.jobListManager = new JobListManager(
        jobList,
        {
          onDismiss: this.handleJobDismiss,
          onUndo: this.handleJobDismissUndo,
        },
        this.SELECTORS
      );

      await this.jobListManager.start();
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Failed while checking job list:", error);
      }
      this.disconnect();
    }
  }

  public disconnect(): void {
    this.waitController?.abort();
    this.jobListManager?.disconnect();
    this.uiManager?.clearAll();
  }

  public async runExtraction(jobId: string | null): Promise<void> {
    if (!this.uiManager) return;
    this.uiManager.clearAll();

    if (!jobId) return;

    this.uiManager.renderLoadingState();
    const jobDescriptionElement = document.querySelector<HTMLElement>(
      this.SELECTORS.jobDescriptionContainer
    );
    const jobDescription = jobDescriptionElement?.innerText || "";

    if (!jobDescription.trim()) {
      this.uiManager.displayError(
        "Job description is empty or could not be read."
      );
      return;
    }

    try {
      const response: BackgroundResponse<JobSummaryData> =
        await chrome.runtime.sendMessage({
          type: LlmTaskType.EXTRACT_JOB_SUMMARY,
          text: jobDescription,
        });
      if (response.success) {
        this.uiManager.displaySummary(response.data);
      } else {
        this.uiManager.displayError(response.error);
      }
    } catch (error) {
      console.error("Background script request failed:", error);
      this.uiManager.displayError("The background service is not responding.");
    }
  }

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
    this.jobListManager?.removeDismissedStyle(jobItem);
  };
}
