import { StorageManager } from "./storageManager";

interface JobListManagerCallbacks {
  onDismiss: (jobId: string, jobItem: HTMLLIElement) => void;
  onUndo: (jobId: string, jobItem: HTMLLIElement) => void;
}

interface JobListManagerSelectors {
  jobListItem: string;
  dismissButton: string;
  undoButton: string;
}

export class JobListManager {
  private domObserver: MutationObserver | null = null;
  private clickListenerController: AbortController | null = null;
  private readonly container: HTMLElement;
  private readonly callbacks: JobListManagerCallbacks;
  private readonly SELECTORS: JobListManagerSelectors;

  constructor(
    container: HTMLElement,
    callbacks: JobListManagerCallbacks,
    SELECTORS: JobListManagerSelectors
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.SELECTORS = SELECTORS;
  }

  public start(): void {
    this.container
      .querySelectorAll<HTMLLIElement>(this.SELECTORS.jobListItem)
      .forEach((job) => this.scanAndStyleJob(job));

    this.domObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (
            node instanceof HTMLLIElement &&
            node.matches(this.SELECTORS.jobListItem)
          ) {
            this.scanAndStyleJob(node);
          }
        });
      }
    });
    this.domObserver.observe(this.container, { childList: true });

    this.clickListenerController = new AbortController();
    this.container.addEventListener("click", this.handleClick, {
      signal: this.clickListenerController.signal,
      capture: true,
    });
  }

  public disconnect(): void {
    this.domObserver?.disconnect();
    this.clickListenerController?.abort();
  }

  private applyAppliedStyle = (jobItem: HTMLLIElement): void => {
    jobItem.style.backgroundColor = "rgba(0, 120, 0, 0.2)";
    jobItem.style.border = "1px solid rgba(0, 255, 0, 0.3)";
  };

  public applyDismissedStyle = (jobItem: HTMLLIElement): void => {
    jobItem.style.backgroundColor = "rgba(120, 0, 0, 0.2)";
    jobItem.style.border = "1px solid rgba(255, 0, 0, 0.3)";
  };

  public removeDismissedStyle = (jobItem: HTMLLIElement): void => {
    jobItem.style.backgroundColor = "";
    jobItem.style.border = "";
  };

  private scanAndStyleJob = async (jobItem: HTMLLIElement): Promise<void> => {
    const jobId = jobItem.dataset.occludableJobId;
    if (!jobId) {
      console.warn("Job item missing occludableJobId:", jobItem);
      return;
    }

    const dismissedJobs = await StorageManager.getDismissedJobs();

    if (jobItem.innerHTML.toLowerCase().includes("applied")) {
      this.applyAppliedStyle(jobItem);
    }
    console.log("Before check dismissed jobs");
    if (dismissedJobs.has(jobId)) {
      this.applyDismissedStyle(jobItem);
    }
    console.log("After check dismissed jobs");
  };

  private handleClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const dismissButton = target.closest<HTMLButtonElement>(
      this.SELECTORS.dismissButton
    );
    const undoButton = target.closest<HTMLButtonElement>(
      this.SELECTORS.undoButton
    );

    if (!dismissButton && !undoButton) return;

    const jobItem = target.closest<HTMLLIElement>(this.SELECTORS.jobListItem);
    if (!jobItem) return;

    const jobId = jobItem.dataset.occludableJobId;
    if (!jobId) return;

    if (dismissButton) this.callbacks.onDismiss(jobId, jobItem);
    else if (undoButton) this.callbacks.onUndo(jobId, jobItem);
  };
}
