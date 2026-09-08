type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const buckets = new Map<string, RateLimitEntry>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  const resetAt = entry.windowStart + windowMs;

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}
