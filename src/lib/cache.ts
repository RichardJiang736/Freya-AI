const store = new Map<string, { value: unknown; expiry: number }>();
const DEFAULT_TTL = 300_000; // 5 minutes

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function cacheSet(key: string, value: unknown, ttl = DEFAULT_TTL): void {
  store.set(key, { value, expiry: Date.now() + ttl });
}

export function cacheClear(): void {
  store.clear();
}
