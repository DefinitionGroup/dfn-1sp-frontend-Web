import assert from "node:assert/strict";
import test from "node:test";

import {
  anonymizedRateLimitKey,
  checkFixedWindowRateLimit,
  getRequestAddress,
  hasValidBearerToken,
} from "../packages/utils/src/server/request-security.ts";

test("bearer tokens are required and compared exactly", () => {
  assert.equal(hasValidBearerToken("Bearer release-secret", "release-secret"), true);
  assert.equal(hasValidBearerToken("Bearer wrong", "release-secret"), false);
  assert.equal(hasValidBearerToken(null, "release-secret"), false);
  assert.equal(hasValidBearerToken("Bearer release-secret", undefined), false);
});

test("the first forwarded address is used for rate limiting", () => {
  const headers = new Headers({
    "x-forwarded-for": "203.0.113.7, 10.0.0.1",
    "x-real-ip": "198.51.100.2",
  });

  assert.equal(getRequestAddress(headers), "203.0.113.7");
  assert.notEqual(
    anonymizedRateLimitKey("contact", "203.0.113.7"),
    anonymizedRateLimitKey("contact", "203.0.113.8"),
  );
});

test("fixed-window limiting rejects requests after the configured allowance", () => {
  const key = `test:${crypto.randomUUID()}`;
  const now = 1_000;

  assert.deepEqual(checkFixedWindowRateLimit(key, 2, 10_000, now), {
    allowed: true,
    remaining: 1,
    retryAfterSeconds: 0,
  });
  assert.deepEqual(checkFixedWindowRateLimit(key, 2, 10_000, now + 1), {
    allowed: true,
    remaining: 0,
    retryAfterSeconds: 0,
  });
  assert.deepEqual(checkFixedWindowRateLimit(key, 2, 10_000, now + 2), {
    allowed: false,
    remaining: 0,
    retryAfterSeconds: 10,
  });
  assert.equal(checkFixedWindowRateLimit(key, 2, 10_000, now + 10_001).allowed, true);
});
