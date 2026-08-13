import assert from "node:assert/strict";
import test from "node:test";
import {
  collectImportCandidates,
  copyBlocksForImport,
} from "../packages/sanity-schema/src/Global/oneSpComponentGroupImport.ts";
import {
  HOME_PAGE_QUERY,
  ONE_SP_COMPONENT_GROUP_PROJECTION,
} from "../packages/sanity-queries/src/groq.ts";

test("component import keeps supported 1SP blocks and preserves their order", () => {
  const sourceBlocks = [
    { _key: "header", _type: "oneSPHeader", headline: "Hello" },
    { _key: "portable", _type: "block", children: [] },
    { _key: "gallery", _type: "galleryPeopleStep", headline: "People" },
    { _key: "nested", _type: "oneSpComponentGroupReference" },
  ];

  const result = collectImportCandidates(sourceBlocks);

  assert.deepEqual(
    result.candidates.map((candidate) => candidate.selectionKey),
    ["header", "gallery"],
  );
  assert.deepEqual(
    result.candidates.map((candidate) => candidate.block._type),
    ["oneSPHeader", "galleryPeopleStep"],
  );
  assert.equal(result.unsupportedCount, 2);
});

test("imported components are independent editable copies with fresh keys", () => {
  const source = {
    _key: "source-key",
    _type: "intertitleCTA",
    title: "Original title",
    cta: {
      text: "Learn more",
      link: {
        _type: "reference",
        _ref: "page-id",
      },
    },
  };

  const [copy] = copyBlocksForImport([source], () => "new-import-key");

  assert.equal(copy._key, "new-import-key");
  assert.notStrictEqual(copy, source);
  assert.notStrictEqual(copy.cta, source.cta);
  assert.deepEqual(copy.cta, source.cta);

  copy.title = "Edited imported title";
  copy.cta.text = "Edited CTA";

  assert.equal(source.title, "Original title");
  assert.equal(source.cta.text, "Learn more");
  assert.equal(copy.cta.link._ref, "page-id");
});

test("components without Sanity keys receive stable selection identities", () => {
  const result = collectImportCandidates([
    { _type: "contentSection", title: "First" },
    { _type: "contentSection", title: "Second" },
  ]);

  assert.deepEqual(
    result.candidates.map((candidate) => candidate.selectionKey),
    ["contentSection-0", "contentSection-1"],
  );
});

test("reusable 1SP groups dereference explicit content without host-channel filters", () => {
  assert.equal(
    ONE_SP_COMPONENT_GROUP_PROJECTION.includes("$channel"),
    false,
    "the reusable group projection must not inherit the host page channel",
  );
  assert.match(ONE_SP_COMPONENT_GROUP_PROJECTION, /teamMembers\[\]->\{/);
  assert.match(ONE_SP_COMPONENT_GROUP_PROJECTION, /serviceItems\[\]->\{/);
  assert.equal(
    ONE_SP_COMPONENT_GROUP_PROJECTION.match(/selectedCases\[\]->\{/g)?.length,
    3,
  );
  assert.match(
    HOME_PAGE_QUERY,
    /isHomepage == true && channel == \$channel && language == \$language/,
    "the host homepage lookup must remain channel-scoped",
  );
});
