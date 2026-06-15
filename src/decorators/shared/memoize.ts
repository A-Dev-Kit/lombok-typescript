export interface MemoizeOptions {
  /** Time-to-live in milliseconds. Omit for infinite cache. */
  ttl?: number;
}

interface CacheEntry {
  value: unknown;
  expiresAt?: number;
}

const CACHE_MISS = Symbol('memoize-cache-miss');

function buildCacheKey(args: unknown[]): string {
  return JSON.stringify(args);
}

function getFromCache(
  cache: Map<string, CacheEntry>,
  key: string,
  ttl?: number,
): unknown | typeof CACHE_MISS {
  const entry = cache.get(key);
  if (!entry) return CACHE_MISS;
  if (ttl !== undefined && entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
    cache.delete(key);
    return CACHE_MISS;
  }
  return entry.value;
}

export function memoizeMethod<T extends (...args: unknown[]) => unknown>(
  original: T,
  options: MemoizeOptions = {},
): T {
  const cache = new Map<string, CacheEntry>();
  const ttl = options.ttl;

  return function (this: unknown, ...args: unknown[]) {
    const key = buildCacheKey(args);
    const cached = getFromCache(cache, key, ttl);
    if (cached !== CACHE_MISS) {
      return cached;
    }
    const result = original.apply(this, args);
    const entry: CacheEntry = { value: result };
    if (ttl !== undefined) {
      entry.expiresAt = Date.now() + ttl;
    }
    cache.set(key, entry);
    return result;
  } as T;
}
