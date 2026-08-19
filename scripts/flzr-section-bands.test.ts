import assert from "node:assert/strict";
import test from "node:test";

import { partitionFlzrSectionBands } from "../apps/flzr-web/lib/flzrSectionBands";

const block = (_type: string, _key: string) => ({ _type, _key });
const marker = (
  _key: string,
  mode: "section" | "reset" = "section",
) => ({
  _type: "flzrSectionBand",
  _key,
  mode,
  surfaceTone: "fade" as const,
  showBadge: true,
  badgeNumber: "01",
  badgeLabel: "SERVICES",
});

test("keeps unframed blocks in their original order", () => {
  const units = partitionFlzrSectionBands([
    block("oneSPHeader", "header"),
    block("heroShowTime", "hero"),
  ]);

  assert.deepEqual(
    units.map((unit) => [unit.kind, unit.key]),
    [
      ["block", "header"],
      ["block", "hero"],
    ],
  );
});

test("groups following blocks until the next marker", () => {
  const units = partitionFlzrSectionBands([
    block("heroShowTime", "hero"),
    marker("services"),
    block("contentSection", "services-intro"),
    block("flzrServicesGrid", "services-grid"),
    marker("reach"),
    block("globeComponent", "globe"),
  ]);

  assert.equal(units.length, 3);
  assert.equal(units[0]?.kind, "block");
  assert.equal(units[1]?.kind, "section");
  assert.equal(units[2]?.kind, "section");

  if (units[1]?.kind === "section" && units[2]?.kind === "section") {
    assert.deepEqual(
      units[1].blocks.map(({ block: item }) => item._key),
      ["services-intro", "services-grid"],
    );
    assert.deepEqual(
      units[2].blocks.map(({ block: item }) => item._key),
      ["globe"],
    );
  }
});

test("reset markers return following blocks to unframed rendering", () => {
  const units = partitionFlzrSectionBands([
    marker("careers"),
    block("pageBuilderPersonioJobs", "jobs"),
    marker("reset", "reset"),
    block("oneSpComponentGroupReference", "one-sp-group"),
  ]);

  assert.deepEqual(
    units.map((unit) => [unit.kind, unit.key]),
    [
      ["section", "careers"],
      ["block", "one-sp-group"],
    ],
  );
});

test("ignores empty and consecutive section markers", () => {
  const units = partitionFlzrSectionBands([
    marker("empty"),
    marker("used"),
    block("contentSection", "content"),
    marker("final-empty"),
  ]);

  assert.equal(units.length, 1);
  assert.equal(units[0]?.kind, "section");
  assert.equal(units[0]?.key, "used");
});
