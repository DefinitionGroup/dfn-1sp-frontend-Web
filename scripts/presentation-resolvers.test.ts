import assert from "node:assert/strict";
import test from "node:test";
import type { WebsiteChannel } from "../packages/site-config/src/index.ts";
import { createPresentationResolvers } from "../sanity/presentation/resolve.ts";

const CHANNELS: WebsiteChannel[] = [
  "1spWeb",
  "flizrWeb",
  "msmWeb",
  "renaissanceWeb",
];

test("each Presentation resolver pins pages and cases to its website channel", () => {
  for (const channel of CHANNELS) {
    const { mainDocuments } = createPresentationResolvers(channel);
    const documents = mainDocuments as any[];
    const homepage = documents.find((resolver) => resolver.route === "/");
    const caseStudy = documents.find(
      (resolver) => resolver.route === "/cases/:slug",
    );

    assert.equal(homepage.params.channel, channel);
    assert.match(homepage.filter, /channel == \$channel/);

    const caseParams = caseStudy.params({ params: { slug: "example" } });
    assert.equal(caseParams.channel, channel);
    assert.equal(caseParams.slug, "example");
    assert.match(caseStudy.filter, /\$channel in channel/);
  }
});

test("Renaissance locations are English and locale-free", () => {
  const { locations } = createPresentationResolvers("renaissanceWeb");
  const pageResolver = locations.page as any;
  const caseResolver = locations.caseStudy as any;

  assert.deepEqual(
    pageResolver.resolve({
      title: "Home",
      language: "en",
      channel: "renaissanceWeb",
      isHomepage: true,
    }),
    { locations: [{ title: "Home", href: "/" }] },
  );
  assert.deepEqual(
    pageResolver.resolve({
      title: "About",
      slug: "about",
      language: "en",
      channel: "renaissanceWeb",
    }),
    { locations: [{ title: "About", href: "/about" }] },
  );
  assert.deepEqual(
    caseResolver.resolve({
      title: "Case",
      slug: "case",
      language: "en",
      channel: ["renaissanceWeb"],
    }),
    { locations: [{ title: "Case", href: "/cases/case" }] },
  );
});

test("a site preview never offers a location for another channel", () => {
  const { locations } = createPresentationResolvers("renaissanceWeb");

  assert.deepEqual(
    (locations.page as any).resolve({
      title: "FLZR page",
      slug: "page",
      language: "en",
      channel: "flizrWeb",
    }),
    { locations: [] },
  );
  assert.deepEqual(
    (locations.caseStudy as any).resolve({
      title: "1SP case",
      slug: "case",
      language: "en",
      channel: ["1spWeb"],
    }),
    { locations: [] },
  );
});
