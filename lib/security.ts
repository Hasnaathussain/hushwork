const requestBuckets = new Map<string, { count: number; resetAt: number }>();

export class RequestRejected extends Error {}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL;
  if (expectedOrigin && origin !== new URL(expectedOrigin).origin) {
    throw new RequestRejected("Cross-origin request");
  }

  if (!expectedOrigin && new URL(origin).host !== request.headers.get("host")) {
    throw new RequestRejected("Cross-origin request");
  }
}

// ponytail: an in-memory limiter is enough for one hosted instance; move this to a shared limiter before horizontal scaling.
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = requestBuckets.get(key);
  if (!current || current.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function requestKey(request: Request, purpose: string): string {
  return `${purpose}:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"}`;
}
