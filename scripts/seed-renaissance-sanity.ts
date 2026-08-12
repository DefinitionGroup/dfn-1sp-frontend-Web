#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { getCliClient } from "sanity/cli";
import { RENAISSANCE_HOMEPAGE_FALLBACK } from "../apps/renaissance-web/data/homepageFallback";

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
const CHANNEL = "renaissanceWeb";
const LANGUAGE = "en";
const HOMEPAGE_ID = "page-renaissance-home-en";
const FOOTER_ID = "menu-renaissance-footer-en";
const UNIT_ID = "cc6775b3-7157-48d1-be0f-a5843c3ba89c";
const UBISOFT_ID = "f7404793-fab8-4293-a6aa-8d05434963fe";

const CLIENTS = [
  {
    id: UBISOFT_ID,
    name: "Ubisoft",
    slug: "ubisoft",
    existing: true,
  },
  {
    id: "client-renaissance-xbox-en",
    name: "Xbox",
    slug: "xbox",
    existing: false,
    logoPath: "apps/renaissance-web/public/logos/Xbox_2020_horz_Black.svg",
    publicId: "renaissance_homepage_xbox_logo_2026",
  },
  {
    id: "client-renaissance-epic-games-en",
    name: "Epic Games",
    slug: "epic-games",
    existing: false,
    logoPath: "apps/renaissance-web/public/logos/Epic_Games_logo.svg",
    publicId: "renaissance_homepage_epic_games_logo_2026",
  },
  {
    id: "client-renaissance-warner-bros-en",
    name: "Warner Bros.",
    slug: "warner-bros",
    existing: false,
    logoPath: "apps/renaissance-web/public/logos/Logo_Warner_Bros.svg",
    publicId: "renaissance_homepage_warner_bros_logo_2026",
  },
  {
    id: "client-renaissance-riot-games-en",
    name: "Riot Games",
    slug: "riot-games",
    existing: false,
    logoPath: "apps/renaissance-web/public/logos/Riot_Games_logo.svg",
    publicId: "renaissance_homepage_riot_games_logo_2026",
  },
] as const;

const MEDIA = [
  {
    key: "romeo",
    path: "apps/renaissance-web/public/renaissance/romeo-is-a-dead-man.jpg",
    publicId: "renaissance_homepage_romeo_is_a_dead_man_2026",
    displayName: "Renaissance Homepage - Romeo Is A Dead Man",
  },
  {
    key: "yooka",
    path: "apps/renaissance-web/public/renaissance/yooka-re-playlee.png",
    publicId: "renaissance_homepage_yooka_replaylee_2026",
    displayName: "Renaissance Homepage - Yooka-Re-Playlee",
  },
  {
    key: "stefano",
    path: "apps/renaissance-web/public/renaissance/stefano-petrullo.jpg",
    publicId: "renaissance_homepage_stefano_petrullo_2026",
    displayName: "Renaissance Homepage - Stefano Petrullo",
  },
] as const;

type CloudinaryResource = Record<string, unknown> & {
  public_id: string;
  secure_url: string;
};

type SanityDocument = Record<string, unknown> & {
  _id: string;
  _type: string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function verifyBackup(path?: string) {
  assert(path, "--apply requires --backup=/absolute/or/repo-relative/path.tar.gz");
  const absolutePath = resolve(path);
  assert(existsSync(absolutePath), `Backup does not exist: ${absolutePath}`);
  execFileSync("gzip", ["-t", absolutePath], { stdio: "pipe" });
  const entries = execFileSync("tar", ["-tzf", absolutePath], { encoding: "utf8" });
  assert(
    entries.split("\n").some((entry) => entry.endsWith("/data.ndjson")),
    "Backup archive has no data.ndjson entry.",
  );
  return absolutePath;
}

function cloneAsset(asset: Record<string, unknown>, key: string) {
  return { ...structuredClone(asset), _type: "cloudinary.asset", _key: key };
}

function cloudinaryAsset(resource: CloudinaryResource, key: string) {
  const allowedFields = [
    "access_mode",
    "asset_folder",
    "asset_id",
    "bytes",
    "created_at",
    "display_name",
    "format",
    "height",
    "metadata",
    "original_filename",
    "public_id",
    "resource_type",
    "secure_url",
    "tags",
    "type",
    "url",
    "version",
    "width",
  ];
  const result: Record<string, unknown> = {
    _key: key,
    _type: "cloudinary.asset",
    _version: 1,
  };
  for (const field of allowedFields) {
    if (resource[field] !== undefined) result[field] = resource[field];
  }
  if (resource.asset_id) result.id = resource.asset_id;
  return result;
}

function mimeType(path: string) {
  const extension = extname(path).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".svg") return "image/svg+xml";
  return "image/jpeg";
}

async function getCloudinaryResource(publicId: string): Promise<CloudinaryResource | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  assert(cloudName && apiKey && apiSecret, "Cloudinary credentials are required.");
  const url = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`);
  url.searchParams.append("public_ids[]", publicId);
  const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const response = await fetch(url, {
    headers: { Authorization: `Basic ${authorization}` },
  });
  assert(response.ok, `Cloudinary lookup failed (${response.status}) for ${publicId}.`);
  const body = (await response.json()) as { resources?: CloudinaryResource[] };
  return body.resources?.[0] ?? null;
}

async function uploadCloudinary(
  path: string,
  publicId: string,
  displayName: string,
): Promise<CloudinaryResource> {
  const existing = await getCloudinaryResource(publicId);
  if (existing) return existing;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  assert(cloudName && apiKey && apiSecret, "Cloudinary credentials are required.");

  const absolutePath = resolve(path);
  assert(existsSync(absolutePath), `Upload source is missing: ${absolutePath}`);
  const timestamp = Math.floor(Date.now() / 1000);
  const parameters: Record<string, string> = {
    asset_folder: "1sp/Logos/RENAISSANCE/Homepage",
    display_name: displayName,
    overwrite: "false",
    public_id: publicId,
    timestamp: String(timestamp),
    unique_filename: "false",
  };
  const signaturePayload = Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const signature = createHash("sha1")
    .update(`${signaturePayload}${apiSecret}`)
    .digest("hex");
  const bytes = await readFile(absolutePath);
  const form = new FormData();
  form.append(
    "file",
    new Blob([Uint8Array.from(bytes)], { type: mimeType(path) }),
    basename(path),
  );
  for (const [key, value] of Object.entries(parameters)) form.append(key, value);
  form.append("api_key", apiKey);
  form.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const body = (await response.json()) as CloudinaryResource & { error?: { message?: string } };
  assert(response.ok, `Cloudinary upload failed for ${path}: ${body.error?.message || response.status}`);
  return body;
}

function normalizeHomepageContent(
  heroAsset: Record<string, unknown>,
  mediaAssets: Record<string, Record<string, unknown>>,
) {
  const content = structuredClone(RENAISSANCE_HOMEPAGE_FALLBACK) as any[];

  for (const block of content) {
    if (block._type === "heroShowTime") {
      block.backgroundImage = cloneAsset(heroAsset, "renaissance-home-hero-asset");
      block.additionalContent = (block.additionalContent || []).map((item: any) => ({
        ...item,
        _type: "cta",
        link: item.link ? { ...item.link, _type: "link" } : undefined,
      }));
    }

    if (block._type === "introBlockTypoSophisticated") {
      block.header = { _type: "peopleStepHeader", ...block.header };
    }

    if (block._type === "carousel") {
      block.items = block.items.map((item: any, index: number) => ({
        ...item,
        _type: "carouselItem",
        id: index + 1,
        image: cloneAsset(
          index === 0 ? mediaAssets.romeo : mediaAssets.yooka,
          `renaissance-story-${index + 1}-asset`,
        ),
      }));
    }

    if (block._type === "clientLogoCarousel") {
      block.selectedClients = CLIENTS.map((client, index) => ({
        _key: `renaissance-client-ref-${index + 1}`,
        _type: "reference",
        _ref: client.id,
      }));
    }

    if (block._type === "cardContainerComponent") {
      block.cards = block.cards.map((card: any) => ({
        ...card,
        _type: "cardInsideComponent",
      }));
    }

    if (block._type === "twoColContentSection") {
      block.image = cloneAsset(mediaAssets.stefano, "renaissance-stefano-asset");
    }

    if (block._type === "globeComponent") {
      block.locations = block.locations.map((location: any) => ({
        ...location,
        _type: "location",
      }));
    }

    if (block._type === "intertitleCTA" && block.cta) {
      block.cta = {
        ...block.cta,
        _type: "cta",
        link: block.cta.link ? { ...block.cta.link, _type: "link" } : undefined,
      };
    }
  }

  return content;
}

async function main() {
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
  dataset: env.dataset,
  useCdn: false,
  perspective: "raw",
});
const clientConfig = client.config();
assert(
  clientConfig.projectId === EXPECTED_PROJECT_ID && clientConfig.dataset === EXPECTED_DATASET,
  `Sanity CLI resolved ${clientConfig.projectId || "(missing)"}/${clientConfig.dataset || "(missing)"}; expected ${EXPECTED_PROJECT_ID}/${EXPECTED_DATASET}.`,
);

const newClientIds = CLIENTS.filter((entry) => !entry.existing).map((entry) => entry.id);
const targetIds = [HOMEPAGE_ID, FOOTER_ID, ...newClientIds];
const existingTargets = await client.fetch<SanityDocument[]>(
  `*[_id in $ids || _id in $draftIds]{_id,_type,_rev}`,
  { ids: targetIds, draftIds: targetIds.map((id) => `drafts.${id}`) },
);
assert(
  existingTargets.length === 0,
  `Refusing to overwrite existing target documents: ${existingTargets.map((document) => document._id).join(", ")}`,
);

const scope = await client.fetch<{
  homepages: number;
  pages: number;
  navbarMenus: number;
  footerMenus: number;
}>(
  `{
    "homepages": count(*[_type == "page" && channel == $channel && language == $language && isHomepage == true]),
    "pages": count(*[_type == "page" && channel == $channel && language == $language]),
    "navbarMenus": count(*[_type == "menu" && channel == $channel && language == $language && menuType == "Navbar"]),
    "footerMenus": count(*[_type == "menu" && channel == $channel && language == $language && menuType == "Footer"])
  }`,
  { channel: CHANNEL, language: LANGUAGE },
);
assert(scope.homepages === 0 && scope.pages === 0, "Renaissance page scope is no longer empty; inspect before seeding.");
assert(scope.navbarMenus === 0 && scope.footerMenus === 0, "Renaissance menu scope is no longer empty; inspect before seeding.");

const unit = await client.fetch<Record<string, any> | null>(
  `*[_id == $id][0]{_id,name,backgroundImage,logo}`,
  { id: UNIT_ID },
);
assert(unit?.name === "Renaissance" && unit.backgroundImage && unit.logo, "Verified Renaissance unit assets are missing.");

const ubisoft = await client.fetch<Record<string, any> | null>(
  `*[_id == $id][0]{_id,_rev,_type,name,language,channel,logo}`,
  { id: UBISOFT_ID },
);
assert(
  ubisoft?._type === "client" &&
    ubisoft.name === "Ubisoft" &&
    ubisoft.language === LANGUAGE &&
    ubisoft.logo,
  "Verified English Ubisoft client is missing.",
);

const plan = {
  mode: APPLY ? "apply" : "dry-run",
  guard: `${EXPECTED_PROJECT_ID}/${EXPECTED_DATASET}`,
  scope: `${CHANNEL}/${LANGUAGE}`,
  backup: backupPath,
  creates: [
    { _id: HOMEPAGE_ID, _type: "page", blocks: RENAISSANCE_HOMEPAGE_FALLBACK.length },
    { _id: FOOTER_ID, _type: "menu", menuType: "Footer" },
    ...CLIENTS.filter((entry) => !entry.existing).map((entry) => ({
      _id: entry.id,
      _type: "client",
      name: entry.name,
    })),
  ],
  patch: {
    _id: UBISOFT_ID,
    addChannel: ubisoft.channel?.includes(CHANNEL) ? null : CHANNEL,
    ifRevisionId: ubisoft._rev,
  },
  cloudinary: [
    ...MEDIA.map((entry) => ({ publicId: entry.publicId, source: entry.path })),
    ...CLIENTS.filter((entry) => !entry.existing).map((entry) => ({
      publicId: entry.publicId,
      source: entry.logoPath,
    })),
  ],
  intentionallyOmitted: {
    navbarMenu: "The current menu schema supports page references, not homepage anchors. The working section navigation remains the Renaissance fallback navigation.",
  },
};

console.log(JSON.stringify(plan, null, 2));

if (!APPLY) {
  console.log("\nDry run complete. No Cloudinary or Sanity writes were made.");
  process.exit(0);
}

const uploadedMedia = Object.fromEntries(
  await Promise.all(
    MEDIA.map(async (entry, index) => {
      const resource = await uploadCloudinary(entry.path, entry.publicId, entry.displayName);
      return [entry.key, cloudinaryAsset(resource, `renaissance-media-${index + 1}`)];
    }),
  ),
);

const clientLogoAssets = new Map<string, Record<string, unknown>>();
for (const [index, entry] of CLIENTS.filter((clientEntry) => !clientEntry.existing).entries()) {
  const resource = await uploadCloudinary(
    entry.logoPath,
    entry.publicId,
    `Renaissance Homepage - ${entry.name} Logo`,
  );
  clientLogoAssets.set(entry.id, cloudinaryAsset(resource, `renaissance-client-logo-${index + 1}`));
}

const homepageContent = normalizeHomepageContent(unit.backgroundImage, uploadedMedia);
const homepage: SanityDocument = {
  _id: HOMEPAGE_ID,
  _type: "page",
  language: LANGUAGE,
  title: "Renaissance",
  slug: { _type: "slug", current: "home" },
  isHomepage: true,
  channel: CHANNEL,
  navbarVariant: "light",
  metadata: {
    _type: "metadata",
    title: "Renaissance | Great communications for the games industry",
    description: "Award-winning PR and communications for indie titles, AAA blockbusters and everything in between.",
    keywords: ["games PR", "video game communications", "games industry PR", "creator campaigns"],
    excludeFromSitemap: false,
    image: {
      _type: "cloudinaryImage",
      asset: cloneAsset(unit.backgroundImage, "renaissance-home-og-asset"),
      alt: "Renaissance games communications",
    },
  },
  content: homepageContent,
};

const footer: SanityDocument = {
  _id: FOOTER_ID,
  _type: "menu",
  language: LANGUAGE,
  channel: CHANNEL,
  title: "Menu",
  menuType: "Footer",
  imageCloud: cloneAsset(unit.logo, "renaissance-footer-logo"),
  addressTitle: "Locations",
  locations: [
    { _key: "renaissance-footer-uk", _type: "location", name: "United Kingdom" },
    { _key: "renaissance-footer-la", _type: "location", name: "Los Angeles" },
    { _key: "renaissance-footer-china", _type: "location", name: "China" },
  ],
  copyright: "© 2026 Renaissance",
};

const newClientDocuments = CLIENTS.filter((entry) => !entry.existing).map((entry) => ({
  _id: entry.id,
  _type: "client",
  language: LANGUAGE,
  name: entry.name,
  slug: { _type: "slug", current: entry.slug },
  logo: clientLogoAssets.get(entry.id),
  channel: [CHANNEL],
}));

let transaction = client.transaction();
transaction = transaction.create(homepage).create(footer);
for (const document of newClientDocuments) transaction = transaction.create(document);
if (!ubisoft.channel?.includes(CHANNEL)) {
  transaction = transaction.patch(UBISOFT_ID, (patch) =>
    patch.ifRevisionId(ubisoft._rev).set({
      channel: [...new Set([...(ubisoft.channel || []), CHANNEL])],
    }),
  );
}

const commit = await transaction.commit({ visibility: "sync" });

const verification = await client.fetch(
  `{
    "homepage": *[_id == $homepageId][0]{
      _id,_rev,_type,title,slug,isHomepage,channel,language,navbarVariant,
      "blockCount": count(content),
      "blockTypes": content[]._type,
      "storyMedia": content[_type == "carousel"][0].items[]{title,"url":image.secure_url},
      "clientRefs": content[_type == "clientLogoCarousel"][0].selectedClients[]._ref,
      "locationCount": count(content[_type == "globeComponent"][0].locations)
    },
    "footer": *[_id == $footerId][0]{_id,_rev,_type,menuType,channel,language,"locationCount":count(locations)},
    "clients": *[_id in $clientIds]{_id,_rev,name,language,channel,"logoUrl":logo.secure_url}|order(name asc),
    "scopeCounts": {
      "homepages": count(*[_type == "page" && channel == $channel && language == $language && isHomepage == true]),
      "footerMenus": count(*[_type == "menu" && channel == $channel && language == $language && menuType == "Footer"]),
      "navbarMenus": count(*[_type == "menu" && channel == $channel && language == $language && menuType == "Navbar"])
    }
  }`,
  {
    homepageId: HOMEPAGE_ID,
    footerId: FOOTER_ID,
    clientIds: CLIENTS.map((entry) => entry.id),
    channel: CHANNEL,
    language: LANGUAGE,
  },
);

assert(verification.homepage?.blockCount === RENAISSANCE_HOMEPAGE_FALLBACK.length, "Homepage block verification failed.");
assert(verification.homepage?.storyMedia?.every((story: any) => story.url?.startsWith("https://res.cloudinary.com/")), "Story media verification failed.");
assert(verification.homepage?.clientRefs?.length === CLIENTS.length, "Client reference verification failed.");
assert(verification.homepage?.locationCount === 3, "Globe location verification failed.");
assert(verification.footer?.locationCount === 3, "Footer verification failed.");
assert(verification.clients?.length === CLIENTS.length, "Client verification failed.");
assert(verification.scopeCounts?.homepages === 1, "Homepage scope count verification failed.");
assert(verification.scopeCounts?.footerMenus === 1, "Footer scope count verification failed.");
assert(verification.scopeCounts?.navbarMenus === 0, "Unexpected Renaissance navbar menu found.");

console.log("\nSanity transaction committed and verified.");
console.log(JSON.stringify({ transactionId: commit.transactionId, verification }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
