import assert from "node:assert/strict";
import test from "node:test";

import { RENAISSANCE_HOMEPAGE_FALLBACK } from "../apps/renaissance-web/data/homepageFallback";
import { partitionRenaissanceSections } from "../apps/renaissance-web/lib/renaissanceSections";

const block = (_type: string, _key: string) => ({ _type, _key });
const marker = (
  _key: string,
  sectionRole: "stories" | "services" | "people" | "origins" | "reach" | "joinUs" = "stories",
  mode: "section" | "reset" = "section",
) => ({
  _type: "renaissanceSectionBand",
  _key,
  mode,
  sectionRole,
  badgeLabel: sectionRole.toUpperCase(),
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
    ["renaissance-people-intro"],
  );
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
