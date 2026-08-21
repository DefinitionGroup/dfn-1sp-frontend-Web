#!/usr/bin/env node

import { createClient } from "@sanity/client";

const APPLY = process.argv.includes("--apply");
const EXPECTED_PROJECT_ID = "wu6i3y0h";
const EXPECTED_DATASET = "dev-dataset";
const PAGE_ID = "msm-page-units-en";
const MENU_ID = "msm-menu-navbar-en";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function portableText(id, paragraphs) {
  return paragraphs.map((text, index) => ({
    _key: `${id}-p${index + 1}`,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: `${id}-p${index + 1}-span`, _type: "span", marks: [], text }],
  }));
}

const unitInput = [
  {
    id: "communications",
    name: "Communications",
    descriptor: "PR, social media & influencer campaigns",
    claim: "PR, social media & influencer campaigns",
    paragraphs: [
      "Our Communications unit is a melting pot of PR experts, social media strategists, and influencer specialists. We orchestrate integrated digital campaigns across the full channel mix — from earned media to owned social to paid influencer partnerships.",
      "We’ve worked with some of the biggest names in tech and entertainment: Amazon, Electronic Arts, Epic Games (Fortnite), Microsoft, Meta (Oculus), Warner Bros., Bandai Namco — and many more. We know how to build a story, create buzz, and sustain momentum over time.",
    ],
    capabilities: [
      "PR & media relations",
      "Social media management",
      "Influencer & creator partnerships",
      "Content creation",
      "Crisis communications",
      "Employer branding",
      "Event management",
    ],
    heroImageSource: "https://www.msm.digital/de/wp-content/uploads/2019/04/communications.jpg",
    heroAlt: "MSM Communications campaign team at work",
  },
  {
    id: "channel-marketing",
    name: "Channel Marketing",
    descriptor: "World-class consumer experience",
    claim: "World-class consumer experience",
    paragraphs: [
      "Our Channel Marketing unit has been specializing in trade marketing and customer experience for over a decade. We help brands maximize the ROI of their marketing spend by bridging the gap between digital and physical retail.",
      "We know that the battle for attention happens at the shelf, on the screen, and in the moment of decision. So we design and execute everything from shop-in-shop installations to full retail transformation programs — making sure your brand stands out where it matters most.",
    ],
    capabilities: [
      "POS design & production",
      "Retail strategy",
      "Customer journey mapping",
      "Online & offline brand activation",
      "Digital signage (Skreeens)",
      "Cashback campaigns",
      "Review management",
      "Marketing strategy",
    ],
    heroImageSource: "https://www.msm.digital/de/wp-content/uploads/2019/04/r_BPVFGi-e1623652159575.jpeg",
    heroAlt: "Retail and customer experience installation by MSM Channel Marketing",
  },
  {
    id: "xr-labs",
    name: "XR Labs",
    descriptor: "AR, VR, MR & AI Glasses",
    claim: "Extended Reality. Real results.",
    paragraphs: [
      "Our XR Labs unit builds immersive experiences across the full extended reality spectrum: augmented reality (AR), virtual reality (VR), mixed reality (MR), and the emerging frontier of AI-powered smart glasses solutions. We don’t just demo technology — we design experiences that solve real business problems and drive measurable outcomes.",
      "From AR product try-ons at retail to MR factory training, from VR brand showrooms to AI glasses deployments in the field — we work across every form of spatial computing. Backed by our creative studio CADLaif in North Macedonia (active since 2010), we take XR projects from concept to deployment entirely in-house. Clients including Lufthansa, Electrolux, Migros, and Lenovo trust us to bring their most ambitious immersive ideas to life.",
    ],
    capabilities: [
      "AR product experiences & try-ons",
      "VR training & virtual showrooms",
      "Mixed reality for retail and manufacturing",
      "AI glasses solutions for field service & enterprise",
      "AR-Link (at-home product visualization)",
      "Print enrichment with AR",
      "Immersive brand activations",
    ],
    heroImageSource: "https://www.msm.digital/de/wp-content/uploads/2020/03/whale.jpg",
    heroAlt: "Immersive extended reality experience created by MSM XR Labs",
  },
  {
    id: "technology-systems",
    name: "Technology Systems",
    descriptor: "Custom software. Built to last.",
    claim: "Custom software. Built to last.",
    paragraphs: [
      "Our Technology Systems unit transforms ideas into smart, scalable software products. We build marketing applications that enhance brand productivity, identity, and recognition — combining local strategic insight with globally distributed engineering talent.",
      "Our development team is headquartered in Pune, India: a group of highly skilled engineers who follow agile principles and genuinely love what they build. Working alongside our German team, they deliver across the full spectrum of web and mobile.",
    ],
    capabilities: [
      "Web & app development",
      "Custom marketing platforms",
      "Digital shop-in-shop solutions",
      "E-commerce integrations",
      "Review management systems",
      "Digital signage software",
      "eLearning platforms",
    ],
    heroImageSource: "https://www.msm.digital/de/wp-content/uploads/2019/04/technology-systems.jpg",
    heroAlt: "Software engineering at MSM Technology Systems",
  },
];

const units = unitInput.map((unit, index) => ({
  _id: `msm-unit-${unit.id}-en`,
  _type: "msmUnit",
  language: "en",
  name: unit.name,
  slug: { _type: "slug", current: unit.id },
  descriptor: unit.descriptor,
  claim: unit.claim,
  body: portableText(unit.id, unit.paragraphs),
  capabilities: unit.capabilities,
  heroImageSource: unit.heroImageSource,
  heroAlt: unit.heroAlt,
  caseStudies: [],
  leadership: [],
  sortOrder: (index + 1) * 10,
  isActive: true,
  metadata: {
    title: `${unit.name} | MSM.digital`,
    description: unit.paragraphs[0].slice(0, 158),
  },
}));

const page = {
  _id: PAGE_ID,
  _type: "page",
  language: "en",
  channel: "msmWeb",
  title: "Units",
  slug: { _type: "slug", current: "units" },
  isHomepage: false,
  navbarVariant: "light",
  metadata: {
    title: "Our Units | MSM.digital",
    description: "Four specialist business units covering every major touchpoint of the modern customer journey.",
  },
  content: [
    {
      _key: "msm-units-overview",
      _type: "msmUnitsGrid",
      eyebrow: "OUR UNITS",
      headline: "Four units. One goal.",
      intro: "MSM.digital is structured around four specialist business units. Each one has its own identity, expertise, and leadership team. Together, they cover every major touchpoint of the modern customer journey.",
      selectionMode: "auto",
    },
  ],
};

const env = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-09-16",
  token: process.env.SANITY_API_WRITE_TOKEN,
};

assert(
  env.projectId === EXPECTED_PROJECT_ID && env.dataset === EXPECTED_DATASET,
  `Refusing to run outside ${EXPECTED_PROJECT_ID}/${EXPECTED_DATASET}.`,
);
assert(env.token, "SANITY_API_WRITE_TOKEN is required.");

const client = createClient({ ...env, useCdn: false, perspective: "raw" });

async function main() {
  const ids = [...units.map((unit) => unit._id), PAGE_ID, MENU_ID];
  const existing = await client.fetch(`*[_id in $ids || _id in $draftIds]{_id,_rev,_type,menuItems}`, {
    ids,
    draftIds: ids.map((id) => `drafts.${id}`),
  });
  const drafts = existing.filter((document) => document._id.startsWith("drafts."));
  assert(drafts.length === 0, `Refusing to continue with active drafts: ${drafts.map((draft) => draft._id).join(", ")}`);

  const menu = existing.find((document) => document._id === MENU_ID);
  assert(menu?._type === "menu", `Navigation document ${MENU_ID} was not found.`);

  let transaction = client.transaction();
  for (const unit of units) transaction = transaction.createIfNotExists(unit);
  transaction = transaction.createIfNotExists(page);

  const hasUnitsItem = (menu.menuItems || []).some((item) => item?.page?._ref === PAGE_ID);
  if (!hasUnitsItem) {
    transaction = transaction.patch(MENU_ID, (patch) =>
      patch.ifRevisionId(menu._rev).append("menuItems", [
        { _key: "mi-units", _type: "object", displayName: "Units", page: { _type: "reference", _ref: PAGE_ID } },
      ]),
    );
  }

  const result = await transaction.commit({
    dryRun: !APPLY,
    returnDocuments: false,
    visibility: "sync",
    tag: APPLY ? "msm.units.seed.apply.2026-08-19" : "msm.units.seed.dry-run.2026-08-19",
  });

  if (APPLY) {
    const verification = await client.fetch(
      `{
        "units": *[_type == "msmUnit" && language == "en"] | order(sortOrder asc){_id,name,"slug":slug.current},
        "page": *[_id == $pageId][0]{_id,title,"slug":slug.current,content[]{_type}},
        "menuHasUnits": count(*[_id == $menuId && $pageId in menuItems[].page._ref]) > 0
      }`,
      { pageId: PAGE_ID, menuId: MENU_ID },
    );
    assert(verification.units.length === 4, "Expected four English MSM Units after publish.");
    assert(verification.page?.slug === "units", "Units page verification failed.");
    assert(verification.menuHasUnits, "Units navigation item verification failed.");
    console.log(JSON.stringify({ mode: "applied", verification }, null, 2));
  } else {
    console.log(JSON.stringify({ mode: "dry-run", createdUnitIds: units.map((unit) => unit._id), pageId: PAGE_ID, menuAppend: !hasUnitsItem, transactionId: result.transactionId }, null, 2));
  }
}

await main();
