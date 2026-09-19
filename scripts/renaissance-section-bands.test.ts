import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

import { RENAISSANCE_HOMEPAGE_FALLBACK } from "../apps/renaissance-web/data/homepageFallback";
import { resolveRenaissanceIntroLayout } from "../apps/renaissance-web/lib/renaissanceIntroLayout";
import { partitionRenaissanceSections } from "../apps/renaissance-web/lib/renaissanceSections";

const require = createRequire(import.meta.url);
const { vercelStegaCombine } = createRequire(require.resolve("@sanity/client"))("@vercel/stega");
const previewValue = <T extends string>(value: T): T =>
  vercelStegaCombine(value, { origin: "sanity.io", href: "http://localhost:3000/studio" }, false);

const block = (_type: string, _key: string) => ({ _type, _key });
type MarkerOptions = {
  desktopTopMargin?: "none" | "8" | "16" | "24";
  topBorder?: boolean;
  badgeAnimationMode?: "once" | "loop";
  carouselBackgroundTone?: "darkGreen" | "light";
};

const marker = (
  _key: string,
  sectionRole: "stories" | "services" | "people" | "origins" | "reach" | "joinUs" = "stories",
  mode: "section" | "reset" = "section",
  options: MarkerOptions = {},
) => ({
  _type: "renaissanceSectionBand",
  _key,
  mode,
  sectionRole,
  badgeLabel: sectionRole.toUpperCase(),
  ...options,
});

test("defaults Stories, Services and People intros to compact without a Sanity override", () => {
  assert.equal(
    resolveRenaissanceIntroLayout(undefined, "stories"),
    "compact",
  );
  assert.equal(
    resolveRenaissanceIntroLayout(undefined, "services"),
    "compact",
  );
  assert.equal(resolveRenaissanceIntroLayout(undefined, "people"), "compact");
});

test("lets Sanity override a Renaissance intro layout", () => {
  assert.equal(resolveRenaissanceIntroLayout("compact", "stories"), "compact");
  assert.equal(resolveRenaissanceIntroLayout("editorial", "stories"), "editorial");
  assert.equal(
    resolveRenaissanceIntroLayout("editorial", "services"),
    "editorial",
  );
});

test("keeps unframed blocks in their stored order", () => {
  const units = partitionRenaissanceSections([
    block("heroShowTime", "hero"),
    block("oneSpComponentGroupReference", "network"),
  ]);

  assert.deepEqual(
    units.map((unit) => [unit.kind, unit.key]),
    [
      ["block", "hero"],
      ["block", "network"],
    ],
  );
});

test("groups explicit markers and respects reset markers", () => {
  const units = partitionRenaissanceSections([
    block("heroShowTime", "hero"),
    marker("stories"),
    block("introBlockTypoSophisticated", "intro"),
    block("carousel", "carousel"),
    marker("reset", "stories", "reset"),
    block("oneSpComponentGroupReference", "network"),
  ]);

  assert.deepEqual(
    units.map((unit) => [unit.kind, unit.key]),
    [
      ["block", "hero"],
      ["section", "stories"],
      ["block", "network"],
    ],
  );
});

test("preview metadata preserves every section role and reset boundary", () => {
  const roles = ["stories", "services", "people", "origins", "reach", "joinUs"] as const;
  const encodedLabel = previewValue("ORIGINS");
  const content = roles.flatMap((role) => [
    {
      ...marker(role, role),
      sectionRole: previewValue(role),
      mode: previewValue("section" as const),
      desktopTopMargin: previewValue("24" as const),
      badgeAnimationMode: previewValue("loop" as const),
      carouselBackgroundTone: previewValue("light" as const),
      badgeLabel: encodedLabel,
    },
    block("introBlockTypoSophisticated", `${role}-intro`),
  ]);
  const units = partitionRenaissanceSections([
    ...content,
    { ...marker("reset", "stories", "reset"), mode: previewValue("reset" as const) },
    block("oneSpComponentGroupReference", "network"),
  ]);
  assert.equal(units.length, roles.length + 1);
  roles.forEach((role, index) => {
    const unit = units[index];
    assert.equal(unit.kind, "section");
    if (unit.kind !== "section") return;
    assert.equal(unit.marker.sectionRole, role, "the frame and role-specific renderers need a plain lookup key");
    assert.equal(unit.marker.mode, "section");
    assert.equal(unit.marker.desktopTopMargin, "24");
    assert.equal(unit.marker.badgeAnimationMode, "loop");
    assert.equal(unit.marker.carouselBackgroundTone, "light");
    assert.equal(unit.marker.badgeLabel, encodedLabel, "editorial text keeps its visual-editing metadata");
  });
  assert.equal(units.at(-1)?.kind, "block", "preview reset must close the preceding section");
  const inputMarker = content[0];
  assert.ok("sectionRole" in inputMarker);
  assert.notEqual(inputMarker.sectionRole, roles[0], "partitioning must not mutate source content");
});

test("preserves optional section presentation settings", () => {
  const units = partitionRenaissanceSections([
    marker("stories", "stories", "section", {
      desktopTopMargin: "16",
      topBorder: true,
      badgeAnimationMode: "loop",
      carouselBackgroundTone: "light",
    }),
    block("carousel", "carousel"),
  ]);

  const section = units[0];
  assert.ok(section && section.kind === "section");
  assert.equal(section.marker.desktopTopMargin, "16");
  assert.equal(section.marker.topBorder, true);
  assert.equal(section.marker.badgeAnimationMode, "loop");
  assert.equal(section.marker.carouselBackgroundTone, "light");
});

test("keeps fallback service cards inside the services band", () => {
  const units = partitionRenaissanceSections(RENAISSANCE_HOMEPAGE_FALLBACK);
  const services = units.find(
    (unit) => unit.kind === "section" && unit.marker.sectionRole === "services",
  );
  const people = units.find(
    (unit) => unit.kind === "section" && unit.marker.sectionRole === "people",
  );

  assert.ok(services && services.kind === "section");
  assert.ok(people && people.kind === "section");
  assert.deepEqual(
    services.blocks.map(({ block: serviceBlock }) => serviceBlock._key),
    [
      "renaissance-services-intro",
      "renaissance-services",
      "renaissance-client-logos",
    ],
  );
  assert.deepEqual(
    people.blocks.map(({ block: peopleBlock }) => peopleBlock._key),
    [
      "renaissance-people-intro",
      "renaissance-people-portraits",
      "renaissance-award-wall",
    ],
  );
});

test("composes the fallback Join Us section from one register block", () => {
  const units = partitionRenaissanceSections(RENAISSANCE_HOMEPAGE_FALLBACK);
  const joinUs = units.find(
    (unit) => unit.kind === "section" && unit.marker.sectionRole === "joinUs",
  );

  assert.ok(joinUs && joinUs.kind === "section");
  assert.deepEqual(
    joinUs.blocks.map(({ block: joinBlock }) => joinBlock._type),
    ["registerBlock"],
  );

  const register = joinUs.blocks[0]?.block as {
    headline?: string;
    description?: string;
    cards?: Array<{ text?: string; link?: { externalUrl?: string } }>;
  };
  assert.equal(joinUs.marker.desktopTopMargin, "none");
  assert.equal(register.headline, "Cover our clients' games first");
  assert.match(register.description ?? "", /content creator/i);
  assert.deepEqual(
    register.cards?.map((card) => [card.text, card.link?.externalUrl]),
    [
      ["Content creators", "/contact#registration"],
      ["Media", "/contact#registration"],
    ],
  );
});

test("keeps the published people proof compatible until composable blocks are added", () => {
  const publishedUnits = partitionRenaissanceSections([
    marker("people", "people"),
    block("introBlockTypoSophisticated", "renaissance-people-intro"),
    marker("origins", "origins"),
    block("twoColContentSection", "renaissance-origin"),
  ]);
  const publishedPeople = publishedUnits.find(
    (unit) => unit.kind === "section" && unit.marker.sectionRole === "people",
  );
  assert.ok(publishedPeople && publishedPeople.kind === "section");
  assert.equal(
    publishedPeople.blocks.some(({ block: peopleBlock }) =>
      ["renaissancePortraitGrid", "renaissanceAwardLogoWall"].includes(
        peopleBlock._type || "",
      ),
    ),
    false,
  );

  const fallbackUnits = partitionRenaissanceSections(RENAISSANCE_HOMEPAGE_FALLBACK);
  const fallbackPeople = fallbackUnits.find(
    (unit) => unit.kind === "section" && unit.marker.sectionRole === "people",
  );
  assert.ok(fallbackPeople && fallbackPeople.kind === "section");
  assert.equal(
    fallbackPeople.blocks.some(
      ({ block: peopleBlock }) =>
        peopleBlock._type === "renaissancePortraitGrid",
    ),
    true,
  );
  assert.equal(
    fallbackPeople.blocks.some(
      ({ block: peopleBlock }) =>
        peopleBlock._type === "renaissanceAwardLogoWall",
    ),
    true,
  );
  const portraitGrid = fallbackPeople.blocks.find(
    ({ block: peopleBlock }) =>
      peopleBlock._type === "renaissancePortraitGrid",
  )?.block as { portraits?: unknown[] } | undefined;
  assert.equal(portraitGrid?.portraits?.length, 5);
});

test("infers the current published homepage bands until markers are published", () => {
  const units = partitionRenaissanceSections([
    block("heroShowTime", "renaissance-home-hero"),
    block("introBlockTypoSophisticated", "renaissance-stories-intro"),
    block("carousel", "renaissance-stories"),
    block("clientLogoCarousel", "renaissance-client-logos"),
    block("introBlockTypoSophisticated", "renaissance-services-intro"),
    block("cardContainerComponent", "renaissance-services"),
    block("intertitleCTA", "renaissance-contact"),
    block("intertitleCTA", "renaissance-family"),
    block("oneSpComponentGroupReference", "193b45cc9015"),
  ]);

  assert.deepEqual(
    units.map((unit) =>
      unit.kind === "section"
        ? [unit.kind, unit.marker.sectionRole, unit.blocks.length]
        : [unit.kind, unit.key],
    ),
    [
      ["block", "renaissance-home-hero"],
      ["section", "stories", 2],
      ["section", "services", 3],
      ["section", "joinUs", 1],
      ["block", "renaissance-family"],
      ["block", "193b45cc9015"],
    ],
  );

  const services = units.find(
    (unit) => unit.kind === "section" && unit.marker.sectionRole === "services",
  );
  assert.ok(services && services.kind === "section");
  assert.deepEqual(
    services.blocks.map(({ block: serviceBlock }) => serviceBlock._key),
    [
      "renaissance-services-intro",
      "renaissance-services",
      "renaissance-client-logos",
    ],
  );
});
