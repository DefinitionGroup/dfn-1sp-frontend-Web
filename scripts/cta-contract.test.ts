import assert from "node:assert/strict";
import test from "node:test";
import { createSchema, validateDocument } from "sanity";
import { schema as schemaDefinitions } from "../packages/sanity-schema/src/index";
import * as ctaRuntime from "../packages/utils/src/cloudinary";

const compiledSchema = createSchema({
  name: "cta-contract-test",
  types: [
    {
      name: "cloudinary.asset",
      type: "object",
      fields: [{ name: "public_id", type: "string" }],
    },
    ...schemaDefinitions.types,
  ],
});

const client = { fetch: async () => null };
const i18n = {
  loadNamespaces: async () => undefined,
  t: (key: string, options?: { defaultValue?: string }) =>
    options?.defaultValue || key,
};

function pageWithBlock(
  block: Record<string, unknown>,
  channel = "flizrWeb",
) {
  return {
    _id: "cta-contract-page",
    _type: "page",
    _rev: "fixture",
    _createdAt: "2026-08-11T00:00:00Z",
    _updatedAt: "2026-08-11T00:00:00Z",
    language: "en",
    title: "CTA contract fixture",
    slug: { _type: "slug", current: "cta-contract-fixture" },
    channel,
    content: [{ _key: "fixture-block", ...block }],
  };
}

async function validateFixture(document: ReturnType<typeof pageWithBlock>) {
  return validateDocument({
    document,
    workspace: {
      schema: compiledSchema,
      i18n,
      getClient: () => client,
    } as any,
    getDocumentExists: async () => true,
    getClient: () => client as any,
  });
}

test("a website-hidden empty mini CTA does not block publishing", async () => {
  const markers = await validateFixture(
    pageWithBlock({
      _type: "galleryPeopleStep",
      showBadgeMiniCta: false,
      badgeMiniCta: { _type: "ctaMiniComponent" },
    }),
  );

  assert.deepEqual(markers, []);
});

test("an empty CTA is publishable but a partially configured enabled CTA is not", async () => {
  const emptyMarkers = await validateFixture(
    pageWithBlock({
      _type: "servicesHeroWithBadge",
      title: "Services",
      showCta: true,
      cta: {
        _type: "ctaMiniComponent",
        link: { _type: "link", linkType: "internal" },
      },
    }),
  );
  const partialMarkers = await validateFixture(
    pageWithBlock({
      _type: "servicesHeroWithBadge",
      title: "Services",
      showCta: true,
      cta: { _type: "ctaMiniComponent", heading: "Start here" },
    }),
  );

  assert.deepEqual(emptyMarkers, []);
  assert.ok(partialMarkers.some((marker) => marker.level === "error"));
});

test("disabled partial CTA content is preserved without blocking publishing", async () => {
  const markers = await validateFixture(
    pageWithBlock({
      _type: "servicesHeroWithBadge",
      title: "Services",
      showCta: false,
      cta: { _type: "ctaMiniComponent", heading: "Saved for later" },
    }),
  );

  assert.deepEqual(markers, []);
});

test("empty actions normalize to null instead of a hash link", () => {
  assert.equal(ctaRuntime.ctaToButtonProps({}), null);
  assert.equal(ctaRuntime.ctaToButtonProps({ text: "Incomplete" }), null);
  assert.equal(ctaRuntime.getRenderableCtaMini({}), null);
});

test("complete actions keep their label, destination, and variant", () => {
  assert.deepEqual(
    ctaRuntime.ctaToButtonProps({
      text: "Contact us",
      link: { linkType: "external", externalUrl: "https://example.com/contact" },
      variant: "black",
    }),
    {
      text: "Contact us",
      href: "https://example.com/contact",
      variant: "black",
    },
  );

  assert.deepEqual(
    ctaRuntime.getRenderableCtaMini({
      heading: "Start a project",
      paragraph: "Tell us what you are building.",
      buttonText: "Get in touch",
      link: { linkType: "internal", page: { slug: { current: "contact" } } },
      variant: "violetsmall",
      alignment: "right",
    }),
    {
      heading: "Start a project",
      paragraph: "Tell us what you are building.",
      buttonText: "Get in touch",
      href: "/contact",
      variant: "violetsmall",
      alignment: "right",
    },
  );
});

test("published 1SP headingless mini CTAs remain valid and renderable", async () => {
  const fixtures = [
    {
      block: {
        _type: "galleryScrollHighlightStep",
        useCTAMini: true,
        ctaMini: {
          _type: "ctaMiniComponent",
          heading: " ",
          buttonText: "All Services",
          link: {
            _type: "link",
            linkType: "internal",
            page: { _type: "reference", _ref: "services-page" },
          },
        },
      },
      buttonText: "All Services",
      slug: "services",
    },
    {
      block: {
        _type: "galleryListStep",
        showBadgeMiniCta: true,
        badgeMiniCta: {
          _type: "ctaMiniComponent",
          heading: " ",
          buttonText: "House of Agencies",
          link: {
            _type: "link",
            linkType: "internal",
            page: { _type: "reference", _ref: "agencies-page" },
          },
        },
      },
      buttonText: "House of Agencies",
      slug: "house-of-agencies",
    },
    {
      block: {
        _type: "galleryPeopleStep",
        showBadgeMiniCta: true,
        badgeMiniCta: {
          _type: "ctaMiniComponent",
          heading: " ",
          buttonText: "Our Specialists",
          link: {
            _type: "link",
            linkType: "internal",
            page: { _type: "reference", _ref: "agencies-page" },
          },
        },
      },
      buttonText: "Our Specialists",
      slug: "house-of-agencies",
    },
  ];

  for (const fixture of fixtures) {
    const markers = await validateFixture(pageWithBlock(fixture.block, "1spWeb"));
    assert.deepEqual(markers, []);

    const miniCta =
      (fixture.block as any).ctaMini || (fixture.block as any).badgeMiniCta;
    const runtimeCta = {
      ...miniCta,
      link: {
        ...miniCta.link,
        page: { slug: { current: fixture.slug } },
      },
    };
    assert.deepEqual(ctaRuntime.getRenderableCtaMini(runtimeCta), {
      heading: "",
      paragraph: "",
      buttonText: fixture.buttonText,
      href: `/${fixture.slug}`,
    });
  }
});
