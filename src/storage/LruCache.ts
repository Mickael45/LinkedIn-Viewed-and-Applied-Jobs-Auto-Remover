import { CACHE_MAX_ITEMS, CACHE_ITEM_TTL_MS } from "../config";
import { BaseStorage } from "./BaseStorage";

type CacheEntry = {
  response: string;
  timestamp: number;
};

class LruCache extends BaseStorage<CacheEntry> {
  protected readonly storageKey = "llmCache";
  protected readonly maxItems = CACHE_MAX_ITEMS;
  protected readonly itemTtlMs = CACHE_ITEM_TTL_MS;

  public async get(key: string): Promise<string | null> {
    const map = await this.getMap();
    if (!map.has(key)) return null;

    const entry = map.get(key)!;
    if (Date.now() - entry.timestamp > this.itemTtlMs) {
      map.delete(key);
      await this.saveMap(map);
      return null;
    }

    entry.timestamp = Date.now();
    map.set(key, entry);
    await this.saveMap(map);
    return entry.response;
  }

  public async set(key: string, response: string): Promise<void> {
    const map = await this.getMap();
    this.evictOldest(map);
    map.set(key, { response, timestamp: Date.now() });
    await this.saveMap(map);
  }
}
export const lruCache = new LruCache();
