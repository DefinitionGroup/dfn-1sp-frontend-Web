/**
 * Rollback — Phase 1A (between `run.mjs` and `cleanup-legacy.mjs`)
 *
 * Unsets the unified `content` field on `page` documents that were just
 * populated by run.mjs. This is the safe escape hatch IF and ONLY IF
 * `cleanup-legacy.mjs` has NOT yet been run — in that window the legacy
 * per-channel fields (content1sp, contentStudioFlizr, etc.) are still
 * populated, so GROQ coalesce can keep rendering pages.
 *
 * ┌─────────────────────────┬──────────────────────────────────────────────┐
 * │ Migration stage         │ How to roll back                             │
 * ├─────────────────────────┼──────────────────────────────────────────────┤
 * │ Before run.mjs          │ Nothing to undo                              │
 * │ After run.mjs           │ THIS SCRIPT — unset `content`                │
 * │ After cleanup-legacy.mjs│ Use dataset import from your backup tarball; │
 * │                         │ this script CANNOT restore legacy data       │
 * └─────────────────────────┴──────────────────────────────────────────────┘
 *
 * Safety:
 *   - Only unsets `content` on documents where legacy fields are still
 *     defined (i.e. cleanup hasn't run yet). Refuses to touch documents
 *     whose only content lives in `content` — those would be left with
 *     no renderable data, and the right recovery is dataset import.
 *
 * Usage:
 *   node migrations/unify-page-content/rollback.mjs            # dry run
 *   node migrations/unify-page-content/rollback.mjs --apply    # writes
 */

import { createClient } from "@sanity/client";

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "wu6i3y0h";
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    ?? "dev-dataset";
const TOKEN      = process.env.SANITY_API_WRITE_TOKEN;
const DRY_RUN    = !process.argv.includes("--apply");

const client = createClient({
  projectId:  PROJECT_ID,
  dataset:    DATASET,
  apiVersion: "2025-01-01",
  token:      TOKEN,
  useCdn:     false,
});

console.log(`\n🔄  Mode:    ${DRY_RUN ? "DRY RUN (no writes)" : "⚡ APPLYING"}`);
console.log(`📦  Project: ${PROJECT_ID}`);
console.log(`🗄️   Dataset: ${DATASET}\n`);

// SAFETY: only target docs that have BOTH `content` AND at least one legacy
// field defined. If a doc has `content` but no legacy, cleanup has already
// run and this script would destroy the only copy of the data.
const query = `*[
  _type == "page"
  && defined(content)
  && (
       defined(content1sp)
    || defined(contentMSM)
    || defined(contentStudioCO2)
    || defined(contentStudioFlizr)
  )
]{ _id, channel }`;

const candidates = await client.fetch(query);

// Sanity check: are there docs with content but NO legacy? Those are post-cleanup.
const postCleanupCount = await client.fetch(
  `count(*[_type == "page" && defined(content) &&
    !defined(content1sp) && !defined(contentMSM) &&
    !defined(contentStudioCO2) && !defined(contentStudioFlizr)])`
);

console.log(`Found ${candidates.length} rollback-safe page(s).`);
if (postCleanupCount > 0) {
  console.log(`⚠️   ${postCleanupCount} other page(s) have content but NO legacy data —`);
  console.log(`    cleanup-legacy.mjs has already run on them. This script will`);
  console.log(`    NOT touch those — recovery requires dataset import.\n`);
}

if (candidates.length === 0) {
  console.log("Nothing to roll back. (Either no migration has run, or cleanup");
  console.log("has already removed the legacy safety net for every doc.)");
  process.exit(0);
}

console.log();
console.log("ID".padEnd(50) + "channel");
console.log("─".repeat(70));
for (const doc of candidates) {
  console.log(doc._id.padEnd(50) + (doc.channel ?? ""));
}

console.log(`\nTotal documents to unset 'content' on: ${candidates.length}\n`);

if (DRY_RUN) {
  console.log("🏃  Dry run complete. Run with --apply to write changes.");
  process.exit(0);
}

let ok = 0;
let failed = 0;

for (const { _id } of candidates) {
  try {
    await client.patch(_id).unset(["content"]).commit({ visibility: "async" });
    console.log(`✅  ${_id}  (unset: content)`);
    ok++;
  } catch (err) {
    console.error(`❌  ${_id}  ${err.message}`);
    failed++;
  }
}

console.log(`\n🎉  Done.  Rolled back: ${ok}  |  Failed: ${failed}`);
if (failed > 0) process.exit(1);
