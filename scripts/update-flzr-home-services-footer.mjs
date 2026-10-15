import { writeFile } from "node:fs/promises";
import { createClient } from "@sanity/client";

const EXPECTED_PROJECT_ID = "wu6i3y0h";
const EXPECTED_DATASET = "dev-dataset";
const PAGE_ID = "page-flizr-home-v3-preview-en";
const HERO_KEY = "home-v3-hero";
const BRIDGE_KEY = "home-v3-services-bridge";
const RESET_KEY = "home-v3-reset-after-services";
const APPLY = process.argv.includes("--apply");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-09-16";
const token = APPLY
  ? process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN
  : undefined;

if (projectId !== EXPECTED_PROJECT_ID || dataset !== EXPECTED_DATASET) {
  throw new Error(
    `Refusing to run outside ${EXPECTED_PROJECT_ID}/${EXPECTED_DATASET}; received ${projectId}/${dataset}`,
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

const document = await client.fetch(
  `*[_id == $id][0]{_id,_rev,_updatedAt,content}`,
  { id: PAGE_ID },
);

if (!document?._id || !Array.isArray(document.content)) {
  throw new Error(`Homepage ${PAGE_ID} was not found or has no content array.`);
}

const keyIndex = (key) => document.content.findIndex((block) => block?._key === key);
const heroIndex = keyIndex(HERO_KEY);
const bridgeIndex = keyIndex(BRIDGE_KEY);
const resetIndex = keyIndex(RESET_KEY);

for (const [key, index] of [
  [HERO_KEY, heroIndex],
  [BRIDGE_KEY, bridgeIndex],
  [RESET_KEY, resetIndex],
]) {
  if (index < 0) throw new Error(`Required block ${key} is missing.`);
}

const nextContent = structuredClone(document.content);
const [bridge] = nextContent.splice(bridgeIndex, 1);
const nextResetIndex = nextContent.findIndex((block) => block?._key === RESET_KEY);
nextContent.splice(nextResetIndex, 0, bridge);

const nextHero = nextContent.find((block) => block?._key === HERO_KEY);
const nextBridge = nextContent.find((block) => block?._key === BRIDGE_KEY);

if (!nextHero?.cta || !nextBridge?.cta) {
  throw new Error("Expected hero and services bridge CTAs were not found.");
}

// Keep values accepted by the currently deployed Studio bundle. Button2 maps
// glass to the dark-surface ghost, while the section footer renderer enforces
// the light-surface ghost treatment inside a section band.
nextHero.cta.variant = "glass";
nextBridge.cta.variant = "violet";

const before = {
  order: document.content.map((block) => block?._key),
  heroVariant: document.content[heroIndex]?.cta?.variant,
  bridgeVariant: document.content[bridgeIndex]?.cta?.variant,
};
const after = {
  order: nextContent.map((block) => block?._key),
  heroVariant: nextHero.cta.variant,
  bridgeVariant: nextBridge.cta.variant,
};
const changed = JSON.stringify(before) !== JSON.stringify(after);

console.log(JSON.stringify({ mode: APPLY ? "apply" : "dry-run", page: PAGE_ID, revision: document._rev, changed, before, after }, null, 2));

if (!changed) {
  console.log("Homepage services footer is already configured.");
  process.exit(0);
}

if (!APPLY) {
  console.log("Dry run only. Re-run with --apply to write the guarded patch.");
  process.exit(0);
}

if (!token) {
  throw new Error(
    "SANITY_API_WRITE_TOKEN or SANITY_AUTH_TOKEN is required for --apply.",
  );
}

const backupPath = `/private/tmp/${PAGE_ID}-${document._rev}.json`;
await writeFile(backupPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");

const result = await client
  .patch(PAGE_ID)
  .ifRevisionId(document._rev)
  .set({ content: nextContent })
  .commit({ autoGenerateArrayKeys: false });

console.log(JSON.stringify({ updated: result._id, revision: result._rev, backupPath }, null, 2));
