// Small in-memory limiter: fine for a single-process demo deployment.
const hits = new Map<string, number[]>();

export function rateLimited(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

export function resetRateLimit(key?: string) {
  if (key) hits.delete(key);
  else hits.clear();
}
