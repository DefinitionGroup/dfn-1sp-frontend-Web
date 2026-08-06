#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@sanity/client";

const APPLY = process.argv.includes("--apply");
const backupArgument = process.argv.find((argument) => argument.startsWith("--backup="));
const unknownArguments = process.argv
  .slice(2)
  .filter((argument) => argument !== "--apply" && !argument.startsWith("--backup="));

if (unknownArguments.length) {
  throw new Error(`Unknown argument(s): ${unknownArguments.join(", ")}`);
}

const EXPECTED_PROJECT_ID = "wu6i3y0h";
const EXPECTED_DATASET = "dev-dataset";
const EXPECTED_STRENGTHENED_REFERENCES = 20;

const supersededServiceIds = [
  "6465340e-5d22-4b9d-ad9a-36e06c254ec2",
  "b7b98296-9639-44d0-937d-e396f9775a07",
  "c14eb875-b2d1-4e6e-9a92-60cdc249e30b",
  "ccb58dec-5ce3-4d6d-bdc5-549e42be254b",
  "d118cc4d-59f7-44a2-9ebd-64fffd1f773f",
  "eb1ade77-fd4b-4a0f-9d1c-08687f770c75",
  "f172b651-99a4-4471-94c6-1ac402a109eb",
  "f6eea649-36bb-4398-907d-7df055747982",
];

const newServiceIds = [
  "service-flzr-go-to-markets-en",
  "service-flzr-business-intelligence-en",
  "service-flzr-trainings-en",
  "service-flzr-promotion-en",
  "service-flzr-live-video-consulting-en",
  "service-flzr-pos-management-en",
  "service-flzr-sales-force-en",
  "service-flzr-ai-solutions-en",
];

const pageIds = [
  "page-flizr-home-v2-en",
  "page-flizr-services-v2-en",
  "page-flizr-agency-v2-en",
];

const caseIds = [
  "7dbf1a02-91d6-4e57-93d5-d378c7ec02f8",
  "case-flizr-o2-studio-en",
  "case-flizr-bose-q4-en",
];

const clientIds = [
  "572cc103-33f0-4b36-b586-d5f29d8270cd",
  "client-flizr-o2-en",
  "client-flizr-bose-en",
];

const targetBaseIds = [
  ...supersededServiceIds,
  ...newServiceIds,
  ...pageIds,
  ...caseIds,
  ...clientIds,
];
const targetBaseIdSet = new Set(targetBaseIds);
const targetDraftIds = targetBaseIds.map((id) => `drafts.${id}`);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function sameIds(actual, expected) {
  return JSON.stringify(sorted(actual)) === JSON.stringify(sorted(expected));
}

function walkReferences(value, callback) {
  if (!value || typeof value !== "object") return;
  if (value._type === "reference" && typeof value._ref === "string") callback(value);
  for (const child of Object.values(value)) walkReferences(child, callback);
}

function withoutSystemFields(document) {
  const copy = structuredClone(document);
  delete copy._rev;
  delete copy._createdAt;
  delete copy._updatedAt;
  delete copy._system;
  return copy;
}

function toPublishedDocument(draft) {
  const document = withoutSystemFields(draft);
  document._id = document._id.replace(/^drafts\./, "");

  walkReferences(document, (reference) => {
    if (!reference._weak && !reference._strengthenOnPublish) return;
    assert(
      targetBaseIdSet.has(reference._ref),
      `Refusing to strengthen an out-of-batch reference in ${draft._id}: ${reference._ref}`,
    );
    delete reference._weak;
    delete reference._strengthenOnPublish;
  });

  return document;
}

function verifyBackup(path) {
  assert(path, "--apply requires --backup=/absolute/or/repo-relative/path.tar.gz");
  const absolutePath = resolve(path);
  assert(existsSync(absolutePath), `Pre-publish backup does not exist: ${absolutePath}`);
  execFileSync("gzip", ["-t", absolutePath], { stdio: "pipe" });
  const entries = execFileSync("tar", ["-tzf", absolutePath], { encoding: "utf8" });
  assert(entries.split("\n").some((entry) => entry.endsWith("/data.ndjson")), "Backup has no data.ndjson entry.");
  return absolutePath;
}

const env = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
};

assert(
  env.projectId === EXPECTED_PROJECT_ID && env.dataset === EXPECTED_DATASET,
  `Refusing to run outside ${EXPECTED_PROJECT_ID}/${EXPECTED_DATASET}. Resolved ${env.projectId || "(missing)"}/${env.dataset || "(missing)"}.`,
);
assert(env.apiVersion, "NEXT_PUBLIC_SANITY_API_VERSION is required.");
assert(env.token, "SANITY_API_WRITE_TOKEN is required.");

const backupPath = APPLY ? verifyBackup(backupArgument?.slice("--backup=".length)) : null;
const client = createClient({
  projectId: env.projectId,
  dataset: env.dataset,
  apiVersion: env.apiVersion,
  token: env.token,
  useCdn: false,
  perspective: "raw",
});

function buildPublishTransaction(documents) {
  let transaction = client.transaction();
  for (const document of documents) transaction = transaction.createOrReplace(document);
  for (const draftId of targetDraftIds) transaction = transaction.delete(draftId);
  return transaction;
}

async function verifyPrePublishState() {
  assert(targetBaseIds.length === 25, `Expected 25 target IDs, found ${targetBaseIds.length}.`);
  assert(targetBaseIdSet.size === targetBaseIds.length, "Duplicate target IDs in publish manifest.");

  const [drafts, supersededServices, activeHomepages] = await Promise.all([
    client.fetch(`*[_id in $ids]`, { ids: targetDraftIds }),
    client.fetch(`*[_id in $ids]`, { ids: supersededServiceIds }),
    client.fetch(
      `*[_type == "page" && !(_id in path("drafts.**")) && channel == "flizrWeb" && language == "en" && isHomepage == true]{_id}`,
    ),
  ]);

  assert(
    sameIds(
      drafts.map((document) => document._id),
      targetDraftIds,
    ),
    `The publish batch is incomplete. Expected ${targetDraftIds.length} exact drafts, received ${drafts.length}.`,
  );
  assert(
    sameIds(
      supersededServices.map((document) => document._id),
      supersededServiceIds,
    ),
    "One or more superseded published Services are missing.",
  );
  assert(
    supersededServices.every((service) => service.channel?.includes("flizrWeb")),
    "A superseded Service no longer exposes flizrWeb; the pre-publish state has drifted.",
  );
  assert(activeHomepages.length === 1, `Expected one active FLZR EN Homepage, found ${activeHomepages.length}.`);
  assert(!pageIds.includes(activeHomepages[0]._id), "A v2 working page is already the active Homepage.");

  const draftsById = new Map(drafts.map((document) => [document._id, document]));
  for (const serviceId of supersededServiceIds) {
    const overlay = draftsById.get(`drafts.${serviceId}`);
    assert(overlay?._type === "services", `Missing Service overlay for ${serviceId}.`);
    assert(!overlay.channel?.includes("flizrWeb"), `Service overlay still exposes flizrWeb: ${serviceId}.`);
  }
  for (const [index, serviceId] of newServiceIds.entries()) {
    const service = draftsById.get(`drafts.${serviceId}`);
    assert(service?._type === "services", `Missing new FLZR Service: ${serviceId}.`);
    assert(
      JSON.stringify(service.channel) === '["flizrWeb"]' && service.language === "en",
      `New Service has unsafe scope: ${serviceId}.`,
    );
    assert(service.sortOrder === index + 1, `Unexpected sortOrder on ${serviceId}.`);
    assert(service.deliverables?.length, `Missing deliverables on ${serviceId}.`);
  }
  for (const pageId of pageIds) {
    const page = draftsById.get(`drafts.${pageId}`);
    assert(page?._type === "page", `Missing v2 Page: ${pageId}.`);
    assert(page.channel === "flizrWeb" && page.language === "en", `Unsafe page scope: ${pageId}.`);
    assert(page.isHomepage === false, `Working page cannot become Homepage during this publish: ${pageId}.`);
    assert(page.metadata?.excludeFromSitemap === true, `Working page must stay outside the sitemap: ${pageId}.`);
  }
  for (const caseId of caseIds) {
    const caseStudy = draftsById.get(`drafts.${caseId}`);
    assert(caseStudy?._type === "caseStudy", `Missing Case: ${caseId}.`);
    assert(
      caseStudy.language === "en" && JSON.stringify(caseStudy.channel) === '["flizrWeb"]' && caseStudy.isPublished === true,
      `Unsafe Case state: ${caseId}.`,
    );
  }
  for (const clientId of clientIds) {
    const client = draftsById.get(`drafts.${clientId}`);
    assert(client?._type === "client", `Missing Client: ${clientId}.`);
    assert(
      client.language === "en" && JSON.stringify(client.channel) === '["flizrWeb"]',
      `Unsafe Client scope: ${clientId}.`,
    );
  }

  let referencesToStrengthen = 0;
  for (const draft of drafts) {
    walkReferences(draft, (reference) => {
      if (!reference._weak && !reference._strengthenOnPublish) return;
      assert(
        reference._weak === true && targetBaseIdSet.has(reference._ref),
        `Unexpected weak reference in ${draft._id}: ${reference._ref}`,
      );
      assert(
        typeof reference._strengthenOnPublish?.type === "string",
        `Missing _strengthenOnPublish metadata in ${draft._id}: ${reference._ref}`,
      );
      referencesToStrengthen += 1;
    });
  }
  assert(
    referencesToStrengthen === EXPECTED_STRENGTHENED_REFERENCES,
    `Expected ${EXPECTED_STRENGTHENED_REFERENCES} draft-only references, found ${referencesToStrengthen}.`,
  );

  const publishedDocuments = drafts.map(toPublishedDocument);
  for (const document of publishedDocuments) {
    assert(!document._id.startsWith("drafts."), `Draft ID leaked into publish payload: ${document._id}.`);
    walkReferences(document, (reference) => {
      assert(!reference._weak, `Weak reference leaked into publish payload: ${document._id}.`);
      assert(!reference._strengthenOnPublish, `Strengthen marker leaked into publish payload: ${document._id}.`);
    });
  }

  return { activeHomepageId: activeHomepages[0]._id, publishedDocuments };
}

async function verifyPublishedState(activeHomepageId) {
  const [publishedDocuments, remainingDrafts, flzrServices, supersededServices, activeHomepages] = await Promise.all([
    client.fetch(`*[_id in $ids]`, { ids: targetBaseIds }),
    client.fetch(`*[_id in $ids]{_id}`, { ids: targetDraftIds }),
    client.fetch(
      `*[_type == "services" && !(_id in path("drafts.**")) && language == "en" && "flizrWeb" in channel] | order(sortOrder asc){_id, sortOrder}`,
    ),
    client.fetch(`*[_id in $ids]{_id, channel}`, { ids: supersededServiceIds }),
    client.fetch(
      `*[_type == "page" && !(_id in path("drafts.**")) && channel == "flizrWeb" && language == "en" && isHomepage == true]{_id}`,
    ),
  ]);

  assert(
    sameIds(
      publishedDocuments.map((document) => document._id),
      targetBaseIds,
    ),
    `Published verification expected ${targetBaseIds.length} target documents, received ${publishedDocuments.length}.`,
  );
  assert(remainingDrafts.length === 0, `Publish left ${remainingDrafts.length} target Drafts behind.`);
  assert(
    sameIds(
      flzrServices.map((service) => service._id),
      newServiceIds,
    ),
    `FLZR should expose exactly the eight replacement Services, found ${flzrServices.length}.`,
  );
  assert(
    flzrServices.every((service, index) => service.sortOrder === index + 1),
    "Published FLZR Service order is incorrect.",
  );
  assert(
    supersededServices.every((service) => !service.channel?.includes("flizrWeb")),
    "At least one superseded Service still exposes flizrWeb.",
  );
  assert(
    activeHomepages.length === 1 && activeHomepages[0]._id === activeHomepageId,
    "The active FLZR Homepage changed during the working-copy publish.",
  );

  let weakReferences = 0;
  let strengthenMarkers = 0;
  for (const document of publishedDocuments) {
    walkReferences(document, (reference) => {
      if (reference._weak) weakReferences += 1;
      if (reference._strengthenOnPublish) strengthenMarkers += 1;
    });
  }
  assert(weakReferences === 0, `Published batch still contains ${weakReferences} weak references.`);
  assert(strengthenMarkers === 0, `Published batch still contains ${strengthenMarkers} strengthen markers.`);

  const publishedPages = publishedDocuments.filter((document) => pageIds.includes(document._id));
  assert(
    publishedPages.every(
      (page) => page.isHomepage === false && page.metadata?.excludeFromSitemap === true,
    ),
    "A published v2 Page changed its working-copy visibility flags.",
  );

  return {
    publishedDocuments: publishedDocuments.length,
    remainingDrafts: remainingDrafts.length,
    flzrServices: flzrServices.map((service) => service._id),
    weakReferences,
    strengthenMarkers,
    activeHomepageId,
  };
}

async function main() {
  const { activeHomepageId, publishedDocuments } = await verifyPrePublishState();

  const dryRun = await buildPublishTransaction(publishedDocuments).commit({
    dryRun: true,
    returnDocuments: false,
    tag: "flzr.content-publish.atomic-dry-run.2026-08-06",
  });

  if (!APPLY) {
    console.log("FLZR atomic content publish dry-run passed. No CMS writes were made.");
    console.log(
      JSON.stringify(
        {
          projectId: env.projectId,
          dataset: env.dataset,
          targetDocuments: publishedDocuments.length,
          draftsDeletedInTransaction: targetDraftIds.length,
          strengthenedReferences: EXPECTED_STRENGTHENED_REFERENCES,
          activeHomepagePreserved: activeHomepageId,
          dryRunTransactionId: dryRun.transactionId,
        },
        null,
        2,
      ),
    );
    return;
  }

  const mutation = await buildPublishTransaction(publishedDocuments).commit({
    visibility: "sync",
    returnDocuments: false,
    tag: "flzr.content-publish.atomic.2026-08-06",
  });
  const verification = await verifyPublishedState(activeHomepageId);

  console.log("FLZR content batch published atomically and verified successfully.");
  console.log(
    JSON.stringify(
      {
        projectId: env.projectId,
        dataset: env.dataset,
        backupPath,
        transactionId: mutation.transactionId,
        ...verification,
      },
      null,
      2,
    ),
  );
}

await main();
