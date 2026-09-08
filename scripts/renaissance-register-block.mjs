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
const SECTION_KEY = "renaissance-join-section";
const INTRO_KEY = "renaissance-join-intro";
const SUBLINE_KEY = "renaissance-join-subline";
const REPLACEMENT_KEY = "renaissance-register";
const RESET_KEY = "renaissance-sections-end";
const EXPECTED_HEADLINE = "Register with us";
const EXPECTED_DESCRIPTION =
  "If you are a content creator/journalist or influencer register with us now to get all the latest news from our clients!";
const EXPECTED_CARDS = [
  { key: "join-content-creators", text: "Content creators", href: "/contact" },
  { key: "join-media", text: "Media", href: "/contact" },
];

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

function assertCard(card, expected, label) {
  assert(card?._type === "cta", `${label} is no longer a CTA.`);
  assert(card?._key === expected.key, `${label} key changed unexpectedly.`);
  assert(card?.text === expected.text, `${label} label changed unexpectedly.`);
  assert(card?.link?.linkType === "external", `${label} link type changed unexpectedly.`);
  assert(card?.link?.externalUrl === expected.href, `${label} destination changed unexpectedly.`);
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

function verifyReplacement(block) {
  assert(block?._type === "registerBlock", "Replacement block type is not registerBlock.");
  assert(block?.headline === EXPECTED_HEADLINE, "Replacement headline does not match.");
  assert(block?.description === EXPECTED_DESCRIPTION, "Replacement description does not match.");
  assert(block?.hideFromNav === true, "Replacement navigation visibility changed.");
  assert(block?.cards?.length === 2, "Replacement does not contain exactly two cards.");
  EXPECTED_CARDS.forEach((expected, index) =>
    assertCard(block.cards[index], expected, `Registration card ${index + 1}`),
  );
}

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
  const replacementIndex = content.findIndex((block) => block?._key === REPLACEMENT_KEY);

  if (replacementIndex >= 0) {
    verifyReplacement(content[replacementIndex]);
    assert(!content.some((block) => block?._key === INTRO_KEY), "Old Join Us intro remains.");
    assert(!content.some((block) => block?._key === SUBLINE_KEY), "Old Join Us subline remains.");
    return { alreadyMigrated: true, homepageRevision: homepage._rev };
  }

  const sectionIndex = content.findIndex((block) => block?._key === SECTION_KEY);
  const introIndex = content.findIndex((block) => block?._key === INTRO_KEY);
  const sublineIndex = content.findIndex((block) => block?._key === SUBLINE_KEY);
  const resetIndex = content.findIndex((block) => block?._key === RESET_KEY);

  assert(sectionIndex >= 0, `Missing ${SECTION_KEY}.`);
  assert(introIndex === sectionIndex + 1, "Join Us intro is no longer directly after its section marker.");
  assert(sublineIndex === introIndex + 1, "Join Us subline is no longer directly after its intro.");
  assert(resetIndex === sublineIndex + 1, "Section reset is no longer directly after Join Us.");

  const section = content[sectionIndex];
  const intro = content[introIndex];
  const subline = content[sublineIndex];
  assert(section._type === "renaissanceSectionBand", "Join Us section marker type changed.");
  assert(section.sectionRole === "joinUs", "Join Us section marker role changed.");
  assert(intro._type === "introBlockTypoSophisticated", "Join Us intro type changed.");
  assert(subline._type === "sublineComponent", "Join Us subline type changed.");
  assert(intro.header?.mainHeadline === EXPECTED_HEADLINE, "Join Us headline changed unexpectedly.");
  assert(subline.description === EXPECTED_DESCRIPTION, "Join Us description changed unexpectedly.");
  assert(subline.additionalContent?.length === 2, "Join Us no longer contains exactly two CTAs.");
  EXPECTED_CARDS.forEach((expected, index) =>
    assertCard(subline.additionalContent[index], expected, `Existing CTA ${index + 1}`),
  );

  const replacement = {
    _key: REPLACEMENT_KEY,
    _type: "registerBlock",
    headline: intro.header.mainHeadline,
    description: subline.description,
    cards: subline.additionalContent,
    navPointName: intro.navPointName || "Join Us",
    hideFromNav: true,
  };
  verifyReplacement(replacement);

  const nextSection = { ...section, desktopTopMargin: "none" };
  const nextContent = [
    ...content.slice(0, sectionIndex),
    nextSection,
    replacement,
    ...content.slice(sublineIndex + 1),
  ];
  const transaction = client.transaction().patch(HOMEPAGE_ID, (patch) =>
    patch.ifRevisionId(homepage._rev).set({ content: nextContent }),
  );

  return {
    alreadyMigrated: false,
    homepageRevision: homepage._rev,
    previousTypes: [intro._type, subline._type],
    replacement,
    transaction,
  };
}

async function verifyState() {
  const homepage = await readHomepage();
  const content = Array.isArray(homepage.content) ? homepage.content : [];
  const section = content.find((block) => block?._key === SECTION_KEY);
  const replacement = content.find((block) => block?._key === REPLACEMENT_KEY);

  assert(section?.desktopTopMargin === "none", "Join Us desktop margin was not set to none.");
  verifyReplacement(replacement);
  assert(!content.some((block) => block?._key === INTRO_KEY), "Old Join Us intro remains.");
  assert(!content.some((block) => block?._key === SUBLINE_KEY), "Old Join Us subline remains.");

  return {
    homepageId: homepage._id,
    homepageRevision: homepage._rev,
    registerBlockKey: replacement._key,
    registerBlockType: replacement._type,
    cardLabels: replacement.cards.map((card) => card.text),
    contentBlockCount: content.length,
  };
}

async function main() {
  const plan = await buildPlan();

  if (plan.alreadyMigrated) {
    console.log("Renaissance Register block is already published and verified.");
    console.log(JSON.stringify(await verifyState(), null, 2));
    return;
  }

  const dryRun = await plan.transaction.commit({
    dryRun: true,
    returnDocuments: false,
    tag: "renaissance.register-block.atomic-dry-run.2026-09-08",
  });

  if (!APPLY) {
    console.log("Renaissance Register block dry-run passed. No CMS writes were made.");
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
          cardLabels: plan.replacement.cards.map((card) => card.text),
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
    tag: "renaissance.register-block.atomic.2026-09-08",
  });
  const verification = await verifyState();

  console.log("Renaissance Register block published and verified successfully.");
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
