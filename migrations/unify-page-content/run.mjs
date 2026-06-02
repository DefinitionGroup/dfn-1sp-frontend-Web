/**
 * Standalone migration runner — Phase 1A
 * Unify per-channel content arrays into a single `content` field.
 *
 * Usage:
 *   node migrations/unify-page-content/run.mjs            # dry run (default)
 *   node migrations/unify-page-content/run.mjs --apply    # real run
 *
 * Reads credentials from environment:
 *   SANITY_API_WRITE_TOKEN, NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 */

import { createClient } from "@sanity/client";

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "wu6i3y0h";
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    ?? "dev-dataset";
const TOKEN      = process.env.SANITY_API_WRITE_TOKEN;
const DRY_RUN    = !process.argv.includes("--apply");

const CHANNEL_TO_LEGACY_FIELD = {
  "1spWeb":       "content1sp",
  msmWeb:         "contentMSM",
  studioco2Web:   "contentStudioCO2",
  flizrWeb:       "contentStudioFlizr",
};

// ── Sanity client ─────────────────────────────────────────────────────────────

const client = createClient({
  projectId: PROJECT_ID,
  dataset:   DATASET,
  apiVersion: "2025-01-01",
  token:     TOKEN,
  useCdn:    false,
});

// ── Main ──────────────────────────────────────────────────────────────────────

console.log(`\n🔍  Mode:    ${DRY_RUN ? "DRY RUN (no writes)" : "⚡ APPLYING"}`);
console.log(`📦  Project: ${PROJECT_ID}`);
console.log(`🗄️   Dataset: ${DATASET}\n`);

// Fetch all pages that:
//   - don't yet have `content` set
//   - have at least one legacy field
const query = `*[
  _type == "page"
  && !defined(content)
  && (
       defined(content1sp)
    || defined(contentMSM)
    || defined(contentStudioCO2)
    || defined(contentStudioFlizr)
  )
]{
  _id, _type, channel,
  "has1sp":         defined(content1sp),
  "hasMsm":         defined(contentMSM),
  "hasCo2":         defined(contentStudioCO2),
  "hasFlzr":        defined(contentStudioFlizr),
  "len1sp":         length(content1sp),
  "lenMsm":         length(contentMSM),
  "lenCo2":         length(contentStudioCO2),
  "lenFlzr":        length(contentStudioFlizr),
  content1sp,
  contentMSM,
  contentStudioCO2,
  contentStudioFlizr
}`;

const pages = await client.fetch(query);

console.log(`Found ${pages.length} page(s) that need migrating.\n`);

if (pages.length === 0) {
  console.log("✅  Nothing to do — all pages already have `content` set.");
  process.exit(0);
}

// Print summary table
console.log("ID".padEnd(50) + "channel".padEnd(20) + "source field".padEnd(25) + "blocks");
console.log("─".repeat(105));

let skipped = 0;
let toMigrate = [];

for (const page of pages) {
  const channel = page.channel;
  const legacyField = CHANNEL_TO_LEGACY_FIELD[channel];

  if (!legacyField) {
    console.log(`${page._id.padEnd(50)}${String(channel ?? "NONE").padEnd(20)}${"⚠️  unknown channel — SKIP".padEnd(25)}`);
    skipped++;
    continue;
  }

  const legacyData = page[legacyField];
  const blockCount = Array.isArray(legacyData) ? legacyData.length : 0;

  if (!legacyData || blockCount === 0) {
    console.log(`${page._id.padEnd(50)}${channel.padEnd(20)}${(legacyField + " (empty)").padEnd(25)}0  — SKIP`);
    skipped++;
    continue;
  }

  console.log(`${page._id.padEnd(50)}${channel.padEnd(20)}${legacyField.padEnd(25)}${blockCount}`);
  toMigrate.push({ id: page._id, field: legacyField, data: legacyData });
}

console.log(`\nWill migrate: ${toMigrate.length}  |  Skipped: ${skipped}\n`);

if (DRY_RUN) {
  console.log("🏃  Dry run complete. Run with --apply to write changes.");
  process.exit(0);
}

// ── Apply ─────────────────────────────────────────────────────────────────────

let ok = 0;
let failed = 0;

for (const { id, field, data } of toMigrate) {
  try {
    await client
      .patch(id)
      .setIfMissing({ content: data })
      .commit({ visibility: "async" });
    console.log(`✅  ${id}  (${field} → content)`);
    ok++;
  } catch (err) {
    console.error(`❌  ${id}  ${err.message}`);
    failed++;
  }
}

console.log(`\n🎉  Done.  Migrated: ${ok}  |  Failed: ${failed}`);
if (failed > 0) process.exit(1);
