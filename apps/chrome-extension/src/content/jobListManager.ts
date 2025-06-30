import { DOM_SELECTORS } from "../shared/domSelectors";
import { dismissedJobsManager } from "../storage/DismissedJobManager";

interface JobListManagerCallbacks {
  onDismiss: (jobId: string, jobItem: HTMLLIElement) => void;
  onUndo: (jobId: string, jobItem: HTMLLIElement) => void;
}

export class JobListManager {
  private domObserver: MutationObserver | null = null;
  private clickListenerController: AbortController | null = null;
  private dismissedJobIds = new Set<string>();
  private container: HTMLElement;
  private callbacks: JobListManagerCallbacks;

  constructor(container: HTMLElement, callbacks: JobListManagerCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  public async start(): Promise<void> {
    try {
      this.dismissedJobIds = await dismissedJobsManager.getSet();
    } catch (error) {
      console.error("Failed to load dismissed job IDs:", error);
      this.dismissedJobIds = new Set<string>();
    }
    this.container
      .querySelectorAll<HTMLLIElement>(DOM_SELECTORS.JOB_LIST_ITEM)
      .forEach((job) => this.styleJobItem(job));

    this.domObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          const jobItem = node.matches(DOM_SELECTORS.JOB_LIST_ITEM)
            ? (node as HTMLLIElement)
            : node.closest<HTMLLIElement>(DOM_SELECTORS.JOB_LIST_ITEM);

          if (jobItem) {
            this.styleJobItem(jobItem);
          }
        });
      }
    });
    this.domObserver.observe(this.container, {
      childList: true,
      subtree: true,
    });

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
    this.removeStyles(jobItem);
    jobItem.style.backgroundColor = "rgba(40, 167, 69, 0.12)";
  };

  public applyDismissedStyle = (jobItem: HTMLLIElement): void => {
    this.removeStyles(jobItem);
    jobItem.style.filter = "blur(1px) grayscale(60%)";
    jobItem.style.opacity = "0.5";
    jobItem.style.transform = "scale(0.98)";
  };

  public applyViewedStyle = (jobItem: HTMLLIElement): void => {
    if (!jobItem.style.filter && jobItem.style.backgroundColor === "") {
      jobItem.style.backgroundColor = "rgba(243, 238, 230, 1)";
    }
  };

  public removeStyles = (jobItem: HTMLLIElement): void => {
    jobItem.style.backgroundColor = "";
    jobItem.style.filter = "";
    jobItem.style.opacity = "1";
    jobItem.style.transform = "";
  };
  private styleJobItem = (jobItem: HTMLLIElement): void => {
    const jobId = jobItem.dataset.occludableJobId;
    if (!jobId) return;

    if (this.dismissedJobIds.has(jobId)) {
      this.applyDismissedStyle(jobItem);
      return;
    }

    const isApplied = jobItem.innerText.toLowerCase().includes("applied");
    const isViewed = jobItem.innerText.toLowerCase().includes("viewed");

    if (isApplied) {
      this.applyAppliedStyle(jobItem);
    } else if (isViewed) {
      this.applyViewedStyle(jobItem);
    } else {
      this.removeStyles(jobItem);
    }
  };

  private handleClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const dismissButton = target.closest<HTMLButtonElement>(
      DOM_SELECTORS.DISMISS_BUTTON
    );
    const undoButton = target.closest<HTMLButtonElement>(
      DOM_SELECTORS.UNDO_BUTTON
    );

    const jobItem = target.closest<HTMLLIElement>(DOM_SELECTORS.JOB_LIST_ITEM);
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
