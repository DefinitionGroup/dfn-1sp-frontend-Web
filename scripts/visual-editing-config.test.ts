import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "@sanity/client";
import { resolveSanityFetchClientConfig } from "../packages/sanity-queries/src/fetch-config";

const baseClient = createClient({
  projectId: "visualediting",
  dataset: "test",
  apiVersion: "2025-09-16",
  useCdn: true,
  stega: { studioUrl: "https://www.1sp.agency/studio" },
});

test("draft previews enable stega overlays on the configured Sanity client", () => {
  const draftClient = baseClient.withConfig(
    resolveSanityFetchClientConfig({
      draftEnabled: true,
      studioUrl: "https://www.1sp.agency/studio",
      viewerToken: "test-viewer-token",
    }),
  );

  const config = draftClient.config();

  assert.equal(config.perspective, "drafts");
  assert.equal(config.stega.enabled, true);
  assert.equal(config.stega.studioUrl, "https://www.1sp.agency/studio");
  assert.equal(config.useCdn, false);
  assert.equal(config.token, "test-viewer-token");
});

test("published fetches remain free of stega metadata and viewer credentials", () => {
  const publishedClient = baseClient.withConfig(
    resolveSanityFetchClientConfig({
      draftEnabled: false,
      studioUrl: "https://www.1sp.agency/studio",
      viewerToken: "test-viewer-token",
    }),
  );

  const config = publishedClient.config();

  assert.equal(config.perspective, "published");
  assert.equal(config.stega.enabled, false);
  assert.equal(config.token, undefined);
});
