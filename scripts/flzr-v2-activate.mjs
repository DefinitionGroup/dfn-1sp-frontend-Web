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
const EXPECTED_REFERENCE_REWRITES = 11;
const EXPECTED_DRAFT_ID = "drafts.page-flizr-home-v2-en";
const EXPECTED_DRAFT_CHANGED_BLOCK = "home-v2-hero";

const pages = {
  home: {
    archiveId: "page-flizr-home-en",
    canonicalId: "page-flizr-home-v2-en",
    canonicalTitle: "FLZR",
    canonicalSlug: "home",
    archiveTitle: "ARCHIVE - FLZR Homepage (pre-v2)",
    archiveSlug: "archive-home-pre-v2",
    isHomepage: true,
  },
  services: {
    archiveId: "1b002b0b-58ca-45ef-b673-59e98d8b00ba",
    canonicalId: "page-flizr-services-v2-en",
    canonicalTitle: "Services",
    canonicalSlug: "services",
    archiveTitle: "ARCHIVE - FLZR Services (pre-v2)",
    archiveSlug: "archive-services-pre-v2",
    isHomepage: false,
  },
  agency: {
    archiveId: "page-flizr-whatwedo-en",
    canonicalId: "page-flizr-agency-v2-en",
    canonicalTitle: "Agency",
    canonicalSlug: "agency",
    archiveTitle: "ARCHIVE - FLZR Agency (pre-v2)",
    archiveSlug: "archive-agency-pre-v2",
    isHomepage: false,
  },
};

const expectedReferenceOwners = new Map([
  [
    pages.agency.archiveId,
    [
      "544bf35a-3f5c-44ca-a11b-0dbfa7f226ce",
      "799578f3-a474-4979-b5d1-b05fa449392f",
      "e53ec4dc-bae5-41b2-a202-bcc908861397",
      pages.home.archiveId,
    ],
  ],
  [
    pages.services.archiveId,
    [
      "6db20faa-82dc-4a1f-b608-55668e59b0dc",
      "799578f3-a474-4979-b5d1-b05fa449392f",
      "9fd3bef9-55d3-4235-8ea8-43b2e45e888b",
      "a7c0466b-f13b-42a1-af81-4949ee545769",
      "msm-page-cases-en",
      "msm-page-services-en",
    ],
  ],
  [pages.home.archiveId, ["translation.metadata.page-flizr-home-en"]],
]);

const referenceReplacement = new Map([
  [pages.home.archiveId, pages.home.canonicalId],
  [pages.agency.archiveId, pages.agency.canonicalId],
  [pages.services.archiveId, pages.services.canonicalId],
]);

const targetDocumentIds = [
  ...Object.values(pages).flatMap(({ archiveId, canonicalId }) => [archiveId, canonicalId]),
  ...[...expectedReferenceOwners.values()].flat(),
].filter((id, index, ids) => ids.indexOf(id) === index);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function sameValues(actual, expected) {
  return JSON.stringify(sorted(actual)) === JSON.stringify(sorted(expected));
}

function metadataWithSitemapFlag(metadata, excludeFromSitemap) {
  return {
    ...(metadata || {}),
    _type: "metadata",
    excludeFromSitemap,
  };
}

function draftDiffSummary(draft, published) {
  const ignoredFields = new Set(["_createdAt", "_id", "_rev", "_updatedAt", "_system"]);
  const fieldNames = [...new Set([...Object.keys(draft), ...Object.keys(published)])]
    .filter((field) => !ignoredFields.has(field))
    .sort();
  const changedFields = fieldNames.filter(
    (field) => JSON.stringify(draft[field]) !== JSON.stringify(published[field]),
  );
  const publishedBlocks = new Map(
    (published.content || []).map((block) => [block._key, block]),
  );
  const draftBlocks = new Map((draft.content || []).map((block) => [block._key, block]));
  const contentKeys = [...new Set([...publishedBlocks.keys(), ...draftBlocks.keys()])];
  const changedContentBlocks = contentKeys.filter(
    (key) => JSON.stringify(draftBlocks.get(key)) !== JSON.stringify(publishedBlocks.get(key)),
  );

  return {
    draftId: draft._id,
    draftRevision: draft._rev,
    draftUpdatedAt: draft._updatedAt,
    publishedId: published._id,
    publishedRevision: published._rev,
    publishedUpdatedAt: published._updatedAt,
    changedFields,
    changedContentBlocks,
    changedBlockDetails: changedContentBlocks.map((key) => ({
      key,
      draft: draftBlocks.get(key),
      published: publishedBlocks.get(key),
    })),
  };
}

function verifyBackup(path) {
  assert(path, "--apply requires --backup=/absolute/or/repo-relative/path.tar.gz");
  const absolutePath = resolve(path);
  assert(existsSync(absolutePath), `Activation backup does not exist: ${absolutePath}`);
  execFileSync("gzip", ["-t", absolutePath], { stdio: "pipe" });
  const entries = execFileSync("tar", ["-tzf", absolutePath], { encoding: "utf8" });
  assert(
    entries.split("\n").some((entry) => entry.endsWith("/data.ndjson")),
    "Activation backup has no data.ndjson entry.",
  );
  return absolutePath;
}

function sanityPath(path) {
  return path.reduce((result, segment, index) => {
    if (typeof segment === "number") return `${result}[${segment}]`;
    return `${result}${index === 0 ? "" : "."}${segment}`;
  }, "");
}

function collectReferencePatches(value, path = [], patches = []) {
  if (!value || typeof value !== "object") return patches;

  if (value._type === "reference" && referenceReplacement.has(value._ref)) {
    patches.push({
      from: value._ref,
      path: sanityPath([...path, "_ref"]),
      to: referenceReplacement.get(value._ref),
    });
  }

  if (Array.isArray(value)) {
    value.forEach((child, index) => collectReferencePatches(child, [...path, index], patches));
  } else {
    Object.entries(value).forEach(([key, child]) =>
      collectReferencePatches(child, [...path, key], patches),
    );
  }

  return patches;
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

async function buildActivationPlan() {
  const allTargetIds = [
    ...targetDocumentIds,
    ...targetDocumentIds.map((id) => `drafts.${id}`),
  ];
  const documents = await client.fetch(`*[_id in $ids]`, { ids: allTargetIds });
  const drafts = documents.filter((document) => document._id.startsWith("drafts."));
  const published = documents.filter((document) => !document._id.startsWith("drafts."));

  assert(
    drafts.length === 1 && drafts[0]._id === EXPECTED_DRAFT_ID,
    `Expected only ${EXPECTED_DRAFT_ID}; found ${drafts.length} Draft(s): ${drafts
      .map((document) => `${document._id} (${document._updatedAt})`)
      .join(", ") || "none"}.`,
  );
  assert(
    sameValues(
      published.map((document) => document._id),
      targetDocumentIds,
    ),
    `Expected ${targetDocumentIds.length} exact published target documents, found ${published.length}.`,
  );

  const documentsById = new Map(published.map((document) => [document._id, document]));
  const homepageDraft = drafts[0];
  const homepageDraftSummary = draftDiffSummary(
    homepageDraft,
    documentsById.get(pages.home.canonicalId),
  );
  assert(
    JSON.stringify(homepageDraftSummary.changedFields) === JSON.stringify(["content"]) &&
      JSON.stringify(homepageDraftSummary.changedContentBlocks) ===
        JSON.stringify([EXPECTED_DRAFT_CHANGED_BLOCK]),
    `The expected Homepage Draft changed outside ${EXPECTED_DRAFT_CHANGED_BLOCK}.`,
  );

  for (const [archiveId, expectedOwners] of expectedReferenceOwners) {
    const actualOwners = await client.fetch(`*[references($id)]{_id}`, { id: archiveId });
    assert(
      sameValues(
        actualOwners.map((document) => document._id),
        expectedOwners,
      ),
      `Inbound references for ${archiveId} drifted. Expected ${expectedOwners.length} (${expectedOwners.join(", ") || "none"}), found ${actualOwners.length} (${actualOwners.map((document) => document._id).join(", ") || "none"}).`,
    );
  }

  const activeHomepages = await client.fetch(
    `*[_type == "page" && !(_id in path("drafts.**")) && channel == "flizrWeb" && language == "en" && isHomepage == true]{_id}`,
  );
  assert(
    activeHomepages.length === 1 && activeHomepages[0]._id === pages.home.archiveId,
    `Expected ${pages.home.archiveId} to be the only active FLZR EN Homepage.`,
  );

  for (const page of Object.values(pages)) {
    const current = documentsById.get(page.archiveId);
    const v2 = documentsById.get(page.canonicalId);
    assert(current?._type === "page" && v2?._type === "page", `Missing Page pair for ${page.canonicalSlug}.`);
    assert(
      current.channel === "flizrWeb" && current.language === "en",
      `Unsafe current-page scope: ${page.archiveId}.`,
    );
    assert(
      v2.channel === "flizrWeb" && v2.language === "en",
      `Unsafe v2-page scope: ${page.canonicalId}.`,
    );
    assert(current.slug?.current === page.canonicalSlug, `Current slug drifted: ${page.archiveId}.`);
    assert(v2.slug?.current === `${page.canonicalSlug}-v2`, `V2 slug drifted: ${page.canonicalId}.`);
    assert(v2.isHomepage === false, `V2 page is already active: ${page.canonicalId}.`);
    assert(
      v2.metadata?.excludeFromSitemap === true,
      `V2 page is not marked as a working copy: ${page.canonicalId}.`,
    );
  }

  const setOperationsById = new Map(targetDocumentIds.map((id) => [id, {}]));

  for (const page of Object.values(pages)) {
    const current = documentsById.get(page.archiveId);
    const v2 = documentsById.get(page.canonicalId);

    Object.assign(setOperationsById.get(page.archiveId), {
      title: page.archiveTitle,
      slug: { _type: "slug", current: page.archiveSlug },
      isHomepage: false,
      metadata: metadataWithSitemapFlag(current.metadata, true),
    });
    Object.assign(setOperationsById.get(page.canonicalId), {
      title: page.canonicalTitle,
      slug: { _type: "slug", current: page.canonicalSlug },
      isHomepage: page.isHomepage,
      metadata: metadataWithSitemapFlag(v2.metadata, false),
    });
  }

  setOperationsById.get(pages.home.canonicalId).content = homepageDraft.content;

  let referenceRewriteCount = 0;
  const referenceRewrites = [];
  for (const document of published) {
    for (const patch of collectReferencePatches(document)) {
      setOperationsById.get(document._id)[patch.path] = patch.to;
      referenceRewrites.push({ documentId: document._id, ...patch });
      referenceRewriteCount += 1;
    }
  }

  assert(
    referenceRewriteCount === EXPECTED_REFERENCE_REWRITES,
    `Expected ${EXPECTED_REFERENCE_REWRITES} reference rewrites, found ${referenceRewriteCount}.`,
  );

  let transaction = client.transaction();
  for (const document of published) {
    const setOperations = setOperationsById.get(document._id);
    if (!Object.keys(setOperations).length) continue;
    transaction = transaction.patch(document._id, (patch) =>
      patch.ifRevisionId(document._rev).set(setOperations),
    );
  }
  transaction = transaction
    .patch(homepageDraft._id, (patch) =>
      patch.ifRevisionId(homepageDraft._rev).set({ title: homepageDraft.title }),
    )
    .delete(homepageDraft._id);

  return {
    documentPatches: [...setOperationsById.values()].filter(
      (setOperations) => Object.keys(setOperations).length > 0,
    ).length,
    referenceRewrites,
    homepageDraft: homepageDraftSummary,
    transaction,
  };
}

async function verifyActivatedState() {
  const pageIds = Object.values(pages).flatMap(({ archiveId, canonicalId }) => [
    archiveId,
    canonicalId,
  ]);
  const [pageDocuments, activeHomepages, canonicalSlugs, sitemapPages, remainingDrafts] = await Promise.all([
    client.fetch(
      `*[_id in $ids]{_id,title,"slug":slug.current,isHomepage,"excluded":metadata.excludeFromSitemap}`,
      { ids: pageIds },
    ),
    client.fetch(
      `*[_type == "page" && !(_id in path("drafts.**")) && channel == "flizrWeb" && language == "en" && isHomepage == true]{_id}`,
    ),
    client.fetch(
      `*[_type == "page" && !(_id in path("drafts.**")) && channel == "flizrWeb" && language == "en" && slug.current in ["home", "services", "agency"]]{_id,"slug":slug.current}`,
    ),
    client.fetch(
      `*[_type == "page" && !(_id in path("drafts.**")) && channel == "flizrWeb" && language == "en" && !isHomepage && metadata.excludeFromSitemap != true]{_id,"slug":slug.current}`,
    ),
    client.fetch(`*[_id == $id]{_id}`, { id: EXPECTED_DRAFT_ID }),
  ]);

  const pagesById = new Map(pageDocuments.map((document) => [document._id, document]));
  assert(
    activeHomepages.length === 1 && activeHomepages[0]._id === pages.home.canonicalId,
    "The V2 Homepage is not the only active FLZR EN Homepage.",
  );

  for (const page of Object.values(pages)) {
    const canonical = pagesById.get(page.canonicalId);
    const archive = pagesById.get(page.archiveId);
    assert(
      canonical?.slug === page.canonicalSlug &&
        canonical.isHomepage === page.isHomepage &&
        canonical.excluded === false,
      `Canonical verification failed for ${page.canonicalId}.`,
    );
    assert(
      archive?.slug === page.archiveSlug &&
        archive.isHomepage === false &&
        archive.excluded === true,
      `Archive verification failed for ${page.archiveId}.`,
    );
  }

  assert(canonicalSlugs.length === 3, `Expected three exact canonical slugs, found ${canonicalSlugs.length}.`);
  assert(remainingDrafts.length === 0, "The activated V2 Homepage Draft still exists.");
  const expectedSitemapIds = [pages.services.canonicalId, pages.agency.canonicalId];
  assert(
    expectedSitemapIds.every((id) => sitemapPages.some((page) => page._id === id)),
    "The canonical Services or Agency page is missing from the sitemap query.",
  );
  assert(
    Object.values(pages).every((page) => !sitemapPages.some((entry) => entry._id === page.archiveId)),
    "An archived page still appears in the sitemap query.",
  );

  for (const archiveId of expectedReferenceOwners.keys()) {
    const remaining = await client.fetch(`*[references($id)]{_id}`, { id: archiveId });
    assert(remaining.length === 0, `Archived page ${archiveId} still has ${remaining.length} inbound reference(s).`);
  }

  const menu = await client.fetch(
    `*[_type == "menu" && channel == "flizrWeb" && language == "en" && menuType == "Navbar"][0]{menuItems[]{"pageId":page._ref,"slug":page->slug.current}}`,
  );
  assert(
    menu?.menuItems?.some(
      (item) => item.pageId === pages.services.canonicalId && item.slug === pages.services.canonicalSlug,
    ),
    "FLZR navigation does not reference canonical Services.",
  );
  assert(
    menu?.menuItems?.some(
      (item) => item.pageId === pages.agency.canonicalId && item.slug === pages.agency.canonicalSlug,
    ),
    "FLZR navigation does not reference canonical Agency.",
  );

  return {
    activeHomepageId: activeHomepages[0]._id,
    canonicalPages: Object.values(pages).map((page) => ({
      id: page.canonicalId,
      slug: page.canonicalSlug,
    })),
    archivedPages: Object.values(pages).map((page) => ({
      id: page.archiveId,
      slug: page.archiveSlug,
    })),
    sitemapCanonicalPageIds: expectedSitemapIds,
  };
}

async function main() {
  const plan = await buildActivationPlan();
  const dryRun = await plan.transaction.commit({
    dryRun: true,
    returnDocuments: false,
    tag: "flzr.v2-activation.atomic-dry-run.2026-08-12",
  });

  if (!APPLY) {
    console.log("FLZR V2 activation dry-run passed. No CMS writes were made.");
    console.log(
      JSON.stringify(
        {
          projectId: env.projectId,
          dataset: env.dataset,
          documentPatches: plan.documentPatches,
          referenceRewrites: plan.referenceRewrites,
          homepageDraft: plan.homepageDraft,
          dryRunTransactionId: dryRun.transactionId,
        },
        null,
        2,
      ),
    );
    return;
  }

  const mutation = await plan.transaction.commit({
    visibility: "sync",
    returnDocuments: false,
    tag: "flzr.v2-activation.atomic.2026-08-12",
  });
  const verification = await verifyActivatedState();

  console.log("FLZR V2 pages activated atomically and verified successfully.");
  console.log(
    JSON.stringify(
      {
        projectId: env.projectId,
        dataset: env.dataset,
        backupPath,
        transactionId: mutation.transactionId,
        documentPatches: plan.documentPatches,
        referenceRewrites: plan.referenceRewrites.length,
        publishedHomepageDraftRevision: plan.homepageDraft.draftRevision,
        ...verification,
      },
      null,
      2,
    ),
  );
}

await main();
