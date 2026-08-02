import { createHash, timingSafeEqual } from "node:crypto";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const globalRateLimitStore = globalThis as typeof globalThis & {
  __oneSpRateLimitStore?: Map<string, RateLimitEntry>;
};

const rateLimitStore =
  globalRateLimitStore.__oneSpRateLimitStore ?? new Map<string, RateLimitEntry>();

globalRateLimitStore.__oneSpRateLimitStore = rateLimitStore;

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function hasValidBearerToken(
  authorizationHeader: string | null,
  expectedSecret: string | undefined,
): boolean {
  if (!expectedSecret || !authorizationHeader?.startsWith("Bearer ")) return false;

  const suppliedSecret = authorizationHeader.slice("Bearer ".length).trim();
  if (!suppliedSecret) return false;

  return timingSafeEqual(sha256(suppliedSecret), sha256(expectedSecret));
}

export function getRequestAddress(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || headers.get("x-real-ip")?.trim() || "unknown";
}

export function anonymizedRateLimitKey(scope: string, address: string): string {
  return `${scope}:${createHash("sha256").update(address).digest("hex")}`;
}

export function checkFixedWindowRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfterSeconds: 0,
  };
}
