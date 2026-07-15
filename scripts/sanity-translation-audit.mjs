#!/usr/bin/env node

import { createClient } from "@sanity/client";
import {
  GLOBAL_CONTENT_SOURCE_LOCALE,
  GLOBAL_TRANSLATION_TYPES,
  getRequiredGlobalDocumentLocales,
  SITE_CONFIGS,
  SITE_SPECIFIC_TRANSLATION_TYPES,
  TRANSLATABLE_SCHEMA_TYPES,
  WEBSITE_CHANNELS,
} from "@1sp/site-config";

function parseArgs(argv) {
  const args = { limit: 30 };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--channel" || value === "-c") {
      args.channel = argv[index + 1];
      index += 1;
    } else if (value === "--type" || value === "-t") {
      args.type = argv[index + 1];
      index += 1;
    } else if (value === "--limit") {
      args.limit = Number.parseInt(argv[index + 1], 10);
      index += 1;
    } else if (value === "--json") {
      args.json = true;
    }
  }

  return args;
}

function normalizeDocumentId(id) {
  return id.replace(/^drafts\./, "");
}

function normalizeChannels(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function displayName(document) {
  return (
    document.title ||
    document.name ||
    document.slug ||
    normalizeDocumentId(document._id)
  );
}

function printSection(title, values) {
  console.log(`\n${title}`);
  for (const [key, value] of Object.entries(values)) {
    console.log(`  ${key}: ${value}`);
  }
}

function printList(title, items, limit) {
  console.log(`\n${title}`);

  if (items.length === 0) {
    console.log("  none");
    return;
  }

  for (const item of items.slice(0, limit)) {
    console.log(`  - ${item}`);
  }

  if (items.length > limit) {
    console.log(`  ... ${items.length - limit} more (use --limit to show more)`);
  }
}

const args = parseArgs(process.argv.slice(2));
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-09-16";

if (!projectId || !dataset) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET.",
  );
  process.exit(1);
}

if (args.channel && !WEBSITE_CHANNELS.includes(args.channel)) {
  console.error(
    `Unknown channel '${args.channel}'. Expected one of: ${WEBSITE_CHANNELS.join(", ")}.`,
  );
  process.exit(1);
}

if (args.type && !TRANSLATABLE_SCHEMA_TYPES.includes(args.type)) {
  console.error(
    `Unknown translatable type '${args.type}'. Expected one of: ${TRANSLATABLE_SCHEMA_TYPES.join(", ")}.`,
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

const query = `{
  "documents": *[_type in $schemaTypes]{
    _id,
    _type,
    _rev,
    language,
    channel,
    title,
    name,
    "slug": slug.current
  },
  "families": *[_type == "translation.metadata"]{
    _id,
    "references": translations[].value._ref
  }
}`;

let data;
try {
  data = await client.fetch(
    query,
    { schemaTypes: [...TRANSLATABLE_SCHEMA_TYPES] },
    { perspective: "raw" },
  );
} catch (error) {
  console.error(`Translation audit query failed: ${error.message}`);
  process.exit(1);
}

const versionsById = new Map();
for (const document of data.documents) {
  const baseId = normalizeDocumentId(document._id);
  const versions = versionsById.get(baseId) || {};

  if (document._id.startsWith("drafts.")) {
    versions.draft = document;
  } else {
    versions.published = document;
  }

  versionsById.set(baseId, versions);
}

const familyByDocumentId = new Map();
const emptyFamilies = [];
const danglingReferences = [];

for (const family of data.families) {
  const references = (family.references || []).filter(Boolean);

  if (references.length === 0) {
    emptyFamilies.push(family._id);
  }

  for (const reference of references) {
    const baseId = normalizeDocumentId(reference);
    familyByDocumentId.set(baseId, family);

    if (!versionsById.has(baseId)) {
      danglingReferences.push(`${family._id} → ${reference}`);
    }
  }
}

function getFamilyLanguages(family) {
  const languages = new Set();

  for (const reference of family?.references || []) {
    const versions = versionsById.get(normalizeDocumentId(reference));
    const document = versions?.draft || versions?.published;
    if (document?.language) languages.add(document.language);
  }

  return languages;
}

const sourceDocuments = [];
const invalidSourceDocuments = [];

for (const versions of versionsById.values()) {
  const document = versions.published;
  if (!document) continue;
  if (args.type && document._type !== args.type) continue;

  if (SITE_SPECIFIC_TRANSLATION_TYPES.includes(document._type)) {
    const channels = normalizeChannels(document.channel);

    if (channels.length !== 1 || !WEBSITE_CHANNELS.includes(channels[0])) {
      invalidSourceDocuments.push(
        `${document._type} ${displayName(document)} has invalid channel '${String(document.channel)}'`,
      );
      continue;
    }

    const channel = channels[0];
    if (args.channel && channel !== args.channel) continue;
    const policy = SITE_CONFIGS[channel];

    if (document.language === policy.defaultLocale) {
      sourceDocuments.push({
        document,
        scope: channel,
        sourceLocale: policy.defaultLocale,
        targetLocales: policy.locales.filter(
          (locale) => locale !== policy.defaultLocale,
        ),
      });
    }
    continue;
  }

  if (GLOBAL_TRANSLATION_TYPES.includes(document._type)) {
    const channels = normalizeChannels(document.channel);
    const invalidChannels = channels.filter(
      (channel) => !WEBSITE_CHANNELS.includes(channel),
    );

    if (invalidChannels.length > 0) {
      invalidSourceDocuments.push(
        `${document._type} ${displayName(document)} has invalid channel assignment '${invalidChannels.join(", ")}'`,
      );
      continue;
    }

    if (
      args.channel &&
      channels.length > 0 &&
      !channels.includes(args.channel)
    ) {
      continue;
    }

    if (document.language === GLOBAL_CONTENT_SOURCE_LOCALE) {
      const requiredLocales = args.channel
        ? SITE_CONFIGS[args.channel].locales
        : getRequiredGlobalDocumentLocales(channels);

      sourceDocuments.push({
        document,
        scope: "global",
        sourceLocale: GLOBAL_CONTENT_SOURCE_LOCALE,
        targetLocales: requiredLocales.filter(
          (locale) => locale !== GLOBAL_CONTENT_SOURCE_LOCALE,
        ),
      });
    }
  }
}

const unlinkedSources = [];
const missingTranslations = [];
const coverageByScope = new Map();

for (const source of sourceDocuments) {
  const baseId = normalizeDocumentId(source.document._id);
  const family = familyByDocumentId.get(baseId);
  const familyLanguages = getFamilyLanguages(family);
  const scopeKey = `${source.scope}/${source.document._type}`;
  const coverage = coverageByScope.get(scopeKey) || {
    sources: 0,
    unlinked: 0,
    missing: 0,
  };

  coverage.sources += 1;

  if (!family && source.targetLocales.length > 0) {
    coverage.unlinked += 1;
    unlinkedSources.push(
      `${scopeKey}: ${displayName(source.document)} (${baseId})`,
    );
  }

  for (const targetLocale of source.targetLocales) {
    if (!familyLanguages.has(targetLocale)) {
      coverage.missing += 1;
      missingTranslations.push(
        `${scopeKey}: ${displayName(source.document)} ${source.sourceLocale} → ${targetLocale}${family ? "" : " (source family is not linked)"}`,
      );
    }
  }

  coverageByScope.set(scopeKey, coverage);
}

const coverage = Object.fromEntries(
  [...coverageByScope.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([scope, value]) => [
      scope,
      `${value.sources} sources, ${value.unlinked} unlinked, ${value.missing} missing targets`,
    ]),
);

const summary = {
  projectId,
  dataset,
  schemaTypes: TRANSLATABLE_SCHEMA_TYPES.length,
  translationFamilies: data.families.length,
  emptyFamilies: emptyFamilies.length,
  danglingReferences: danglingReferences.length,
  sourceDocuments: sourceDocuments.length,
  unlinkedSources: unlinkedSources.length,
  missingTranslations: missingTranslations.length,
};

if (args.json) {
  console.log(
    JSON.stringify(
      {
        summary,
        coverage,
        emptyFamilies,
        danglingReferences,
        invalidSourceDocuments,
        unlinkedSources,
        missingTranslations,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

printSection("Sanity translation readiness", summary);
printSection("Coverage by policy scope", coverage);
printList("Empty translation families", emptyFamilies, args.limit);
printList("Dangling translation references", danglingReferences, args.limit);
printList("Invalid source documents", invalidSourceDocuments, args.limit);
printList("Unlinked source documents", unlinkedSources, args.limit);
printList("Missing target translations", missingTranslations, args.limit);

console.log("\nAutomation gate");
if (
  emptyFamilies.length > 0 ||
  danglingReferences.length > 0 ||
  invalidSourceDocuments.length > 0 ||
  unlinkedSources.length > 0
) {
  console.log(
    "  BLOCKED: repair translation families before enabling automatic Agent Actions writes.",
  );
} else {
  console.log(
    "  READY FOR PILOT: metadata is structurally clean; test one reviewed dev-dataset translation next.",
  );
}
