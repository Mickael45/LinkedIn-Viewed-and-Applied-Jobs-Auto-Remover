const CACHED_JOBS_KEY = "cachedJobs";
const MAX_CACHE_SIZE = 100; // Define your max cache size
const CACHE_EXPIRATION_TIME = 24 * 1000; // 24 hours in milliseconds

type CacheEntry = {
  response: string;
  timestamp: number; // Timestamp of last access/addition for LRU
};

export class LruCache {
  /**
   * Retrieves the entire cache from storage, converting the plain object to a Map.
   */
  static async getCacheMap(): Promise<Map<string, CacheEntry>> {
    try {
      const result = await chrome.storage.local.get(CACHED_JOBS_KEY);
      const storedData = result[CACHED_JOBS_KEY];

      if (
        storedData &&
        typeof storedData === "object" &&
        !Array.isArray(storedData)
      ) {
        // Convert the plain object back to a Map
        return new Map<string, CacheEntry>(Object.entries(storedData));
      }
      // If no data or invalid, return an empty Map
      return new Map<string, CacheEntry>();
    } catch (error) {
      console.error("LruCache: Error retrieving cache:", error);
      return new Map<string, CacheEntry>(); // Fail gracefully
    }
  }

  /**
   * Saves the current cache Map to storage after converting it to a plain object.
   * Private helper to centralize serialization.
   */
  private static async saveCacheMap(
    cacheMap: Map<string, CacheEntry>
  ): Promise<void> {
    try {
      await chrome.storage.local.set({
        [CACHED_JOBS_KEY]: Object.fromEntries(cacheMap),
      });
    } catch (error) {
      console.error("LruCache: Error saving cache:", error);
      // Consider more robust error handling here
    }
  }

  /**
   * Retrieves a cached entry. If found, updates its timestamp for LRU.
   * @param jobId The key for the cache entry.
   * @returns The cached response string, or null if not found or expired.
   */
  static async getCacheEntry(jobId: string): Promise<string | null> {
    console.log(`[Cache] Checking cache for: ${jobId}`);
    const cachedJobs = await this.getCacheMap();

    if (!cachedJobs.has(jobId)) {
      console.log(`[Cache] Miss: ${jobId} not found.`);
      return null;
    }

    const entry = cachedJobs.get(jobId)!; // We know it exists due to .has() check

    // Check for expiration first
    if (Date.now() - entry.timestamp > CACHE_EXPIRATION_TIME) {
      console.log(`[Cache] Expired: ${jobId}. Removing.`);
      cachedJobs.delete(jobId); // Remove expired entry
      await this.saveCacheMap(cachedJobs); // Persist removal
      return null;
    }

    // Cache hit: Update timestamp for LRU and return response
    cachedJobs.set(jobId, { ...entry, timestamp: Date.now() }); // Update timestamp
    await this.saveCacheMap(cachedJobs); // Persist updated timestamp
    console.log(`[Cache] Hit: ${jobId}. Timestamp updated.`);
    return entry.response;
  }

  /**
   * Adds or updates an entry in the cache. Implements LRU eviction if over size.
   * @param jobId The key for the cache entry.
   * @param response The data to cache.
   */
  static async addToCache(jobId: string, response: string): Promise<void> {
    console.log(`[Cache] Attempting to add/update: ${jobId}`);
    const cachedJobs = await this.getCacheMap();
    const now = Date.now();

    // If the job already exists, update its response and timestamp.
    // This makes it the "most recently used".
    if (cachedJobs.has(jobId)) {
      cachedJobs.set(jobId, { response, timestamp: now });
      console.log(`[Cache] Updated existing entry: ${jobId}`);
    } else {
      // If adding a new entry and cache is full, evict the oldest
      if (cachedJobs.size >= MAX_CACHE_SIZE) {
        let oldestKey: string | undefined;
        let oldestTimestamp = Infinity;

        // Find the actual oldest entry by its timestamp
        for (const [key, entry] of cachedJobs.entries()) {
          if (entry.timestamp < oldestTimestamp) {
            oldestTimestamp = entry.timestamp;
            oldestKey = key;
          }
        }

        if (oldestKey) {
          cachedJobs.delete(oldestKey);
          console.log(`[Cache] Evicted oldest entry: ${oldestKey}`);
        } else {
          // Fallback, should not happen if cache.size > 0
          console.warn(
            "[Cache] Cache is full but no oldest key found for eviction."
          );
        }
      }
      // Add the new entry
      cachedJobs.set(jobId, { response, timestamp: now });
      console.log(`[Cache] Added new entry: ${jobId}`);
    }

    // Always save the cache after modification
    await this.saveCacheMap(cachedJobs);
  }

  /**
   * Explicitly prunes expired entries from the cache.
   * Can be called periodically (e.g., via a daily alarm).
   */
  static async prune(): Promise<void> {
    console.log("[Cache] Running explicit cache prune...");
    const cachedJobs = await this.getCacheMap();
    let pruneCount = 0;
    const now = Date.now();

    // Create a new Map to store only non-expired items
    const newCachedJobs = new Map<string, CacheEntry>();

    for (const [key, entry] of cachedJobs.entries()) {
      if (now - entry.timestamp <= CACHE_EXPIRATION_TIME) {
        newCachedJobs.set(key, entry); // Keep non-expired
      } else {
        pruneCount++; // Count expired
      }
    }

    if (pruneCount > 0 || newCachedJobs.size !== cachedJobs.size) {
      // Save if anything changed
      await this.saveCacheMap(newCachedJobs);
    }
    console.log(`[Cache] Pruned ${pruneCount} expired entries.`);
  }

  /**
   * Clears the entire cache.
   */
  static async clearCache(): Promise<void> {
    console.log("[Cache] Clearing entire cache.");
    try {
      await chrome.storage.local.remove(CACHED_JOBS_KEY);
      console.log("[Cache] Cache cleared successfully.");
    } catch (error) {
      console.error("[Cache] Error clearing cache:", error);
    }
  }
}

// Remember to define your constants like CACHED_JOBS_KEY, MAX_CACHE_SIZE, CACHE_EXPIRATION_TIME
// If you intend to use `chrome.storage.local.set` to store individual items,
// then your design needs to fundamentally change, and this LRU cache on a single key
// would no longer be appropriate. This design assumes all cache entries live under CACHED_JOBS_KEY.
