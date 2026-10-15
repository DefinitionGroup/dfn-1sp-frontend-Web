import assert from "node:assert/strict";
import test from "node:test";
import { parseBody } from "next-sanity/webhook";
import {
  TARGETS,
  revalidateSites,
  signatureHeader,
  type RevalidateTarget,
} from "../functions/revalidate-sites/fan-out";

const payload = { _id: "abc", _type: "page", slug: { current: "about" }, language: "en" };

const targets: RevalidateTarget[] = [
  { site: "a", url: "https://a.test/api/revalidate", dataset: "production", secretEnv: "SECRET_A" },
  { site: "b", url: "https://b.test/api/revalidate", dataset: "production", secretEnv: "SECRET_B" },
  { site: "c", url: "https://c.test/api/revalidate", dataset: "dev-dataset", secretEnv: "SECRET_C" },
];

type Sent = { url: string; init: RequestInit };

function recorder(status = 200) {
  const sent: Sent[] = [];
  const send = (async (url: string, init: RequestInit) => {
    sent.push({ url, init });
    return new Response("{}", { status });
  }) as typeof fetch;
  return { sent, send };
}

test("signed requests pass the sites' next-sanity webhook verification", async () => {
  const body = JSON.stringify(payload);
  const request = new Request("https://site.test/api/revalidate", {
    method: "POST",
    headers: { "sanity-webhook-signature": signatureHeader(body, "shared-secret") },
    body,
  });

  const result = await parseBody(request as never, "shared-secret", false);

  assert.equal(result.isValidSignature, true);
  assert.deepEqual(result.body, payload);
});

test("a signature made with another site's secret is rejected", async () => {
  const body = JSON.stringify(payload);
  const request = new Request("https://site.test/api/revalidate", {
    method: "POST",
    headers: { "sanity-webhook-signature": signatureHeader(body, "other-secret") },
    body,
  });

  const result = await parseBody(request as never, "shared-secret", false);

  assert.equal(result.isValidSignature, false);
});

test("only sites reading the changed dataset are called, each with its own secret", async () => {
  const { sent, send } = recorder();

  const deliveries = await revalidateSites({
    dataset: "production",
    payload,
    env: { SECRET_A: "secret-a", SECRET_B: "secret-b", SECRET_C: "secret-c" },
    targets,
    send,
  });

  assert.deepEqual(deliveries.map(({ site, status }) => [site, status]), [["a", "sent"], ["b", "sent"]]);
  assert.deepEqual(sent.map(({ url }) => url), ["https://a.test/api/revalidate", "https://b.test/api/revalidate"]);

  const [toA] = sent;
  const verification = await parseBody(
    new Request(toA.url, { method: "POST", headers: toA.init.headers, body: toA.init.body }) as never,
    "secret-a",
    false,
  );
  assert.equal(verification.isValidSignature, true);
});

test("sites without a configured secret are skipped, not called", async () => {
  const { sent, send } = recorder();

  const deliveries = await revalidateSites({ dataset: "production", payload, env: { SECRET_A: "secret-a" }, targets, send });

  assert.deepEqual(deliveries.map(({ site, status }) => [site, status]), [["a", "sent"], ["b", "skipped"]]);
  assert.equal(sent.length, 1);
});

test("error responses and network failures are reported as failed", async () => {
  const { send } = recorder(401);
  const rejected = await revalidateSites({ dataset: "dev-dataset", payload, env: { SECRET_C: "c" }, targets, send });
  assert.deepEqual(rejected, [{ site: "c", status: "failed", detail: "HTTP 401" }]);

  const unreachable = (async () => {
    throw new Error("connect ECONNREFUSED");
  }) as typeof fetch;
  const offline = await revalidateSites({ dataset: "dev-dataset", payload, env: { SECRET_C: "c" }, targets, send: unreachable });
  assert.deepEqual(offline, [{ site: "c", status: "failed", detail: "connect ECONNREFUSED" }]);
});

test("dry runs never call a site", async () => {
  const { sent, send } = recorder();
  const deliveries = await revalidateSites({ dataset: "production", payload, env: { SECRET_A: "a" }, targets, send, dryRun: true });
  assert.equal(sent.length, 0);
  assert.equal(deliveries[0].status, "skipped");
});

test("every live target posts to an https revalidate endpoint with its own secret", () => {
  for (const target of TARGETS) {
    assert.match(target.url, /^https:\/\/[^/]+\/api\/revalidate$/);
    assert.match(target.secretEnv, /^REVALIDATE_SECRET_[A-Z0-9]+$/);
  }
  assert.equal(new Set(TARGETS.map((target) => target.secretEnv)).size, TARGETS.length);
});
