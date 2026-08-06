#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { createClient } from "@sanity/client";

const APPLY = process.argv.includes("--apply");
const unknownArgs = process.argv.slice(2).filter((arg) => arg !== "--apply");
if (unknownArgs.length) {
  throw new Error(`Unknown argument(s): ${unknownArgs.join(", ")}`);
}

const EXPECTED_PROJECT_ID = "wu6i3y0h";
const EXPECTED_DATASET = "dev-dataset";
const SOURCE_ROOT = "/Users/martin/Downloads/FLZR2";
const BOSE_POSTER_PATH = "/private/tmp/flzr-bose-results-poster.jpg";
const BACKUP_PATH = join(
  process.cwd(),
  "EXPORT/dev-dataset-before-flzr-content-20260806-091913-IDT.tar.gz",
);

const env = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  writeToken: process.env.SANITY_API_WRITE_TOKEN,
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryKey: process.env.CLOUDINARY_API_KEY,
  cloudinarySecret: process.env.CLOUDINARY_API_SECRET,
};

if (env.projectId !== EXPECTED_PROJECT_ID || env.dataset !== EXPECTED_DATASET) {
  throw new Error(
    `Refusing to run outside ${EXPECTED_PROJECT_ID}/${EXPECTED_DATASET}. ` +
      `Resolved ${env.projectId || "(missing)"}/${env.dataset || "(missing)"}.`,
  );
}
if (!env.apiVersion) throw new Error("NEXT_PUBLIC_SANITY_API_VERSION is required.");
if (!env.writeToken) throw new Error("SANITY_API_WRITE_TOKEN is required.");
if (APPLY && (!env.cloudName || !env.cloudinaryKey || !env.cloudinarySecret)) {
  throw new Error("Cloudinary credentials are required for --apply.");
}
if (APPLY && !existsSync(BACKUP_PATH)) {
  throw new Error(`Refusing to apply without the verified pre-mutation backup: ${BACKUP_PATH}`);
}

const client = createClient({
  projectId: env.projectId,
  dataset: env.dataset,
  apiVersion: env.apiVersion,
  token: APPLY ? env.writeToken : undefined,
  useCdn: false,
  perspective: "published",
});

const paths = {
  homepageAgency: join(SOURCE_ROOT, "FLZR_Homepage_Agency_Revised (1).docx"),
  services: join(SOURCE_ROOT, "FLZR_Services_Revised (1).docx"),
  sonyDoc: join(SOURCE_ROOT, "SONY CASE", "Sony FIELD MARKETING.docx"),
  sonyHeadphones: join(SOURCE_ROOT, "SONY CASE", "sony headphones.mp4"),
  o2Doc: join(SOURCE_ROOT, "O2 CASE", "O2 Studio Brand Ambassador Programme.docx"),
  o2Image: join(
    SOURCE_ROOT,
    "O2 CASE",
    "gemini-2.5-flash-image_I_d_like_to_create_a_video_for_the_O2_studio_telefonica_in_Berlin._we_want_to_sh-0.jpg",
  ),
  o2Vr: join(
    SOURCE_ROOT,
    "O2 CASE",
    "hailuo-2_3_I_d_like_to_create_a_3_second_cinemagraph_for_the_O2_studio_telefonica_in_Berlin-0.mp4",
  ),
  o2Ambassador: join(
    SOURCE_ROOT,
    "O2 CASE",
    "hailuo-2_3_I_d_like_to_create_a_3_second_cinemagraph_for_the_O2_studio_telefonica_in_Berlin-2.mp4",
  ),
  o2Card: join(
    SOURCE_ROOT,
    "O2 CASE",
    "hailuo-2_3_I_d_like_to_create_a_3_second_cinemagraph_for_the_O2_studio_telefonica_in_Berlin-6.mp4",
  ),
  o2LensFlare: join(
    SOURCE_ROOT,
    "O2 CASE",
    "hailuo-2_3_bright_lens_flare_I_d_like_to_create_a_video_for_the_O2_studio_telefonica_in_Ber-0.mp4",
  ),
  boseDoc: join(SOURCE_ROOT, "BOSE CASE", "BOSE_Q4 SALES ACTIVATION.docx"),
  boseVideo: join(SOURCE_ROOT, "BOSE CASE", "bose instore.mp4"),
  boseQr: join(SOURCE_ROOT, "BOSE CASE", "4ed6d7a3-cdae-470d-b5ca-2916c280c231.png"),
  bosePoster: BOSE_POSTER_PATH,
};

for (const [name, path] of Object.entries(paths)) {
  if (name === "bosePoster") continue;
  if (!existsSync(path)) throw new Error(`Missing source file ${name}: ${path}`);
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );
}

function readDocxParagraphs(path) {
  const xml = execFileSync("unzip", ["-p", path, "word/document.xml"], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  return [...xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)]
    .map(([paragraph]) =>
      [...paragraph.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
        .map((match) => decodeXml(match[1]))
        .join("")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

const serviceNames = [
  "Go To Markets",
  "Business Intelligence",
  "Trainings",
  "Promotion",
  "Live Video Consulting",
  "PoS Management",
  "Sales Force",
  "AI Solutions",
];

function parseServicesDoc(path) {
  const paragraphs = readDocxParagraphs(path);
  return serviceNames.map((name, index) => {
    const nameIndex = paragraphs.indexOf(name);
    if (nameIndex < 1) throw new Error(`Service '${name}' was not found in ${path}.`);
    if (paragraphs[nameIndex + 4] !== "WHAT WE DELIVER") {
      throw new Error(`Unexpected source structure around service '${name}'.`);
    }
    const nextName = serviceNames[index + 1];
    const nextNameIndex = nextName ? paragraphs.indexOf(nextName) : paragraphs.length + 1;
    const deliverableEnd = nextName ? nextNameIndex - 1 : paragraphs.length;
    const deliverableLines = paragraphs.slice(nameIndex + 5, deliverableEnd);
    const deliverables = deliverableLines.map((line, deliverableIndex) => {
      const separator = line.indexOf(":");
      if (separator < 1) {
        throw new Error(`Malformed deliverable for '${name}': ${line}`);
      }
      return {
        _key: `service-${index + 1}-deliverable-${deliverableIndex + 1}`,
        _type: "serviceDeliverable",
        title: line.slice(0, separator).trim(),
        description: line.slice(separator + 1).trim(),
      };
    });
    if (deliverables.length < 5) {
      throw new Error(`Expected at least five deliverables for '${name}'.`);
    }
    return {
      name,
      taglabel: paragraphs[nameIndex - 1],
      introText: paragraphs[nameIndex + 1],
      body: [paragraphs[nameIndex + 2], paragraphs[nameIndex + 3]],
      deliverables,
    };
  });
}

function parseCaseDoc(path) {
  const paragraphs = readDocxParagraphs(path);
  const atAGlance = paragraphs.indexOf("AT A GLANCE");
  if (atAGlance !== 4) throw new Error(`Unexpected Case source structure: ${path}`);
  const facts = paragraphs
    .slice(atAGlance + 1)
    .filter((line) => /^[—–-]\s*/.test(line))
    .map((line) => line.replace(/^[—–-]\s*/, "").trim());
  if (facts.length < 4) {
    throw new Error(`Expected at least four At a Glance facts: ${path}`);
  }
  return {
    descriptor: paragraphs[0],
    title: paragraphs[1],
    body: [paragraphs[2], paragraphs[3]],
    facts,
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ref(id, key) {
  const baseId = id.replace(/^drafts\./, "");
  const reference = { _key: key, _type: "reference", _ref: baseId };
  const targetType = draftOnlyReferenceType(baseId);
  if (targetType) {
    reference._weak = true;
    reference._strengthenOnPublish = { type: targetType };
  }
  return reference;
}

function ptBlock(text, key, style = "normal") {
  return {
    _key: key,
    _type: "block",
    style,
    markDefs: [],
    children: [
      {
        _key: `${key}-span`,
        _type: "span",
        marks: [],
        text,
      },
    ],
  };
}

function ptParagraphs(prefix, paragraphs) {
  return paragraphs.flatMap((paragraph, index) =>
    String(paragraph)
      .split(/\n\s*\n/)
      .filter(Boolean)
      .map((text, subIndex) => ptBlock(text, `${prefix}-${index + 1}-${subIndex + 1}`)),
  );
}

function internalCta(text, pageId, variant = "violet") {
  return {
    _type: "cta",
    text,
    variant,
    link: {
      _type: "link",
      linkType: "internal",
      page: ref(pageId, `${slugify(text)}-page`),
    },
  };
}

function externalCta(text, externalUrl, variant = "violet") {
  return {
    _type: "cta",
    text,
    variant,
    link: { _type: "link", linkType: "external", externalUrl },
  };
}

function stripSystemFields(document) {
  const clone = structuredClone(document);
  delete clone._rev;
  delete clone._createdAt;
  delete clone._updatedAt;
  delete clone._system;
  return clone;
}

function collectMedia(root) {
  const assets = new Map();
  const images = new Map();
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (value._type === "cloudinaryImage" && value.asset?.public_id) {
      images.set(value.asset.public_id, structuredClone(value));
    }
    if (value.public_id && (value.secure_url || value.url)) {
      assets.set(value.public_id, structuredClone(value));
    }
    for (const child of Object.values(value)) visit(child);
  };
  visit(root);
  return { assets, images };
}

function ensureAsset(media, publicId) {
  const asset = media.assets.get(publicId);
  if (!asset) throw new Error(`Required Cloudinary asset '${publicId}' was not found.`);
  return structuredClone(asset);
}

function cloudinaryImage(asset, alt, focusX = 50, focusY = 50) {
  return {
    _type: "cloudinaryImage",
    asset: structuredClone(asset),
    alt,
    focusMode: "manual",
    focusX,
    focusY,
  };
}

function mimeTypeFor(path) {
  const extension = extname(path).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".mp4") return "video/mp4";
  return "application/octet-stream";
}

function toCloudinaryAsset(resource) {
  const result = {
    _type: "cloudinary.asset",
    _version: 1,
    access_mode: resource.access_mode || "public",
    bytes: resource.bytes,
    created_at: resource.created_at,
    display_name: resource.display_name,
    format: resource.format,
    height: resource.height,
    public_id: resource.public_id,
    resource_type: resource.resource_type,
    secure_url: resource.secure_url,
    type: resource.type || "upload",
    url: resource.url,
    version: resource.version,
    width: resource.width,
  };
  if (typeof resource.duration === "number") result.duration = resource.duration;
  return JSON.parse(JSON.stringify(result));
}

function placeholderAsset(spec) {
  const extension = extname(spec.path).replace(/^\./, "") ||
    (spec.resourceType === "video" ? "mp4" : "jpg");
  return {
    _type: "cloudinary.asset",
    _version: 1,
    access_mode: "public",
    bytes: 1,
    format: extension,
    height: 1080,
    public_id: spec.publicId,
    resource_type: spec.resourceType,
    secure_url: `https://res.cloudinary.com/${env.cloudName || "dry-run"}/${spec.resourceType}/upload/${spec.publicId}.${extension}`,
    type: "upload",
    url: `http://res.cloudinary.com/${env.cloudName || "dry-run"}/${spec.resourceType}/upload/${spec.publicId}.${extension}`,
    version: 1,
    width: 1920,
  };
}

async function findCloudinaryResource(spec) {
  const encodedPublicId = spec.publicId
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const url = `https://api.cloudinary.com/v1_1/${env.cloudName}/resources/${spec.resourceType}/upload/${encodedPublicId}`;
  const authorization = `Basic ${Buffer.from(`${env.cloudinaryKey}:${env.cloudinarySecret}`).toString("base64")}`;
  const response = await fetch(url, { headers: { authorization } });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Cloudinary lookup failed for ${spec.publicId}: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

async function uploadCloudinaryResource(spec) {
  const existing = await findCloudinaryResource(spec);
  if (existing) return toCloudinaryAsset(existing);

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signingValues = {
    overwrite: "false",
    public_id: spec.publicId,
    timestamp,
  };
  const signatureBase = Object.entries(signingValues)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const signature = createHash("sha1")
    .update(`${signatureBase}${env.cloudinarySecret}`)
    .digest("hex");

  const body = new FormData();
  for (const [key, value] of Object.entries(signingValues)) body.append(key, value);
  body.append("api_key", env.cloudinaryKey);
  body.append("signature", signature);
  body.append(
    "file",
    new Blob([readFileSync(spec.path)], { type: mimeTypeFor(spec.path) }),
    spec.path.split("/").at(-1),
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudName}/${spec.resourceType}/upload`,
    { method: "POST", body },
  );
  if (!response.ok) {
    throw new Error(`Cloudinary upload failed for ${spec.publicId}: ${response.status} ${await response.text()}`);
  }
  return toCloudinaryAsset(await response.json());
}

const uploadSpecs = [
  { key: "sonyHeadphones", path: paths.sonyHeadphones, publicId: "flzr/content-2026/sony-headphones-pos", resourceType: "video" },
  { key: "o2Image", path: paths.o2Image, publicId: "flzr/content-2026/o2-studio-main-still", resourceType: "image" },
  { key: "o2Vr", path: paths.o2Vr, publicId: "flzr/content-2026/o2-studio-vr-loop", resourceType: "video" },
  { key: "o2Ambassador", path: paths.o2Ambassador, publicId: "flzr/content-2026/o2-studio-ambassador-loop", resourceType: "video" },
  { key: "o2Card", path: paths.o2Card, publicId: "flzr/content-2026/o2-studio-card-loop", resourceType: "video" },
  { key: "boseVideo", path: paths.boseVideo, publicId: "flzr/content-2026/bose-q4-in-store", resourceType: "video" },
  { key: "boseQr", path: paths.boseQr, publicId: "flzr/content-2026/bose-live-video-consulting-qr", resourceType: "image" },
  { key: "bosePoster", path: paths.bosePoster, publicId: "flzr/content-2026/bose-q4-results-poster-3s10", resourceType: "image", derived: true },
];

function ensureBosePoster() {
  if (existsSync(paths.bosePoster)) return;
  execFileSync(
    "ffmpeg",
    ["-ss", "3.10", "-i", paths.boseVideo, "-frames:v", "1", "-q:v", "2", "-y", paths.bosePoster],
    { stdio: "inherit" },
  );
  if (!existsSync(paths.bosePoster)) throw new Error("Failed to derive Bose results poster.");
}

async function resolveUploads() {
  if (APPLY) ensureBosePoster();
  const result = {};
  for (const spec of uploadSpecs) {
    if (!APPLY && spec.derived && !existsSync(spec.path)) {
      result[spec.key] = placeholderAsset(spec);
      continue;
    }
    if (!existsSync(spec.path)) throw new Error(`Missing upload source: ${spec.path}`);
    result[spec.key] = APPLY
      ? await uploadCloudinaryResource(spec)
      : placeholderAsset(spec);
  }
  return result;
}

const ids = {
  homeV2: "page-flizr-home-v2-en",
  servicesV2: "page-flizr-services-v2-en",
  agencyV2: "page-flizr-agency-v2-en",
  sonyCase: "7dbf1a02-91d6-4e57-93d5-d378c7ec02f8",
  sonyClient: "572cc103-33f0-4b36-b586-d5f29d8270cd",
  o2Case: "case-flizr-o2-studio-en",
  o2Client: "client-flizr-o2-en",
  boseCase: "case-flizr-bose-q4-en",
  boseClient: "client-flizr-bose-en",
  contactPage: "8c25b5d3-5254-4d7f-82a2-94737b05fea1",
};

const serviceIds = {
  "Go To Markets": "service-flzr-go-to-markets-en",
  "Business Intelligence": "service-flzr-business-intelligence-en",
  Trainings: "service-flzr-trainings-en",
  Promotion: "service-flzr-promotion-en",
  "Live Video Consulting": "service-flzr-live-video-consulting-en",
  "PoS Management": "service-flzr-pos-management-en",
  "Sales Force": "service-flzr-sales-force-en",
  "AI Solutions": "service-flzr-ai-solutions-en",
};

function draftOnlyReferenceType(id) {
  if (Object.values(serviceIds).includes(id)) return "services";
  if ([ids.o2Case, ids.boseCase].includes(id)) return "caseStudy";
  if ([ids.o2Client, ids.boseClient].includes(id)) return "client";
  if ([ids.homeV2, ids.servicesV2, ids.agencyV2].includes(id)) return "page";
  return null;
}

const homepageCopy = {
  intro: [
    "Twenty years at the point of sale. That's not just experience — it's a blueprint for how retail marketing actually works, built case by case, campaign by campaign, across every major European market.",
    "FLZR is a full-service retail marketing and field marketing agency. We handle everything from go-to-market strategy and sales force deployment to live video consulting and AI-powered retail analytics — so your brand performs where it matters most: in front of the customer, at the moment of purchase.",
  ],
  serviceIntro:
    "From brand activation and field marketing to predictive analytics and live video consulting — built to work as one.",
  strengths: [
    {
      headline: "People at the Centre",
      text: "Flat hierarchies, real conversations, and a culture that attracts people who care. That's why our teams perform differently.",
    },
    {
      headline: "AI-Powered Talent",
      text: "Smarter recruiting means better people on your campaign. Our AI matching puts the right personality, skills and brand fit together every time.",
    },
    {
      headline: "Live Performance Data",
      text: "Stop waiting for month-end reports. Our in-house BI tools give you real-time visibility across every location, every shift.",
    },
    {
      headline: "True End-to-End",
      text: "Strategy, staffing, execution, analytics — all under one roof. No handoffs. No gaps. No excuses.",
    },
    {
      headline: "Europe Without Borders",
      text: "A single partner across Germany, Austria, Switzerland and beyond. Consistent quality, local knowledge, everywhere.",
    },
    {
      headline: "Ahead of the Curve",
      text: "Live video consulting, social selling, predictive AI — not roadmap items. Live services, already running at scale.",
    },
  ],
  cases: [
    "Intel. Microsoft. Telefónica. Bose. PlayStation. OBI. Müller. And 20+ years of campaigns that moved the needle.",
    "From consumer electronics and DIY to food, beauty and gaming — our retail marketing campaigns cover every category. The common thread: measurable outcomes, premium execution, and a brand presence that outlasts the campaign.",
  ],
  europe:
    "Three German offices — Berlin, Wesel, Ingolstadt — and field teams operating across the European market. One point of contact. Europe-wide reach.",
};

const agencyCopy = {
  about: [
    "FLZR was founded in 2004 with a clear conviction: the point of sale is where brands are truly won or lost. That conviction has never changed. What has changed is our scale, our tools, and the breadth of what we can deliver.",
    "Today, we're a 420-person retail marketing agency with a personnel pool of over 24,000 trained professionals across Europe. We design and execute end-to-end campaigns — from market entry strategy to in-store brand experiences — for some of the world's most recognisable brands. Twenty years in, we're as sharp as ever.",
  ],
  belief:
    "The store is still where decisions are made. Digital drives awareness — we drive the sale. The future of retail isn't online vs. in-store. It's the seamless integration of both, executing with precision at the point of purchase.",
  howWeWork:
    "360-degree campaigns built on data, not instinct. Every activation is designed to be measurable from day one. Our creative teams develop the concept. Our BI platform tracks the impact. Both serve the same master: your results.",
  setsApart:
    "24,000 field professionals, AI-matched and human-managed. A 420-person HQ with the strategic depth and operational capacity to run complex, multi-market campaigns at pace — without compromising on quality or brand standards.",
  team:
    "420 people. 370 of them deployed at the point of sale — where the work actually matters. The remaining 50 keep everything running: account management, business intelligence, data analysis, digital marketing, HR and finance.\n\nDifferent backgrounds. Shared standards. All of them committed to one thing: making your brand perform better in retail.",
  careers:
    "The FLZR job portal has opportunities across every discipline — field and office, junior and senior.\n\nIf you want to work on campaigns that actually ship, for brands people genuinely care about, with a team that takes quality seriously — FLZR is hiring.",
};

const peopleIds = [
  "20a1c966-be76-4df8-b4b7-0b8667ee3cc5",
  "ba788782-2bdb-4d23-8789-60589692df28",
  "310067de-dcbc-42f4-8b42-99497ca82b6e",
  "700d3883-11bd-492a-b6c4-563114fb2d33",
  "c0bc5859-39e7-49be-aab6-6f2470a0aaf1",
  "573c3d85-6f86-4946-9a93-7e3011324d3a",
  "e2ee394d-f8b5-45bb-b9fe-e595d863724f",
];

function headerBlock({ key, media, eyebrow, seoTitle, headline, support, cta }) {
  return {
    _key: key,
    _type: "oneSPHeader",
    navPointName: eyebrow,
    hideFromNav: false,
    media: structuredClone(media),
    enableParallax: true,
    eyebrow,
    seoTitle,
    headlineMode: "headlineReveal",
    headline,
    paragraphs: ptParagraphs(`${key}-support`, [support]),
    cta,
    cornerLeftText: "FLZR",
    cornerRightText: "/ FLZR",
  };
}

function contentBlock({ key, title, introHeading, introSubheading, paragraphs, navPointName, size = "lg", span = "8", padding = "16" }) {
  return {
    _key: key,
    _type: "contentSection",
    navPointName: navPointName || title,
    hideFromNav: false,
    title,
    introHeading,
    introSubheading,
    content: ptParagraphs(`${key}-copy`, paragraphs),
    contentSize: size,
    columnSpan: span,
    showGridBackground: false,
    paddingY: padding,
  };
}

function twoColBlock({ key, title, copy, asset, useVideo, alt, reverse = false, background = "white", padding = "16" }) {
  return {
    _key: key,
    _type: "twoColContentSection",
    navPointName: title,
    hideFromNav: false,
    title,
    showTitle: true,
    titleColor: background === "black" || background === "neutral-700" ? "white" : "neutral-700",
    content: ptParagraphs(`${key}-copy`, Array.isArray(copy) ? copy : [copy]),
    contentSize: "lg",
    useVideo,
    ...(useVideo ? { video: structuredClone(asset) } : { image: structuredClone(asset) }),
    mediaAlt: alt,
    reverseColumns: reverse,
    backgroundColor: background,
    showGridBackground: false,
    paddingY: padding,
  };
}

function casesGallery(key) {
  return {
    _key: key,
    _type: "casesGalleryFiltered",
    navPointName: "Selected work",
    hideFromNav: false,
    selectionMode: "manual",
    selectedCases: [
      ref(ids.sonyCase, `${key}-sony`),
      ref(ids.o2Case, `${key}-o2`),
      ref(ids.boseCase, `${key}-bose`),
    ],
    showFilters: false,
    showGridBackground: false,
    paddingY: "16",
    marginBottom: "16",
  };
}

function contactCta(key, title, subtitle, text = "Start a project") {
  return {
    _key: key,
    _type: "intertitleCTA",
    navPointName: "Contact",
    hideFromNav: false,
    title,
    subtitle,
    cta: internalCta(text, ids.contactPage),
    alignment: "left",
    paddingTop: "24",
  };
}

function caseChallenge(key, caseData, title) {
  return {
    _key: key,
    _type: "challengeAndSolution",
    navPointName: "Overview",
    hideFromNav: false,
    badgeText: "Overview",
    badgeSubtitle: "The programme",
    badgeNumber: "001",
    title,
    description: caseData.body[0],
    contentType: "challenges",
    showContent: true,
    challengeTitle: "At a glance",
    challengeDescription: caseData.descriptor,
    challenges: caseData.facts,
    showCta: true,
    showButton: false,
    showSolution: false,
    backgroundColor: "bg-neutral-50",
    paddingY: "32",
  };
}

function caseApproach(key, caseData, asset, details = []) {
  return {
    _key: key,
    _type: "approachSection",
    navPointName: "Approach",
    hideFromNav: false,
    badgeText: "Approach",
    badgeSubtitle: "How it works",
    badgeNumber: "002",
    mainHeadline: "Built for the point of sale.",
    subHeadline: "People, execution and live insight working together.",
    description: caseData.body[1],
    approachDetails: details,
    mediaType: "video",
    backgroundVideo: structuredClone(asset),
    enableParallax: false,
    paddingY: "32",
  };
}

function qualitativeResults(key, title, description, asset) {
  return {
    _key: key,
    _type: "resultsMetrics",
    navPointName: "Results",
    hideFromNav: false,
    badgeText: "Results",
    badgeSubtitle: "What the activation delivered",
    badgeNumber: "003",
    title,
    description,
    metrics: [],
    backgroundImage: structuredClone(asset),
    backgroundOpacity: 0.65,
    enableParallax: false,
    fullWidth: false,
    paddingY: "32",
  };
}

async function fetchSourceDocuments() {
  return client.fetch(
    `{
      "home": *[_id == "page-flizr-home-en"][0],
      "agency": *[_id == "page-flizr-whatwedo-en"][0],
      "sonyCase": *[_id == $sonyCase][0],
      "sonyClient": *[_id == $sonyClient][0],
      "contactPage": *[_id == $contactPage][0],
      "services": *[_type == "services" && language == "en" && "flizrWeb" in channel],
      "people": *[_id in $peopleIds]{_id, name, language, channel, video}
    }`,
    {
      sonyCase: ids.sonyCase,
      sonyClient: ids.sonyClient,
      contactPage: ids.contactPage,
      peopleIds,
    },
  );
}

function sourceBlock(document, type) {
  const block = document?.content?.find((item) => item?._type === type);
  if (!block) throw new Error(`Missing source block '${type}' on ${document?._id || "unknown document"}.`);
  return structuredClone(block);
}

function sourceServiceImage(media, publicId, alt) {
  const existing = media.images.get(publicId);
  if (existing) {
    const image = structuredClone(existing);
    image.alt = alt;
    return image;
  }
  return cloudinaryImage(ensureAsset(media, publicId), alt);
}

function buildDocuments({ source, uploads, parsedServices, sonyCopy, o2Copy, boseCopy }) {
  if (!source.home || !source.agency || !source.sonyCase || !source.sonyClient || !source.contactPage) {
    throw new Error("One or more required published source documents are missing.");
  }
  if (source.services.length !== 8) {
    throw new Error(`Expected 8 current EN FLZR services, found ${source.services.length}.`);
  }
  const verifiedPeople = new Set(
    source.people
      .filter(
        (person) =>
          person.language === "en" &&
          person.channel?.includes("flizrWeb") &&
          person.video?.secure_url,
      )
      .map((person) => person._id),
  );
  const invalidPeople = peopleIds.filter((id) => !verifiedPeople.has(id));
  if (invalidPeople.length) {
    throw new Error(`Agency people are no longer EN/flizrWeb/video-safe: ${invalidPeople.join(", ")}`);
  }

  const media = collectMedia(source);
  const homeHero = sourceBlock(source.home, "oneSPHeader").media;
  const homeCardContainer = sourceBlock(source.home, "cardContainerComponent");
  const homeGlobe = sourceBlock(source.home, "globeComponent");
  const homeClientLogos = sourceBlock(source.home, "clientLogoCarousel");
  const agencyHero = sourceBlock(source.agency, "heroShowTime").backgroundImage;
  const agencyMetricsImage = sourceBlock(source.agency, "resultsMetrics").backgroundImage;
  const sonyTvs = ensureAsset(media, "sony_tvs_with_girl_lhfjxu");
  const sonyFlzr = ensureAsset(media, "sony_flzr_vy2fr7");
  const goToMarketVideo = ensureAsset(media, "Go-To-Market_euzzvn");
  const adobePeople = ensureAsset(media, "AdobeStock_1490246409_dlco3o");
  const adobeTech = ensureAsset(media, "AdobeStock_281210012_gjuwyk");
  const adobeData = ensureAsset(media, "AdobeStock_2044919217_aidvmp");
  const retailVideo = ensureAsset(media, "retail_hfcwfu");
  const blackrollImage = ensureAsset(media, "Blackroll_Image_NoDC_y7rovq");

  if (!Array.isArray(homeCardContainer.cards) || homeCardContainer.cards.length < 6) {
    throw new Error("The current Homepage no longer contains six reusable strength cards.");
  }

  const serviceMedia = {
    "Go To Markets": sourceServiceImage(media, "content_studio_amsvgb", "Product launch content being prepared for market entry."),
    "Business Intelligence": sourceServiceImage(media, "Go-To-Market_euzzvn", "Retail performance data displayed on a laptop."),
    Trainings: sourceServiceImage(media, "Twitch_influencer_03_hepfat", "A presenter delivering digital product content."),
    Promotion: sourceServiceImage(media, "Experiential_jzyg8p", "A live retail brand activation."),
    "Live Video Consulting": cloudinaryImage(
      uploads.boseQr,
      "A shopper opening a live video consultation from a retail QR code.",
      50,
      45,
    ),
    "PoS Management": sourceServiceImage(media, "retail_hfcwfu", "A fully executed branded retail environment."),
    "Sales Force": sourceServiceImage(media, "brand_ambassadors_egrldj", "Brand ambassadors working directly with shoppers."),
    "AI Solutions": cloudinaryImage(adobePeople, "A technology-led visual used as a temporary image for retail AI solutions."),
  };

  const serviceCaseIds = {
    "Business Intelligence": [ids.sonyCase],
    Promotion: [ids.sonyCase, ids.o2Case, ids.boseCase],
    "Sales Force": [ids.sonyCase, ids.o2Case, ids.boseCase],
  };

  const newServices = parsedServices.map((service, index) => ({
    _id: `drafts.${serviceIds[service.name]}`,
    _type: "services",
    language: "en",
    name: service.name,
    taglabel: service.taglabel,
    introText: service.introText,
    serviceDescription: service.body.join("\n\n"),
    deliverables: service.deliverables,
    serviceBackground: serviceMedia[service.name],
    sortOrder: index + 1,
    channel: ["flizrWeb"],
    caseStudies: (serviceCaseIds[service.name] || []).map((caseId, caseIndex) =>
      ref(caseId, `${slugify(service.name)}-case-${caseIndex + 1}`),
    ),
  }));

  const supersededServiceDrafts = source.services.map((service) => ({
    ...stripSystemFields(service),
    _id: `drafts.${service._id}`,
    channel: (service.channel || []).filter((channel) => channel !== "flizrWeb"),
  }));

  const sonyClient = {
    ...stripSystemFields(source.sonyClient),
    _id: `drafts.${ids.sonyClient}`,
    channel: ["flizrWeb"],
    caseStudies: [ref(ids.sonyCase, "sony-client-case")],
  };
  const o2Client = {
    _id: `drafts.${ids.o2Client}`,
    _type: "client",
    language: "en",
    name: "o2 / Telefónica",
    slug: { _type: "slug", current: "o2-telefonica" },
    tagline: "Telecommunications and flagship retail brand experience",
    channel: ["flizrWeb"],
    caseStudies: [ref(ids.o2Case, "o2-client-case")],
  };
  const boseClient = {
    _id: `drafts.${ids.boseClient}`,
    _type: "client",
    language: "en",
    name: "Bose",
    slug: { _type: "slug", current: "bose" },
    tagline: "Premium consumer audio",
    channel: ["flizrWeb"],
    caseStudies: [ref(ids.boseCase, "bose-client-case")],
  };

  const sonyServices = ["Sales Force", "Promotion", "Business Intelligence"];
  const sonyCase = {
    ...stripSystemFields(source.sonyCase),
    _id: `drafts.${ids.sonyCase}`,
    title: sonyCopy.title,
    subtitle: sonyCopy.descriptor,
    description: sonyCopy.body[0],
    mainVideo: sonyTvs,
    isVerticalVideo: false,
    client: ref(ids.sonyClient, "sony-client"),
    services: sonyServices.map((name, index) => ref(serviceIds[name], `sony-service-${index + 1}`)),
    channel: ["flizrWeb"],
    isPublished: true,
    connectedDataCarouselPromoFLZR: false,
    casesPageBuilder: [
      caseChallenge("sony-overview", sonyCopy, "A premium retail presence, built to stay consistent."),
      caseApproach("sony-approach", sonyCopy, uploads.sonyHeadphones, [
        "130 brand-trained promoters",
        "135 MediaMarkt, Saturn and specialist retail locations",
        "Nine regional field managers",
        "Real-time FLZR performance intelligence",
      ]),
      {
        _key: "sony-results",
        _type: "resultsMetrics",
        navPointName: "Results",
        hideFromNav: false,
        badgeText: "Results",
        badgeSubtitle: "At a glance",
        badgeNumber: "003",
        title: "Retail scale with real-time visibility.",
        description: sonyCopy.body[1],
        metrics: [
          { _key: "sony-metric-promoters", _type: "metric", type: "animatedNumber", value: 130, label: "Promoters" },
          { _key: "sony-metric-stores", _type: "metric", type: "animatedNumber", value: 135, label: "Stores and specialist retailers" },
          { _key: "sony-metric-managers", _type: "metric", type: "animatedNumber", value: 9, label: "Regional field managers" },
        ],
        backgroundImage: sonyFlzr,
        backgroundOpacity: 0.65,
        enableParallax: false,
        fullWidth: false,
        paddingY: "32",
      },
    ],
  };
  delete sonyCase._system;

  const o2Case = {
    _id: `drafts.${ids.o2Case}`,
    _type: "caseStudy",
    language: "en",
    title: o2Copy.title,
    slug: { _type: "slug", current: "o2-studio-berlin-brand-ambassadors" },
    subtitle: o2Copy.descriptor,
    description: o2Copy.body[0],
    mainImage: uploads.o2Image,
    mainVideo: uploads.o2Vr,
    isVerticalVideo: false,
    client: ref(ids.o2Client, "o2-client"),
    services: [
      ref(serviceIds.Promotion, "o2-service-promotion"),
      ref(serviceIds["Sales Force"], "o2-service-sales-force"),
    ],
    channel: ["flizrWeb"],
    publishedAt: "2026-08-06T00:00:00.000Z",
    isPublished: true,
    connectedDataCarouselPromo1SP: false,
    connectedDataCarouselPromoFLZR: false,
    connectedDataCarouselPromoMSM: false,
    connectedDataCarouselPromoStudioCO2: false,
    casesPageBuilder: [
      caseChallenge("o2-overview", o2Copy, "A flagship brand space needs advocates, not just staff."),
      caseApproach("o2-approach", o2Copy, uploads.o2Ambassador, [
        "Dedicated brand ambassador selection and management",
        "Daily delivery of the full o2 Studio experience",
        "Consistent, immersive customer journey",
        "Flagship activation in Berlin's Tech-Village",
      ]),
      qualitativeResults(
        "o2-results",
        "A brand activation that never stops.",
        "The programme turns curiosity into affinity — and affinity into advocacy — through a consistently delivered live o2 experience.",
        uploads.o2Image,
      ),
    ],
  };

  const boseCase = {
    _id: `drafts.${ids.boseCase}`,
    _type: "caseStudy",
    language: "en",
    title: boseCopy.title,
    slug: { _type: "slug", current: "bose-q4-sales-activation" },
    subtitle: boseCopy.descriptor,
    description: boseCopy.body[0],
    mainImage: uploads.bosePoster,
    mainVideo: uploads.boseVideo,
    isVerticalVideo: false,
    client: ref(ids.boseClient, "bose-client"),
    services: [
      ref(serviceIds.Promotion, "bose-service-promotion"),
      ref(serviceIds["Sales Force"], "bose-service-sales-force"),
    ],
    channel: ["flizrWeb"],
    publishedAt: "2026-08-06T00:00:00.000Z",
    isPublished: true,
    connectedDataCarouselPromo1SP: false,
    connectedDataCarouselPromoFLZR: false,
    connectedDataCarouselPromoMSM: false,
    connectedDataCarouselPromoStudioCO2: false,
    casesPageBuilder: [
      caseChallenge("bose-overview", boseCopy, "Q4 is where premium audio brands fight for the customer's decision."),
      caseApproach("bose-approach", boseCopy, uploads.boseVideo, [
        "Brand ambassadors deployed across 20 stores",
        "Guided premium product experiences",
        "Targeted clearance of older merchandise",
        "Consistent brand standards throughout peak season",
      ]),
      qualitativeResults(
        "bose-results",
        "Twenty stores. One quarter that counted.",
        "The supplied source reports measurable sales uplift, increased audio market share, planned merchandise clearance and a premium in-store experience. Numeric uplift was not supplied and has not been invented.",
        uploads.bosePoster,
      ),
    ],
  };

  const strengthMedia = [
    uploads.sonyHeadphones,
    adobeTech,
    adobeData,
    retailVideo,
    blackrollImage,
    uploads.o2Card,
  ];
  const homepageStrengths = {
    ...homeCardContainer,
    _key: "home-v2-strength-cards",
    cards: homepageCopy.strengths.map((item, index) => ({
      ...structuredClone(homeCardContainer.cards[index]),
      _key: `home-v2-strength-${index + 1}`,
      headline: item.headline,
      text: item.text,
      media: structuredClone(strengthMedia[index]),
    })),
  };

  const homepage = {
    _id: `drafts.${ids.homeV2}`,
    _type: "page",
    language: "en",
    title: "FLZR Homepage v2",
    slug: { _type: "slug", current: "home-v2" },
    isHomepage: false,
    channel: "flizrWeb",
    navbarVariant: "light",
    metadata: {
      _type: "metadata",
      title: "FLZR | European Retail Marketing & Field Marketing Agency",
      description: "FLZR connects retail strategy, field teams, brand activation, live video consulting and retail intelligence across Europe.",
      keywords: ["retail marketing agency", "field marketing", "point of sale", "brand activation"],
      excludeFromSitemap: true,
    },
    content: [
      headerBlock({
        key: "home-v2-hero",
        media: homeHero,
        eyebrow: "FLZR",
        seoTitle: "FLZR — Europe's specialist retail marketing agency",
        headline: "FLZR.\nEurope's specialist retail marketing agency.",
        support: "Smarter field marketing. Stronger brand experiences. Measurable results.",
        cta: internalCta("Explore our services", ids.servicesV2),
      }),
      contentBlock({
        key: "home-v2-intro",
        title: "Built at the point of sale.",
        paragraphs: homepageCopy.intro,
        navPointName: "About FLZR",
        span: "10",
        padding: "24",
      }),
      contentBlock({
        key: "home-v2-services-intro",
        introHeading: "Eight specialist services.",
        introSubheading: "One integrated retail partner.",
        paragraphs: [homepageCopy.serviceIntro],
        navPointName: "Services",
        span: "10",
      }),
      {
        _key: "home-v2-services",
        _type: "servicesGalleryFiltered",
        navPointName: "Services",
        hideFromNav: false,
        showFilters: false,
        showGridBackground: false,
        backgroundColor: "neutral-100",
        paddingY: "32",
      },
      {
        _key: "home-v2-strengths-intro",
        _type: "headlineChallenge",
        navPointName: "Why FLZR",
        hideFromNav: false,
        headline: "Why FLZR",
        title: "Six strengths. One standard.",
        description: "People, technology and execution working as one at the point of sale.",
        showGridBackground: true,
        paddingY: "16",
      },
      homepageStrengths,
      contentBlock({
        key: "home-v2-europe-intro",
        title: "Headquartered in Berlin. Active across Europe.",
        paragraphs: [homepageCopy.europe],
        navPointName: "Europe",
        span: "10",
      }),
      {
        ...homeGlobe,
        _key: "home-v2-europe-globe",
        navPointName: "Europe",
      },
      contentBlock({
        key: "home-v2-cases-intro",
        title: "Work that earns its place in a case study.",
        paragraphs: homepageCopy.cases,
        navPointName: "Selected work",
        span: "10",
      }),
      casesGallery("home-v2-cases"),
      {
        ...homeClientLogos,
        _key: "home-v2-client-logos",
        eyebrow: "Selected clients",
        headline: "Trusted where retail happens.",
        navPointName: "Clients",
      },
      contactCta(
        "home-v2-contact",
        "Make your brand impossible to ignore.",
        "Tell us where retail needs to work harder. We'll bring the strategy, people and systems to make it happen.",
      ),
    ],
  };

  const servicesPage = {
    _id: `drafts.${ids.servicesV2}`,
    _type: "page",
    language: "en",
    title: "FLZR Services v2",
    slug: { _type: "slug", current: "services-v2" },
    isHomepage: false,
    channel: "flizrWeb",
    navbarVariant: "light",
    metadata: {
      _type: "metadata",
      title: "FLZR Services | Retail Marketing, Field Teams & Retail Intelligence",
      description: "Eight integrated FLZR services for European market entry, retail execution, live advice, field teams, training, promotion and predictive analytics.",
      keywords: ["retail services", "sales force", "PoS management", "retail analytics"],
      excludeFromSitemap: true,
    },
    content: [
      headerBlock({
        key: "services-v2-hero",
        media: goToMarketVideo,
        eyebrow: "FLZR Services",
        seoTitle: "FLZR Services — eight integrated retail marketing disciplines",
        headline: "FLZR.\nReal presence. Real results. At the point of sale.",
        support: "Eight disciplines. One partner. Europe-wide.",
        cta: internalCta("Talk to FLZR", ids.contactPage),
      }),
      contentBlock({
        key: "services-v2-intro",
        title: "Eight specialist services. One integrated retail partner.",
        paragraphs: [
          "From market entry strategy and retail sales teams to live video consulting and predictive analytics, every FLZR discipline is designed to work on its own — and deliver more when connected.",
        ],
        navPointName: "Services",
        span: "10",
        padding: "24",
      }),
      {
        _key: "services-v2-gallery",
        _type: "servicesGalleryFiltered",
        navPointName: "Services",
        hideFromNav: false,
        showFilters: false,
        showGridBackground: false,
        backgroundColor: "neutral-100",
        paddingY: "32",
      },
      contentBlock({
        key: "services-v2-model",
        title: "Strategy, people, execution and intelligence — connected.",
        paragraphs: [
          "FLZR combines market knowledge, trained field teams, precise retail execution and live performance data in one delivery model. That means fewer handoffs, faster decisions and a consistent brand standard from strategy to shelf.",
        ],
        navPointName: "Integrated delivery",
        span: "10",
      }),
      casesGallery("services-v2-cases"),
      contactCta(
        "services-v2-contact",
        "Build the right retail service mix.",
        "Bring us the market, campaign or sales challenge. We'll connect the FLZR disciplines that move it forward.",
      ),
    ],
  };

  const agencyPage = {
    _id: `drafts.${ids.agencyV2}`,
    _type: "page",
    language: "en",
    title: "FLZR Agency v2",
    slug: { _type: "slug", current: "agency-v2" },
    isHomepage: false,
    channel: "flizrWeb",
    navbarVariant: "light",
    metadata: {
      _type: "metadata",
      title: "FLZR Agency | Retail Marketing at the Point of Sale",
      description: "Meet FLZR, a European retail marketing agency combining field teams, brand experiences, live performance data and end-to-end campaign delivery.",
      keywords: ["FLZR agency", "field marketing agency Europe", "point of sale agency"],
      excludeFromSitemap: true,
    },
    content: [
      headerBlock({
        key: "agency-v2-hero",
        media: agencyHero,
        eyebrow: "FLZR Agency",
        seoTitle: "FLZR Agency — 420 specialists, one shared goal",
        headline: "FLZR.\n420 specialists. One shared goal.",
        support: "Making your brand impossible to ignore at the point of sale.",
        cta: internalCta("Meet FLZR", ids.contactPage),
      }),
      twoColBlock({
        key: "agency-v2-about",
        title: "About FLZR",
        copy: agencyCopy.about,
        asset: homeHero,
        useVideo: true,
        alt: "FLZR retail specialists working across customer, digital and point-of-sale contexts.",
        padding: "24",
      }),
      {
        _key: "agency-v2-numbers",
        _type: "resultsMetrics",
        navPointName: "FLZR in numbers",
        hideFromNav: false,
        title: "FLZR in numbers",
        metrics: [
          { _key: "agency-years", _type: "metric", type: "animatedNumber", value: 20, suffix: "+", label: "Years at the point of sale" },
          { _key: "agency-team", _type: "metric", type: "animatedNumber", value: 420, label: "Team members" },
          { _key: "agency-field", _type: "metric", type: "animatedNumber", value: 24000, suffix: "+", label: "Field professionals" },
          { _key: "agency-campaigns", _type: "metric", type: "animatedNumber", value: 1000, suffix: "s", label: "Campaigns delivered" },
        ],
        backgroundImage: agencyMetricsImage,
        backgroundOpacity: 0.7,
        enableParallax: false,
        fullWidth: false,
        paddingY: "32",
      },
      {
        _key: "agency-v2-philosophy-intro",
        _type: "introBlockTypoSophisticated",
        navPointName: "Philosophy",
        hideFromNav: false,
        header: {
          _type: "peopleStepHeader",
          superText: "Philosophy",
          mainHeadline: "How we think and work.",
        },
      },
      twoColBlock({
        key: "agency-v2-belief",
        title: "Our belief",
        copy: agencyCopy.belief,
        asset: adobeTech,
        useVideo: false,
        alt: "A technology-led retail context supporting an integrated customer journey.",
        background: "neutral-100",
      }),
      twoColBlock({
        key: "agency-v2-how-we-work",
        title: "How we work",
        copy: agencyCopy.howWeWork,
        asset: adobeData,
        useVideo: false,
        alt: "Customer and performance data visualised on a mobile device.",
        reverse: true,
      }),
      twoColBlock({
        key: "agency-v2-sets-apart",
        title: "What sets us apart",
        copy: agencyCopy.setsApart,
        asset: blackrollImage,
        useVideo: false,
        alt: "People and brand touchpoints working across a connected retail network.",
        background: "neutral-100",
      }),
      {
        _key: "agency-v2-team",
        _type: "galleryPeopleStep",
        navPointName: "Team FLZR",
        hideFromNav: false,
        header: {
          _type: "peopleStepHeader",
          superText: "Team FLZR",
          mainHeadline: "Built for the Front Line.",
          creativityTitle: "Different backgrounds.",
          uniquePeopleText: "Shared standards.",
        },
        description: agencyCopy.team,
        teamMembers: peopleIds.map((personId, index) =>
          ref(personId, `agency-person-${index + 1}`),
        ),
      },
      {
        _key: "agency-v2-careers",
        _type: "intertitleCTA",
        navPointName: "Careers",
        hideFromNav: false,
        title: "Come and do the work that moves product.",
        subline: "Field promoter. Brand merchandiser. Sales trainer. Omnichannel manager. Live video consultant.",
        subtitle: agencyCopy.careers,
        cta: externalCta("View open positions", "https://1sp-agency.jobs.personio.de/"),
        alignment: "left",
        paddingTop: "24",
      },
    ],
  };

  return [
    ...supersededServiceDrafts,
    ...newServices,
    sonyClient,
    o2Client,
    boseClient,
    sonyCase,
    o2Case,
    boseCase,
    homepage,
    servicesPage,
    agencyPage,
  ].map((document) => JSON.parse(JSON.stringify(document)));
}

function walkReferences(value, callback) {
  if (!value || typeof value !== "object") return;
  if (value._type === "reference" && value._ref) callback(value);
  for (const child of Object.values(value)) walkReferences(child, callback);
}

function validateDocuments(documents, currentServiceIds) {
  const documentIds = new Set();
  const allowedCaseBlocks = new Set([
    "headlineChallenge",
    "challengeAndSolution",
    "approachSection",
    "resultsMetrics",
  ]);
  for (const document of documents) {
    if (!document._id?.startsWith("drafts.")) {
      throw new Error(`Unsafe non-draft target: ${document._id}`);
    }
    if (documentIds.has(document._id)) throw new Error(`Duplicate target ID: ${document._id}`);
    documentIds.add(document._id);
    if (document._rev || document._createdAt || document._updatedAt || document._system) {
      throw new Error(`System fields leaked into ${document._id}.`);
    }
    walkReferences(document, (reference) => {
      if (reference._ref.startsWith("drafts.")) {
        throw new Error(`Draft-prefixed reference in ${document._id}: ${reference._ref}`);
      }
      const targetType = draftOnlyReferenceType(reference._ref);
      if (targetType) {
        if (
          reference._weak !== true ||
          reference._strengthenOnPublish?.type !== targetType
        ) {
          throw new Error(
            `Draft-only reference is not publish-safe in ${document._id}: ${reference._ref}`,
          );
        }
      } else if (reference._weak || reference._strengthenOnPublish) {
        throw new Error(`Unexpected weak reference in ${document._id}: ${reference._ref}`);
      }
    });
    if (document._type === "page") {
      if (document.channel !== "flizrWeb" || document.language !== "en") {
        throw new Error(`Unsafe page scope in ${document._id}.`);
      }
      if (document.isHomepage !== false) throw new Error(`Working page cannot be Homepage: ${document._id}`);
      if (document.metadata?.excludeFromSitemap !== true) {
        throw new Error(`Working page must be excluded from sitemap: ${document._id}`);
      }
      if (document.content?.some((block) => block._type === "block")) {
        throw new Error(`Top-level Portable Text block would be ignored on ${document._id}.`);
      }
    }
    if (document._type === "caseStudy") {
      if (document.language !== "en" || JSON.stringify(document.channel) !== '["flizrWeb"]') {
        throw new Error(`Unsafe Case scope in ${document._id}.`);
      }
      for (const block of document.casesPageBuilder || []) {
        if (!allowedCaseBlocks.has(block._type)) {
          throw new Error(`Unsupported Case block '${block._type}' in ${document._id}.`);
        }
      }
    }
  }

  const newServiceDraftIds = new Set(
    Object.values(serviceIds).map((id) => `drafts.${id}`),
  );
  for (const id of newServiceDraftIds) {
    const service = documents.find((document) => document._id === id);
    if (!service || JSON.stringify(service.channel) !== '["flizrWeb"]') {
      throw new Error(`Missing or incorrectly scoped FLZR-only service: ${id}`);
    }
    if (!service.deliverables?.length || !service.serviceBackground?.asset?.public_id) {
      throw new Error(`Incomplete FLZR-only service: ${id}`);
    }
  }
  for (const currentId of currentServiceIds) {
    const overlay = documents.find((document) => document._id === `drafts.${currentId}`);
    if (!overlay || overlay.channel?.includes("flizrWeb")) {
      throw new Error(`Superseded Service overlay still exposes flizrWeb: ${currentId}`);
    }
  }

  const expectedCount = currentServiceIds.length + 8 + 3 + 3 + 3;
  if (documents.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} draft documents, built ${documents.length}.`);
  }
}

async function main() {
  const homepageAgencySource = readDocxParagraphs(paths.homepageAgency);
  for (const requiredPhrase of [
    "Europe's specialist retail marketing agency.",
    "420 specialists. One shared goal.",
    "Team FLZR: Built for the Front Line.",
  ]) {
    if (!homepageAgencySource.includes(requiredPhrase)) {
      throw new Error(`Homepage/Agency source phrase not found: ${requiredPhrase}`);
    }
  }

  const source = await fetchSourceDocuments();
  const uploads = await resolveUploads();
  const parsedServices = parseServicesDoc(paths.services);
  const sonyCopy = parseCaseDoc(paths.sonyDoc);
  const o2Copy = parseCaseDoc(paths.o2Doc);
  const boseCopy = parseCaseDoc(paths.boseDoc);
  const documents = buildDocuments({
    source,
    uploads,
    parsedServices,
    sonyCopy,
    o2Copy,
    boseCopy,
  });
  validateDocuments(documents, source.services.map((service) => service._id));

  const summary = {
    mode: APPLY ? "apply" : "dry-run",
    projectId: env.projectId,
    dataset: env.dataset,
    sourceServicesReplacedForFlzr: source.services.length,
    newFlzrOnlyServices: parsedServices.length,
    pageDrafts: documents.filter((document) => document._type === "page").map((document) => document._id),
    caseDrafts: documents.filter((document) => document._type === "caseStudy").map((document) => document._id),
    clientDrafts: documents.filter((document) => document._type === "client").map((document) => document._id),
    uploadedMedia: uploadSpecs.map((spec) => ({ key: spec.key, publicId: spec.publicId })),
    totalDraftDocuments: documents.length,
  };

  if (!APPLY) {
    console.log("FLZR content draft dry-run passed. No CMS or Cloudinary writes were made.");
    console.log(JSON.stringify(summary, null, 2));
    console.log(
      "Run with --apply only after reviewing this plan. If the env write token is stale, use the authenticated Sanity CLI wrapper documented beside this script.",
    );
    return;
  }

  let transaction = client.transaction();
  for (const document of documents) transaction = transaction.createOrReplace(document);
  const mutation = await transaction.commit({ tag: "flzr.content-drafts.2026-08-06" });

  const targetIds = documents.map((document) => document._id);
  const verified = await client.withConfig({ perspective: "raw" }).fetch(
    `*[_id in $ids]{_id, _type, language, channel, title, name, "slug": slug.current, isHomepage, "excluded": metadata.excludeFromSitemap}`,
    { ids: targetIds },
  );
  const verifiedIds = new Set(verified.map((document) => document._id));
  const missing = targetIds.filter((id) => !verifiedIds.has(id));
  if (missing.length) {
    throw new Error(`Mutation committed but verification missed: ${missing.join(", ")}`);
  }

  console.log("FLZR content drafts created successfully.");
  console.log(
    JSON.stringify(
      {
        ...summary,
        transactionId: mutation.transactionId,
        verifiedDrafts: verified.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
