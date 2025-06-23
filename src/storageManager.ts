const DISMISSED_JOBS_KEY = "dismissedJobIds";

export class StorageManager {
  static async getDismissedJobs(): Promise<Set<string>> {
    const result = await chrome.storage.local.get(DISMISSED_JOBS_KEY);

    return new Set(result[DISMISSED_JOBS_KEY] || []);
  }

  static async addDismissedJob(jobId: string): Promise<void> {
    const dismissedJobsSet = await this.getDismissedJobs();
    if (dismissedJobsSet.has(jobId)) {
      return;
    }

    dismissedJobsSet.add(jobId);

    await chrome.storage.local.set({
      [DISMISSED_JOBS_KEY]: Array.from(dismissedJobsSet),
    });
  }

  static async removeDismissedJob(jobId: string): Promise<void> {
    const dismissedJobsSet = await this.getDismissedJobs();
    if (!dismissedJobsSet.has(jobId)) {
      return;
    }

    dismissedJobsSet.delete(jobId);

    await chrome.storage.local.set({
      [DISMISSED_JOBS_KEY]: Array.from(dismissedJobsSet),
    });
  }
}
