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
const HOMEPAGE_ID = "page-flizr-home-v3-preview-en";
const CAREERS_CONTENT_KEY = "home-v3-careers-content";
const CAREERS_CTA_KEY = "home-v3-careers-cta";
const REPLACEMENT_KEY = "home-v3-careers-two-thirds";
const EXPECTED_ROLE_COPY =
  "Field promoter. Brand merchandiser. Sales trainer. Omnichannel manager. Live video consultant.";
const ROLE_COPY =
  "Field promoter. Brand merchandiser. Sales trainer.\nOmnichannel manager. Live video consultant.";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function verifyBackup(path) {
  assert(path, "--apply requires --backup=/absolute/or/repo-relative/path.tar.gz");
  const absolutePath = resolve(path);
  assert(existsSync(absolutePath), `Careers backup does not exist: ${absolutePath}`);
  execFileSync("gzip", ["-t", absolutePath], { stdio: "pipe" });
  const entries = execFileSync("tar", ["-tzf", absolutePath], { encoding: "utf8" });
  assert(
    entries.split("\n").some((entry) => entry.endsWith("/data.ndjson")),
    "Careers backup has no data.ndjson entry.",
  );
  return absolutePath;
}

function blockText(block) {
  return (block?.children || []).map((child) => child?.text || "").join("");
}

function bodyBlocksFrom(block) {
  const paragraphs = blockText(block)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  assert(paragraphs.length > 0, "The existing Careers body copy is empty.");

  return paragraphs.map((text, index) => ({
    _key: `home-v3-careers-copy-${index + 1}`,
    _type: "block",
    children: [
      {
        _key: `home-v3-careers-copy-${index + 1}-span`,
        _type: "span",
        marks: [],
        text,
      },
    ],
    markDefs: [],
    style: "normal",
  }));
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

async function buildPlan() {
  const documents = await client.fetch(`*[_id in $ids]`, {
    ids: [HOMEPAGE_ID, `drafts.${HOMEPAGE_ID}`],
  });
  const draft = documents.find((document) => document._id.startsWith("drafts."));
  const homepage = documents.find((document) => document._id === HOMEPAGE_ID);

  assert(!draft, `Refusing to overwrite active draft ${draft?._id}.`);
  assert(homepage, `Homepage ${HOMEPAGE_ID} was not found.`);
  assert(homepage.channel === "flizrWeb", "Target homepage is not assigned to flizrWeb.");
  assert(homepage.language === "en", "Target homepage is not English.");
  assert(homepage.isHomepage === true, "Target document is no longer the active homepage.");

  const content = Array.isArray(homepage.content) ? homepage.content : [];
  const careersIndex = content.findIndex((block) => block?._key === CAREERS_CONTENT_KEY);
  const ctaIndex = content.findIndex((block) => block?._key === CAREERS_CTA_KEY);

  assert(careersIndex >= 0, `Missing ${CAREERS_CONTENT_KEY}.`);
  assert(ctaIndex === careersIndex + 1, "The Careers CTA is no longer directly after Careers content.");

  const careers = content[careersIndex];
  const ctaBlock = content[ctaIndex];
  assert(careers._type === "twoColContentSection", "Careers content type changed unexpectedly.");
  assert(ctaBlock._type === "sublineComponent", "Careers CTA type changed unexpectedly.");
  assert(blockText(careers.content?.[0]) === EXPECTED_ROLE_COPY, "Careers role copy changed unexpectedly.");

  const cta = (ctaBlock.additionalContent || []).find((item) => item?._type === "cta");
  assert(cta, "Careers CTA is missing.");
  assert(careers.video || careers.image, "Careers media is missing.");

  const replacement = {
    _key: REPLACEMENT_KEY,
    _type: "flzrTwoThirdsContentSection",
    headline: careers.title,
    subheadline: ROLE_COPY,
    body: bodyBlocksFrom(careers.content?.[1]),
    image: careers.image || careers.video,
    imageAlt: careers.mediaAlt,
    cta,
    navPointName: careers.navPointName || "Careers",
    hideFromNav: careers.hideFromNav === true,
  };
  const nextContent = [
    ...content.slice(0, careersIndex),
    replacement,
    ...content.slice(ctaIndex + 1),
  ];
  const transaction = client.transaction().patch(HOMEPAGE_ID, (patch) =>
    patch.ifRevisionId(homepage._rev).set({ content: nextContent }),
  );

  return {
    homepageRevision: homepage._rev,
    previousTypes: [careers._type, ctaBlock._type],
    replacement,
    transaction,
  };
}

async function verifyState() {
  const homepage = await client.fetch(
    `*[_id == $id][0]{_id,_rev,channel,language,isHomepage,content}`,
    { id: HOMEPAGE_ID },
  );
  const content = homepage?.content || [];
  const replacement = content.find((block) => block?._key === REPLACEMENT_KEY);

  assert(replacement?._type === "flzrTwoThirdsContentSection", "Replacement block was not published.");
  assert(!content.some((block) => block?._key === CAREERS_CONTENT_KEY), "Old Careers content remains.");
  assert(!content.some((block) => block?._key === CAREERS_CTA_KEY), "Old Careers CTA remains.");
  assert(replacement.subheadline === ROLE_COPY, "Replacement subheadline does not match.");
  assert(replacement.body?.length === 2, "Replacement body was not split into two paragraphs.");
  assert(replacement.image?.secure_url, "Replacement image source is missing.");
  assert(
    replacement.cta?.link?.externalUrl === "https://1sp-agency.jobs.personio.de/",
    "Replacement CTA destination changed.",
  );

  return {
    homepageId: homepage._id,
    homepageRevision: homepage._rev,
    careersBlockKey: replacement._key,
    careersBlockType: replacement._type,
    contentBlockCount: content.length,
  };
}

async function main() {
  const plan = await buildPlan();
  const dryRun = await plan.transaction.commit({
    dryRun: true,
    returnDocuments: false,
    tag: "flzr.home-careers-two-thirds.atomic-dry-run.2026-08-19",
  });

  if (!APPLY) {
    console.log("FLZR Careers 2/3 section dry-run passed. No CMS writes were made.");
    console.log(
      JSON.stringify(
        {
          projectId: env.projectId,
          dataset: env.dataset,
          homepageId: HOMEPAGE_ID,
          homepageRevision: plan.homepageRevision,
          previousTypes: plan.previousTypes,
          replacementType: plan.replacement._type,
          replacementKey: plan.replacement._key,
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
    tag: "flzr.home-careers-two-thirds.atomic.2026-08-19",
  });
  const verification = await verifyState();

  console.log("FLZR Careers 2/3 section published and verified successfully.");
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
