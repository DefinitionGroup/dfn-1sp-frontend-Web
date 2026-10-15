#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { getCliClient } from "sanity/cli";

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
const HOMEPAGE_ID = "page-renaissance-home-en";
const CAROUSEL_KEY = "renaissance-client-logos";
const TARGET_SPEED = "fast";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function verifyBackup(path) {
  assert(path, "--apply requires --backup=/absolute/or/repo-relative/path.tar.gz");
  const absolutePath = resolve(path);
  assert(existsSync(absolutePath), `Renaissance backup does not exist: ${absolutePath}`);
  execFileSync("gzip", ["-t", absolutePath], { stdio: "pipe" });
  const entries = execFileSync("tar", ["-tzf", absolutePath], { encoding: "utf8" });
  assert(
    entries.split("\n").some((entry) => entry.endsWith("/data.ndjson")),
    "Renaissance backup has no data.ndjson entry.",
  );
  return absolutePath;
}

const env = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
};

assert(
  env.projectId === EXPECTED_PROJECT_ID && env.dataset === EXPECTED_DATASET,
  `Refusing to run outside ${EXPECTED_PROJECT_ID}/${EXPECTED_DATASET}. Resolved ${env.projectId || "(missing)"}/${env.dataset || "(missing)"}.`,
);
assert(env.apiVersion, "NEXT_PUBLIC_SANITY_API_VERSION is required.");

const backupPath = APPLY ? verifyBackup(backupArgument?.slice("--backup=".length)) : null;
const client = getCliClient({ apiVersion: env.apiVersion }).withConfig({
  projectId: env.projectId,
  dataset: env.dataset,
  useCdn: false,
  perspective: "raw",
});
assert(
  client.config().token,
  "No authenticated Sanity CLI token is available. Run with --with-user-token.",
);

async function readHomepage() {
  const documents = await client.fetch(`*[_id in $ids]`, {
    ids: [HOMEPAGE_ID, `drafts.${HOMEPAGE_ID}`],
  });
  const draft = documents.find((document) => document._id.startsWith("drafts."));
  const homepage = documents.find((document) => document._id === HOMEPAGE_ID);

  assert(!draft, `Refusing to overwrite active draft ${draft?._id}.`);
  assert(homepage, `Homepage ${HOMEPAGE_ID} was not found.`);
  assert(homepage.channel === "renaissanceWeb", "Target homepage is not assigned to renaissanceWeb.");
  assert(homepage.language === "en", "Target homepage is not English.");
  assert(homepage.isHomepage === true, "Target document is no longer the active homepage.");
  return homepage;
}

async function buildPlan() {
  const homepage = await readHomepage();
  const content = Array.isArray(homepage.content) ? homepage.content : [];
  const carouselIndex = content.findIndex((block) => block?._key === CAROUSEL_KEY);
  assert(carouselIndex >= 0, `Missing ${CAROUSEL_KEY}.`);

  const carousel = content[carouselIndex];
  assert(carousel._type === "clientLogoCarousel", "Client logo carousel type changed.");
  assert(carousel.selectionMode === "manual", "Client logo carousel selection mode changed.");
  assert(Array.isArray(carousel.selectedClients), "Client logo carousel clients are missing.");
  assert(carousel.selectedClients.length >= 5, "Client logo carousel has fewer than five clients.");

  if (carousel.speed === TARGET_SPEED) {
    return { alreadyUpdated: true, homepageRevision: homepage._rev };
  }

  assert(
    carousel.speed === "slow" || carousel.speed === "normal" || carousel.speed == null,
    `Unexpected current carousel speed: ${carousel.speed}`,
  );

  const nextContent = [...content];
  nextContent[carouselIndex] = { ...carousel, speed: TARGET_SPEED };
  const transaction = client.transaction().patch(HOMEPAGE_ID, (patch) =>
    patch.ifRevisionId(homepage._rev).set({ content: nextContent }),
  );

  return {
    alreadyUpdated: false,
    homepageRevision: homepage._rev,
    previousSpeed: carousel.speed ?? "normal",
    transaction,
  };
}

async function verifyState() {
  const homepage = await readHomepage();
  const carousel = homepage.content?.find((block) => block?._key === CAROUSEL_KEY);
  assert(carousel?._type === "clientLogoCarousel", "Client logo carousel is missing after update.");
  assert(carousel.speed === TARGET_SPEED, "Client logo carousel speed was not set to fast.");
  return {
    homepageId: homepage._id,
    homepageRevision: homepage._rev,
    carouselKey: carousel._key,
    speed: carousel.speed,
  };
}

async function main() {
  const plan = await buildPlan();
  if (plan.alreadyUpdated) {
    console.log("Renaissance client logo carousel is already configured and verified.");
    console.log(JSON.stringify(await verifyState(), null, 2));
    return;
  }

  const dryRun = await plan.transaction.commit({
    dryRun: true,
    returnDocuments: false,
    tag: "renaissance.client-logo-carousel.atomic-dry-run.2026-09-08",
  });

  if (!APPLY) {
    console.log("Renaissance client logo carousel dry-run passed. No CMS writes were made.");
    console.log(
      JSON.stringify(
        {
          projectId: env.projectId,
          dataset: env.dataset,
          homepageId: HOMEPAGE_ID,
          homepageRevision: plan.homepageRevision,
          previousSpeed: plan.previousSpeed,
          targetSpeed: TARGET_SPEED,
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
    tag: "renaissance.client-logo-carousel.atomic.2026-09-08",
  });
  const verification = await verifyState();

  console.log("Renaissance client logo carousel published and verified successfully.");
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
