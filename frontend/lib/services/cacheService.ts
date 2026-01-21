import NodeCache from 'node-cache';

/**
 * Service to handle server-side caching
 * Cache TTL: 5 minutes (300 seconds)
 */
class CacheService {
  private cache: NodeCache;
  private readonly CACHE_TTL = 300; // 5 minutes in seconds
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: this.CACHE_TTL,
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false, // Return references for better performance
    });

    console.log('Cache service initialized with 5-minute TTL');
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    
    if (value !== undefined) {
      this.cacheHits++;
      console.log(`Cache HIT for key: ${key}`);
    } else {
      this.cacheMisses++;
      console.log(`Cache MISS for key: ${key}`);
    }
    
    return value;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T): boolean {
    const success = this.cache.set(key, value);
    if (success) {
      console.log(`Cached data for key: ${key}`);
    }
    return success;
  }

  /**
   * Get TTL remaining for a key (in seconds)
   */
  getTtl(key: string): number {
    const ttl = this.cache.getTtl(key);
    if (!ttl) return 0;
    
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((ttl - now) / 1000));
    return remaining;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.flushAll();
    console.log('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: this.cacheHits + this.cacheMisses > 0 
        ? (this.cacheHits / (this.cacheHits + this.cacheMisses) * 100).toFixed(2) + '%'
        : '0%',
      keys: this.cache.keys(),
      keyCount: this.cache.keys().length,
    };
  }
}

// Export singleton instance
export default new CacheService();
