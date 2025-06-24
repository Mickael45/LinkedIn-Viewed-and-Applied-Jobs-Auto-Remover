import { StorageManager } from "./storageManager";
import { waitForElement } from "./domUtils";
import { JobListManager } from "./jobListManager";
import { UIManager } from "./uiManager";
import { LlmTaskType } from "./shared-types";

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
    panelContainerAnchor: `
      .job-details-fit-level-preferences,
      .jobs-description-content__toggle-button,
      .jobs-description-content__footer
`,
    summaryContainerId: "jarvis-summary-container",
  };
  constructor() {
    this.init();
  }

  public async init(): Promise<void> {
    this.waitController = new AbortController();
    const { signal } = this.waitController;

    try {
      const jobList = await waitForElement(this.SELECTORS.jobList, { signal });
      this.waitController = null;

      this.uiManager = new UIManager({
        jobDetailPanel: this.SELECTORS.jobDetailPanel,
        panelContainerAnchor: this.SELECTORS.panelContainerAnchor,
        summaryContainerId: this.SELECTORS.summaryContainerId,
      });

      this.jobListManager = new JobListManager(
        jobList,
        {
          onDismiss: this.handleJobDismiss,
          onUndo: this.handleJobDismissUndo,
        },
        {
          jobListItem: this.SELECTORS.jobListItem,
          dismissButton: this.SELECTORS.dismissButton,
          undoButton: this.SELECTORS.undoButton,
        }
      );

      this.jobListManager.start();

      this.runExtractionOnCurrentPanel();
    } catch (error: any) {
      if (error.name === "AbortError")
        console.warn("J.A.R.V.I.S. wait sequence aborted.");
      else console.error("J.A.R.V.I.S. Mission Failure:", error);
      this.disconnect();
    }
  }

  public disconnect(): void {
    this.waitController?.abort();
    this.jobListManager?.disconnect();
    this.uiManager?.clearAll();
  }

  public async runExtractionOnCurrentPanel(): Promise<void> {
    if (!this.uiManager) return;

    this.uiManager.clearAll();
    this.uiManager.renderLoadingState();
    const jobDescriptionElement = document.querySelector(
      this.SELECTORS.jobDescriptionContainer
    );
    const jobDescription = jobDescriptionElement?.textContent || "";

    if (!jobDescription.trim()) return;

    try {
      const summaryData = await chrome.runtime.sendMessage({
        type: LlmTaskType.EXTRACT_JOB_SUMMARY,
        text: jobDescription,
      });
      console.log("Received summary data:", summaryData);
      if (summaryData?.success) this.uiManager.displaySummary(summaryData.data);
    } catch (error) {
      console.error("A background script request failed:", error);
    }
  }

  private handleJobDismiss = async (
    jobId: string,
    jobItem: HTMLLIElement
  ): Promise<void> => {
    const dismissedJobs = await StorageManager.getDismissedJobs();

    console.log("Before handleJobDismiss");
    if (dismissedJobs.has(jobId)) return;
    console.log("After handleJobDismiss");
    await StorageManager.addDismissedJob(jobId);
    this.jobListManager?.applyDismissedStyle(jobItem);
    StorageManager.addDismissedJob(jobId);
  };

  private handleJobDismissUndo = async (
    jobId: string,
    jobItem: HTMLLIElement
  ): Promise<void> => {
    const dismissedJobs = await StorageManager.getDismissedJobs();
    console.log("Before handleJobDismissUndo");
    if (!dismissedJobs.has(jobId)) return;
    console.log("After handleJobDismissUndo");
    await StorageManager.removeDismissedJob(jobId);
    this.jobListManager?.removeDismissedStyle(jobItem);
    StorageManager.removeDismissedJob(jobId);
  };
}
