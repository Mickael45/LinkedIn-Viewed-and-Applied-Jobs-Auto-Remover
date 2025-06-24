export abstract class BaseStorage<T> {
  protected abstract readonly storageKey: string;
  protected abstract readonly maxItems: number;
  protected abstract readonly itemTtlMs: number;

  protected async getMap(): Promise<Map<string, T>> {
    try {
      const result = await chrome.storage.local.get(this.storageKey);
      const storedData = result[this.storageKey];
      if (
        storedData &&
        typeof storedData === "object" &&
        !Array.isArray(storedData)
      ) {
        return new Map(Object.entries(storedData));
      }
      return new Map();
    } catch (error) {
      console.error(`[${this.constructor.name}] Error retrieving map:`, error);
      return new Map();
    }
  }

  protected async saveMap(map: Map<string, T>): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.storageKey]: Object.fromEntries(map),
      });
    } catch (error) {
      console.error(`[${this.constructor.name}] Error saving map:`, error);
    }
  }

  public async prune(): Promise<void> {
    const map = await this.getMap();
    let pruneCount = 0;
    const now = Date.now();

    for (const [key, entry] of map.entries()) {
      const timestamp = (entry as any).timestamp ?? (entry as number);
      if (now - timestamp > this.itemTtlMs) {
        map.delete(key);
        pruneCount++;
      }
    }

    if (pruneCount > 0) {
      await this.saveMap(map);
    }
  }

  protected evictOldest(map: Map<string, T>): void {
    if (map.size < this.maxItems) return;

    let oldestKey: string | undefined;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of map.entries()) {
      const timestamp = (entry as any).timestamp ?? (entry as number);
      if (timestamp < oldestTimestamp) {
        oldestTimestamp = timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      map.delete(oldestKey);
    }
  }
}
