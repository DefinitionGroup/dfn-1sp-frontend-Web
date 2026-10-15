import assert from "node:assert/strict";
import test from "node:test";
import {
  NON_PRODUCTION_FALLBACK_SECONDS,
  PRODUCTION_FALLBACK_SECONDS,
  resolveRequestTagPrefix,
  resolveRevalidateSeconds,
  toRequestTag,
} from "../packages/sanity-queries/src/cache-policy";

test("real production deployments use the long fallback", () => {
  assert.equal(resolveRevalidateSeconds({ VERCEL_ENV: "production" }), PRODUCTION_FALLBACK_SECONDS);
});

test("beta and test projects are Vercel production but use the short fallback", () => {
  for (const tier of ["beta", "test", "BETA"]) {
    assert.equal(
      resolveRevalidateSeconds({ VERCEL_ENV: "production", DEPLOYMENT_TIER: tier }),
      NON_PRODUCTION_FALLBACK_SECONDS,
    );
  }
});

test("previews and local builds use the short fallback", () => {
  assert.equal(resolveRevalidateSeconds({ VERCEL_ENV: "preview" }), NON_PRODUCTION_FALLBACK_SECONDS);
  assert.equal(resolveRevalidateSeconds({}), NON_PRODUCTION_FALLBACK_SECONDS);
});

test("SANITY_REVALIDATE_SECONDS overrides the fallback; zero or junk values are ignored", () => {
  assert.equal(resolveRevalidateSeconds({ SANITY_REVALIDATE_SECONDS: "300", VERCEL_ENV: "production" }), 300);
  assert.equal(resolveRevalidateSeconds({ SANITY_REVALIDATE_SECONDS: "false" }), false);
  for (const ignored of ["0", "-5", "soon", ""]) {
    assert.equal(
      resolveRevalidateSeconds({ SANITY_REVALIDATE_SECONDS: ignored, VERCEL_ENV: "production" }),
      PRODUCTION_FALLBACK_SECONDS,
    );
  }
});

test("request tags name the site and deployment lane", () => {
  assert.equal(
    resolveRequestTagPrefix({ NEXT_PUBLIC_CHANNEL: "msmWeb", VERCEL_ENV: "production" }),
    "msmWeb.production",
  );
  assert.equal(
    resolveRequestTagPrefix({ NEXT_PUBLIC_CHANNEL: "1spWeb", VERCEL_ENV: "production", DEPLOYMENT_TIER: "beta" }),
    "1spWeb.beta",
  );
  assert.equal(resolveRequestTagPrefix({}), "web.local");
});

test("request tags only keep characters Sanity accepts", () => {
  assert.equal(toRequestTag("page:about-us"), "page-about-us");
  assert.equal(toRequestTag("pages"), "pages");
  assert.equal(toRequestTag("::"), undefined);
  assert.equal(toRequestTag(undefined), undefined);
  assert.equal(toRequestTag("x".repeat(90))?.length, 75);
});
