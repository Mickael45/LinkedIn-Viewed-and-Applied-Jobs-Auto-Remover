import { dismissedJobsManager } from "../storage/DismissedJobManager";

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
  private dismissedJobIds = new Set<string>();
  private container: HTMLElement;
  private callbacks: JobListManagerCallbacks;
  private SELECTORS: JobListManagerSelectors;

  constructor(
    container: HTMLElement,
    callbacks: JobListManagerCallbacks,
    selectors: JobListManagerSelectors
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.SELECTORS = selectors;
  }

  public async start(): Promise<void> {
    try {
      this.dismissedJobIds = await dismissedJobsManager.getSet();
    } catch (error) {
      console.error("Failed to load dismissed job IDs:", error);
      this.dismissedJobIds = new Set<string>();
    }
    this.container
      .querySelectorAll<HTMLLIElement>(this.SELECTORS.jobListItem)
      .forEach((job) => this.styleJobItem(job));

    this.domObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (
            node instanceof HTMLLIElement &&
            node.matches(this.SELECTORS.jobListItem)
          ) {
            this.styleJobItem(node);
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

  public addDismissedId(jobId: string): void {
    this.dismissedJobIds.add(jobId);
  }

  public removeDismissedId(jobId: string): void {
    this.dismissedJobIds.delete(jobId);
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

  private styleJobItem = (jobItem: HTMLLIElement): void => {
    const jobId = jobItem.dataset.occludableJobId;
    if (!jobId) return;

    if (this.dismissedJobIds.has(jobId)) {
      this.applyDismissedStyle(jobItem);
    } else {
      if (jobItem.innerText.toLowerCase().includes("applied")) {
        this.applyAppliedStyle(jobItem);
      } else {
        this.removeDismissedStyle(jobItem);
      }
    }
  };

  private handleClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const dismissButton = target.closest<HTMLButtonElement>(
      this.SELECTORS.dismissButton
    );
    const undoButton = target.closest<HTMLButtonElement>(
      this.SELECTORS.undoButton
    );

    const jobItem = target.closest<HTMLLIElement>(this.SELECTORS.jobListItem);
    if (!jobItem) return;

    const jobId = jobItem.dataset.occludableJobId;
    if (!jobId) return;

    if (dismissButton) {
      this.callbacks.onDismiss(jobId, jobItem);
    } else if (undoButton) {
      this.callbacks.onUndo(jobId, jobItem);
    }
  };
}
