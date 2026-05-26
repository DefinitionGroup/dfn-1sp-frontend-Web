/**
 * Cleanup — Phase 1A (post-migration)
 *
 * Unsets the legacy per-channel content fields on documents where the unified
 * `content` field has been populated.
 *
 * This brings the dataset back below the Sanity attribute/datatype limit
 * (2k on Free, 10k on Growth). The previous step (unify-page-content/run.mjs)
 * duplicated content across paths; this step removes the duplication.
 *
 * Safety:
 *   - Only unsets a legacy field if `content` is defined on that document
 *     (i.e. the migration was successful).
 *   - Leaves docs untouched where `content` is missing — those would lose
 *     data if their legacy field were unset.
 *   - Always run a dataset export first if running against production:
 *       npx sanity@latest dataset export production production.tar.gz
 *
 * Usage:
 *   node migrations/unify-page-content/cleanup-legacy.mjs            # dry run
 *   node migrations/unify-page-content/cleanup-legacy.mjs --apply    # writes
 */

import { createClient } from "@sanity/client";

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "wu6i3y0h";
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    ?? "dev-dataset";
const TOKEN      = process.env.SANITY_API_WRITE_TOKEN;
const DRY_RUN    = !process.argv.includes("--apply");

const LEGACY_FIELDS = [
  "content1sp",
  "contentMSM",
  "contentStudioCO2",
  "contentStudioFlizr",
];

const client = createClient({
  projectId:  PROJECT_ID,
  dataset:    DATASET,
  apiVersion: "2025-01-01",
  token:      TOKEN,
  useCdn:     false,
});

console.log(`\n🔍  Mode:    ${DRY_RUN ? "DRY RUN (no writes)" : "⚡ APPLYING"}`);
console.log(`📦  Project: ${PROJECT_ID}`);
console.log(`🗄️   Dataset: ${DATASET}\n`);

// Find every page with `content` populated AND at least one legacy field.
const query = `*[
  _type == "page"
  && defined(content)
  && (
       defined(content1sp)
    || defined(contentMSM)
    || defined(contentStudioCO2)
    || defined(contentStudioFlizr)
  )
]{
  _id,
  channel,
  "has1sp":  defined(content1sp),
  "hasMsm":  defined(contentMSM),
  "hasCo2":  defined(contentStudioCO2),
  "hasFlzr": defined(contentStudioFlizr)
}`;

const pages = await client.fetch(query);

console.log(`Found ${pages.length} page(s) with duplicated legacy content.\n`);

if (pages.length === 0) {
  console.log("✅  Nothing to do.");
  process.exit(0);
}

console.log(
  "ID".padEnd(50) +
  "channel".padEnd(15) +
  "will unset"
);
console.log("─".repeat(110));

let plan = [];

for (const page of pages) {
  const fieldsToUnset = [];
  if (page.has1sp)  fieldsToUnset.push("content1sp");
  if (page.hasMsm)  fieldsToUnset.push("contentMSM");
  if (page.hasCo2)  fieldsToUnset.push("contentStudioCO2");
  if (page.hasFlzr) fieldsToUnset.push("contentStudioFlizr");

  if (fieldsToUnset.length === 0) continue;

  console.log(
    page._id.padEnd(50) +
    String(page.channel ?? "").padEnd(15) +
    fieldsToUnset.join(", ")
  );
  plan.push({ id: page._id, unset: fieldsToUnset });
}

console.log(`\nTotal documents to clean: ${plan.length}\n`);

if (DRY_RUN) {
  console.log("🏃  Dry run complete. Run with --apply to write changes.");
  process.exit(0);
}

let ok = 0;
let failed = 0;

for (const { id, unset } of plan) {
  try {
    await client.patch(id).unset(unset).commit({ visibility: "async" });
    console.log(`✅  ${id}  (unset: ${unset.join(", ")})`);
    ok++;
  } catch (err) {
    console.error(`❌  ${id}  ${err.message}`);
    failed++;
  }
}

console.log(`\n🎉  Done.  Cleaned: ${ok}  |  Failed: ${failed}`);
if (failed > 0) process.exit(1);
