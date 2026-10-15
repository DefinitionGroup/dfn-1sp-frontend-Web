#!/usr/bin/env node

/**
 * Read-only pre-switch check: does `production` hold everything live 1SP
 * shows from `dev-dataset`? Both datasets are public, so no token is needed
 * and only published documents are compared.
 *
 *   pnpm check:1sp-dataset-switch [--since 2026-10-15T17:15:00Z]
 *
 * Exits 1 when a live edit or a 1SP document would be lost by the switch.
 * See docs/DEPLOYMENT.md, "Switching live 1SP to production".
 */

import { createClient } from "@sanity/client";

const PROJECT_ID = "wu6i3y0h";
const LIVE_DATASET = "dev-dataset";
const TARGET_DATASET = "production";
const CHANNEL = "1spWeb";
// The 2026-10-15 audit copied every earlier live edit into production.
const AUDITED_AT = "2026-10-15T17:15:00Z";
// Contact submissions are written by the live site, not edited in Studio.
const RECORD_TYPES = new Set(["contactSubmission"]);

function parseSince(argv) {
  const index = argv.indexOf("--since");
  const value = index === -1 ? AUDITED_AT : argv[index + 1];
  if (!value || Number.isNaN(Date.parse(value))) {
    throw new Error(`--since needs an ISO timestamp, received ${value}`);
  }
  return value;
}

function client(dataset) {
  return createClient({
    projectId: PROJECT_ID,
    dataset,
    apiVersion: "2025-09-16",
    useCdn: false,
    perspective: "published",
  });
}

const fetchAll = (dataset) =>
  client(dataset).fetch(`*[!(_id in path("_.**"))]`);

function hasChannel(doc) {
  const channel = doc.channel;
  return Array.isArray(channel) ? channel.includes(CHANNEL) : channel === CHANNEL;
}

// Untagged documents (units, service groups, component groups) are shared.
const rendersOn1sp = (doc) => doc.channel == null || hasChannel(doc);

/**
 * Production stores compacted Cloudinary objects (no upload metadata), so an
 * asset counts as equal when it points at the same Cloudinary file.
 */
function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== "object") return value;
  if (value._type === "cloudinary.asset") {
    return { public_id: value.public_id, resource_type: value.resource_type };
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !["_rev", "_updatedAt", "_createdAt", "_system"].includes(key))
      .map(([key, entry]) => [key, normalize(entry)]),
  );
}

/**
 * True when `target` keeps every value of `live`. Fields production added
 * for the other sites (e.g. `siteContent`) do not count as a difference.
 */
function keepsLiveContent(live, target) {
  if (Array.isArray(live)) {
    return (
      Array.isArray(target) &&
      live.length === target.length &&
      live.every((entry, index) => keepsLiveContent(entry, target[index]))
    );
  }
  if (live && typeof live === "object") {
    return (
      Boolean(target) &&
      typeof target === "object" &&
      Object.entries(live).every(([key, entry]) => keepsLiveContent(entry, target[key]))
    );
  }
  return live === target;
}

const sameContent = (live, target) => keepsLiveContent(normalize(live), normalize(target));

function label(doc) {
  const title = doc.title ?? doc.name ?? doc.slug?.current ?? "";
  return `${doc._type} ${doc._id} ${title ? `"${title}" ` : ""}(${doc._updatedAt})`;
}

async function main() {
  const since = parseSince(process.argv.slice(2));
  const [live, target] = await Promise.all([fetchAll(LIVE_DATASET), fetchAll(TARGET_DATASET)]);
  const targetById = new Map(target.map((doc) => [doc._id, doc]));
  const liveIds = new Set(live.map((doc) => doc._id));

  const lostFrom1sp = live.filter(
    (doc) => hasChannel(doc) && !RECORD_TYPES.has(doc._type) && !hasChannel(targetById.get(doc._id) ?? {}),
  );
  const changedSince = live.filter(
    (doc) =>
      doc._updatedAt > since &&
      rendersOn1sp(doc) &&
      !RECORD_TYPES.has(doc._type) &&
      !(targetById.has(doc._id) && sameContent(doc, targetById.get(doc._id))),
  );
  const records = live.filter((doc) => RECORD_TYPES.has(doc._type) && !targetById.has(doc._id));
  const new1sp = target.filter((doc) => hasChannel(doc) && !liveIds.has(doc._id));

  console.log(`${LIVE_DATASET}: ${live.length} published, ${TARGET_DATASET}: ${target.length} published`);
  console.log(`${CHANNEL} documents: ${live.filter(hasChannel).length} live, ${target.filter(hasChannel).length} in ${TARGET_DATASET}`);

  const sections = [
    [`Live ${CHANNEL} documents missing from ${TARGET_DATASET} (blocker)`, lostFrom1sp],
    [`Live edits since ${since} not in ${TARGET_DATASET} (blocker: copy them first)`, changedSince],
    [`Live-only records, stay in ${LIVE_DATASET} as archive (info)`, records],
    [`${CHANNEL} documents that appear on 1SP after the switch (info)`, new1sp],
  ];
  for (const [heading, docs] of sections) {
    console.log(`\n${heading}: ${docs.length}`);
    for (const doc of docs) console.log(`  - ${label(doc)}`);
  }

  if (lostFrom1sp.length > 0 || changedSince.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
