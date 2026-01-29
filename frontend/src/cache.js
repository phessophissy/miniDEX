// Cache management

export class CacheManager {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value, ttl = this.ttl) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  async getOrFetch(key, fetchFn, ttl) {
    const cached = this.get(key);
    if (cached) return cached;

    const value = await fetchFn();
    this.set(key, value, ttl);
    return value;
  }

  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, item]) => ({
        key,
        expiresIn: item.expiresAt - Date.now()
      }))
    };
  }
}

export const cacheManager = new CacheManager();
