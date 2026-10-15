import { createClient } from "@sanity/client";
import { writeFile } from "node:fs/promises";

const EXPECTED_PROJECT_ID = "wu6i3y0h";
const EXPECTED_DATASET = "dev-dataset";
const CHANNEL = "flizrWeb";
const APPLY = process.argv.includes("--apply");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-09-16";
const token =
  process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN;

if (projectId !== EXPECTED_PROJECT_ID || dataset !== EXPECTED_DATASET) {
  throw new Error(
    `Refusing to run outside ${EXPECTED_PROJECT_ID}/${EXPECTED_DATASET}. Received ${projectId}/${dataset}.`,
  );
}

if (!token) {
  throw new Error(
    "A Sanity write token is required in SANITY_API_WRITE_TOKEN or SANITY_AUTH_TOKEN.",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const menuDefinitions = [
  {
    id: "799578f3-a474-4979-b5d1-b05fa449392f",
    language: "en",
    labels: ["Home", "Projects", "Services", "Careers", "About Us"],
  },
  {
    id: "flzr-menu-navbar-de",
    language: "de",
    labels: ["Startseite", "Projekte", "Leistungen", "Karriere", "Über uns"],
  },
  {
    id: "flzr-menu-navbar-pl",
    language: "pl",
    labels: ["Strona główna", "Projekty", "Usługi", "Kariera", "O nas"],
  },
];

const routes = ["home", "cases", "services", "jobs", "about-us"];
const translationMetadataId = "flzr-tmeta-menu-navbar";

function menuItemsFor(definition) {
  return routes.map((route, index) => ({
    _key: `flzr-nav-${definition.language}-${route}`,
    _type: "object",
    displayName: definition.labels[index],
    route,
  }));
}

async function readCurrentState() {
  return client.fetch(
    `*[
      (_type == "menu" && channel == $channel && menuType == "Navbar") ||
      _id == $translationMetadataId
    ] | order(_id)`,
    { channel: CHANNEL, translationMetadataId },
  );
}

function buildTransaction(currentDocuments) {
  const documentsById = new Map(
    currentDocuments.map((document) => [document._id, document]),
  );
  let transaction = client.transaction();

  for (const definition of menuDefinitions) {
    const existing = documentsById.get(definition.id);
    const menuFields = {
      title: "Menu",
      menuType: "Navbar",
      channel: CHANNEL,
      language: definition.language,
      menuItems: menuItemsFor(definition),
    };

    if (existing) {
      transaction = transaction.patch(
        client.patch(definition.id).ifRevisionId(existing._rev).set(menuFields),
      );
    } else {
      transaction = transaction.createIfNotExists({
        _id: definition.id,
        _type: "menu",
        ...menuFields,
      });
    }
  }

  const metadata = documentsById.get(translationMetadataId);
  const metadataFields = {
    schemaTypes: ["menu"],
    translations: menuDefinitions.map((definition) => ({
      _key: `flzr-menu-${definition.language}`,
      _type: "internationalizedArrayReferenceValue",
      value: {
        _type: "reference",
        _ref: definition.id,
        _weak: true,
      },
    })),
  };

  if (metadata) {
    transaction = transaction.patch(
      client
        .patch(translationMetadataId)
        .ifRevisionId(metadata._rev)
        .set(metadataFields),
    );
  } else {
    transaction = transaction.createIfNotExists({
      _id: translationMetadataId,
      _type: "translation.metadata",
      ...metadataFields,
    });
  }

  return transaction;
}

function assertConfigured(menus) {
  for (const definition of menuDefinitions) {
    const menu = menus.find((candidate) => candidate.language === definition.language);
    if (!menu) throw new Error(`Missing ${definition.language} FLZR navbar menu.`);

    const actual = (menu.menuItems || []).map((item) => ({
      displayName: item.displayName,
      route: item.route,
    }));
    const expected = routes.map((route, index) => ({
      displayName: definition.labels[index],
      route,
    }));

    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Verification failed for ${definition.language} menu.`);
    }
  }
}

async function main() {
  const currentDocuments = await readCurrentState();
  const backupPath = `/private/tmp/flzr-navigation-backup-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.json`;
  await writeFile(
    backupPath,
    `${JSON.stringify(
      { projectId, dataset, createdAt: new Date().toISOString(), documents: currentDocuments },
      null,
      2,
    )}\n`,
    "utf8",
  );

  await buildTransaction(currentDocuments).commit({
    dryRun: true,
    returnDocuments: false,
    tag: "flzr.navigation.localized.dry-run.2026-08-23",
  });

  if (!APPLY) {
    console.log("FLZR navigation dry-run passed. No CMS writes were made.");
    console.log(`Backup: ${backupPath}`);
    return;
  }

  await buildTransaction(currentDocuments).commit({
    returnDocuments: false,
    tag: "flzr.navigation.localized.apply.2026-08-23",
  });

  const menus = await client.fetch(
    `*[_type == "menu" && channel == $channel && menuType == "Navbar"]{
      _id,
      language,
      menuItems[]{displayName,route}
    }`,
    { channel: CHANNEL },
  );
  assertConfigured(menus);

  console.log("Configured and verified FLZR navbar menus for en, de, and pl.");
  console.log(`Backup: ${backupPath}`);
}

await main();
