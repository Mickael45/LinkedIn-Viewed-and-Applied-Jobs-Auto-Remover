import { DISMISSED_JOBS_MAX_ITEMS, DISMISSED_JOB_TTL_MS } from "../config";
import { BaseStorage } from "./BaseStorage";

class DismissedJobsManager extends BaseStorage<number> {
  protected readonly storageKey = "dismissedJobs";
  protected readonly maxItems = DISMISSED_JOBS_MAX_ITEMS;
  protected readonly itemTtlMs = DISMISSED_JOB_TTL_MS;

  public async getSet(): Promise<Set<string>> {
    const map = await this.getMap();
    return new Set(map.keys());
  }

  public async add(jobId: string): Promise<void> {
    const map = await this.getMap();
    this.evictOldest(map);
    map.set(jobId, Date.now());
    await this.saveMap(map);
  }

  public async remove(jobId: string): Promise<void> {
    const map = await this.getMap();
    if (map.has(jobId)) {
      map.delete(jobId);
      await this.saveMap(map);
    }
  }
}
export const dismissedJobsManager = new DismissedJobsManager();
