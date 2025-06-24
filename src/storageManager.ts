// Assuming these are in a constants.ts or similar file
const DISMISSED_JOBS_KEY = "dismissedJobs";
const MAX_DISMISSED_JOBS_SIZE = 50; // Example: Set a reasonable max size
const DISMISSED_JOB_EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export class StorageManager {
  /**
   * Retrieves dismissed jobs from local storage.
   * IMPORTANT: Converts the stored plain object back into a Map.
   */
  static async getDismissedJobs(): Promise<Map<string, number>> {
    try {
      const result = await chrome.storage.local.get(DISMISSED_JOBS_KEY);
      const storedData = result[DISMISSED_JOBS_KEY];

      if (
        storedData &&
        typeof storedData === "object" &&
        !Array.isArray(storedData)
      ) {
        // Data exists and is an object, convert it to a Map
        return new Map<string, number>(Object.entries(storedData));
      }
      // If no data or not an object (e.g., first run or corrupt data), return an empty Map
      return new Map<string, number>();
    } catch (error) {
      console.error("StorageManager: Error retrieving dismissed jobs:", error);
      // In case of any read error, return an empty Map to prevent crashes
      return new Map<string, number>();
    }
  }

  /**
   * Adds a job ID to the dismissed jobs list, managing eviction and updating timestamps.
   */
  static async addDismissedJob(jobId: string): Promise<void> {
    const dismissedJobs = await this.getDismissedJobs();
    // console.log("Before addDismissedJob", dismissedJobs); // Good for debugging, but remove in prod

    // If job already exists, update its timestamp to make it "recent" (LRU-like behavior)
    if (dismissedJobs.has(jobId)) {
      dismissedJobs.set(jobId, Date.now());
    } else {
      // If we've hit our max size, evict the oldest entry
      if (dismissedJobs.size >= MAX_DISMISSED_JOBS_SIZE) {
        let oldestKey: string | undefined;
        let oldestTimestamp = Infinity;

        // Iterate to find the actual oldest entry by timestamp
        for (const [key, timestamp] of dismissedJobs.entries()) {
          if (timestamp < oldestTimestamp) {
            oldestTimestamp = timestamp;
            oldestKey = key;
          }
        }

        if (oldestKey) {
          dismissedJobs.delete(oldestKey);
          // console.log(`StorageManager: Evicted oldest job: ${oldestKey}`);
        } else {
          // This case should ideally not happen if size > 0, but good for robustness
          console.warn(
            "StorageManager: Dismissed jobs map is not empty but no oldest key found for eviction."
          );
        }
      }
      // Add the new job with the current timestamp
      dismissedJobs.set(jobId, Date.now());
    }

    // console.log("After addDismissedJob", dismissedJobs); // Good for debugging, but remove in prod
    await this.saveDismissedJobs(dismissedJobs);
  }

  /**
   * Removes a job ID from the dismissed jobs list.
   */
  static async removeDismissedJob(jobId: string): Promise<void> {
    const dismissedJobs = await this.getDismissedJobs();
    if (!dismissedJobs.has(jobId)) {
      return; // Job not found, nothing to do
    }

    dismissedJobs.delete(jobId);
    await this.saveDismissedJobs(dismissedJobs);
  }

  /**
   * Prunes expired dismissed job entries from the list.
   */
  static async prune(): Promise<void> {
    console.log("[StorageManager] Running cache prune...");
    const dismissedJobs = await this.getDismissedJobs();
    let pruneCount = 0;
    const now = Date.now();

    // Create a new Map to store non-expired items
    const newDismissedJobs = new Map<string, number>();

    for (const [key, timestamp] of dismissedJobs.entries()) {
      if (now - timestamp <= DISMISSED_JOB_EXPIRATION_TIME) {
        newDismissedJobs.set(key, timestamp); // Keep non-expired
      } else {
        pruneCount++; // Count expired
      }
    }

    if (pruneCount > 0) {
      await this.saveDismissedJobs(newDismissedJobs);
    }
    console.log(`[StorageManager] Pruned ${pruneCount} expired entries.`);
  }

  /**
   * Helper method to save the Map to chrome.storage.local after converting to a plain object.
   * This centralizes the serialization logic.
   */
  private static async saveDismissedJobs(
    dismissedJobs: Map<string, number>
  ): Promise<void> {
    try {
      await chrome.storage.local.set({
        [DISMISSED_JOBS_KEY]: Object.fromEntries(dismissedJobs),
      });
    } catch (error) {
      console.error("StorageManager: Error saving dismissed jobs:", error);
      // Consider adding more robust error handling, e.g., notifying the user or retrying
    }
  }
}
