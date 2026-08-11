#!/usr/bin/env node

import { createClient } from "@sanity/client";

const KNOWN_CHANNELS = ["1spWeb", "flizrWeb", "msmWeb", "studioco2Web", "renaissanceWeb"];
const DEFAULT_CHANNEL = "1spWeb";
const DEFAULT_LANGUAGE = "en";

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--channel" || value === "-c") {
      args.channel = argv[index + 1];
      index += 1;
    } else if (value === "--language" || value === "--lang" || value === "-l") {
      args.language = argv[index + 1];
      index += 1;
    }
  }

  return args;
}

function compactEnvValue(value, fallback = "(unset)") {
  if (!value) return fallback;
  return value;
}

function normalizeChannelValues(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function countBy(rows, getKeys) {
  const counts = new Map();

  for (const row of rows) {
    const keys = getKeys(row);
    for (const key of keys) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function printObject(title, object) {
  console.log(`\n${title}`);
  for (const [key, value] of Object.entries(object)) {
    console.log(`  ${key}: ${value}`);
  }
}

function printWarning(message) {
  console.log(`  WARNING: ${message}`);
}

const args = parseArgs(process.argv.slice(2));
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-09-16";
const envChannel = process.env.NEXT_PUBLIC_CHANNEL;
const channel = args.channel || envChannel || DEFAULT_CHANNEL;
const language = args.language || DEFAULT_LANGUAGE;

printObject("Sanity doctor", {
  projectId: compactEnvValue(projectId),
  dataset: compactEnvValue(dataset),
  apiVersion: compactEnvValue(apiVersion),
  envChannel: compactEnvValue(envChannel, `(unset, defaults to ${DEFAULT_CHANNEL})`),
  checkedChannel: channel,
  checkedLanguage: language,
});

if (!projectId || !dataset) {
  console.error("\nMissing required Sanity env. Check .env and .env.local before debugging code.");
  process.exit(1);
}

if (!KNOWN_CHANNELS.includes(channel)) {
  printWarning(`Checked channel '${channel}' is not one of ${KNOWN_CHANNELS.join(", ")}.`);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

const query = `{
  "counts": {
    "pagesTotal": count(*[_type == "page"]),
    "pagesForChannelLanguage": count(*[_type == "page" && channel == $channel && language == $language]),
    "homepagesForChannelLanguage": count(*[_type == "page" && channel == $channel && language == $language && isHomepage == true]),
    "menusForChannelLanguage": count(*[_type == "menu" && channel == $channel && language == $language]),
    "caseStudiesTotal": count(*[_type == "caseStudy"]),
    "casesForChannelLanguage": count(*[_type == "caseStudy" && ($channel in channel || channel == $channel) && language == $language]),
    "publishedCasesForChannelLanguage": count(*[_type == "caseStudy" && ($channel in channel || channel == $channel) && language == $language && isPublished == true]),
    "servicesForChannelLanguage": count(*[_type == "services" && ($channel in channel || channel == $channel) && language == $language]),
    "peopleForChannelLanguage": count(*[_type == "person" && ($channel in channel || channel == $channel) && language == $language]),
    "clientsForChannelLanguage": count(*[_type == "client" && ($channel in channel || channel == $channel) && language == $language]),
    "unitsForChannelLanguage": count(*[_type == "unit" && ($channel in channel || channel == $channel) && language == $language])
  },
  "caseChannels": *[_type == "caseStudy" && defined(channel)]{channel},
  "pageScopes": *[_type == "page" && defined(channel) && defined(language)]{channel, language, isHomepage},
  "menuScopes": *[_type == "menu" && defined(channel) && defined(language)]{channel, language}
}`;

let result;
try {
  result = await client.fetch(query, { channel, language });
} catch (error) {
  console.error("\nSanity query failed before code was inspected.");
  console.error(`Reason: ${error.message}`);
  console.error("Check network access, project ID, dataset, and API version.");
  process.exit(1);
}

printObject("Counts for checked channel/language", result.counts);

const caseChannelCounts = countBy(result.caseChannels, (row) => normalizeChannelValues(row.channel));
const pageScopeCounts = countBy(result.pageScopes, (row) => [`${row.channel}:${row.language}`]);
const homepageScopeCounts = countBy(
  result.pageScopes.filter((row) => row.isHomepage === true),
  (row) => [`${row.channel}:${row.language}`],
);
const menuScopeCounts = countBy(result.menuScopes, (row) => [`${row.channel}:${row.language}`]);

printObject("Case channel distribution", caseChannelCounts);
printObject("Page channel/language distribution", pageScopeCounts);
printObject("Homepage channel/language distribution", homepageScopeCounts);
printObject("Menu channel/language distribution", menuScopeCounts);

console.log("\nDiagnosis hints");
if (result.counts.pagesForChannelLanguage === 0) {
  printWarning(`No pages found for ${channel}/${language}. Wrong dataset/channel/language is more likely than a route bug.`);
}
if (result.counts.homepagesForChannelLanguage === 0) {
  printWarning(`No homepage found for ${channel}/${language}. Verify dataset before editing page routes.`);
}
if (result.counts.publishedCasesForChannelLanguage === 0) {
  printWarning(`No published cases found for ${channel}/${language}. Empty assigned case lists may be data/env, not schema code.`);
}
if (result.counts.pagesForChannelLanguage > 0 && result.counts.homepagesForChannelLanguage > 0) {
  console.log("  OK: Dataset has pages and a homepage for the checked scope.");
}
