import assert from "node:assert/strict";
import test from "node:test";
import { getOriginsLogos } from "../apps/renaissance-web/lib/renaissanceOrigins";
import { RENAISSANCE_HOMEPAGE_FALLBACK } from "../apps/renaissance-web/data/homepageFallback";
import { getRenderableCta } from "../packages/utils/src/cta";

test("uses the CMS logo order, names and image replacements", () => {
  const logos = getOriginsLogos([
    { _key: "second", name: "Second", imageUrl: "/logos/second.png" },
    { _key: "first", name: "Changed name", image: { secure_url: "https://res.cloudinary.com/example/new.png" }, imageUrl: "/old.png" },
  ]);
  assert.deepEqual(logos, [
    { key: "second", src: "/logos/second.png", alt: "Second" },
    { key: "first", src: "https://res.cloudinary.com/example/new.png", alt: "Changed name" },
  ]);
});

test("deleting the saved logos never restores hardcoded client artwork", () => {
  assert.deepEqual(getOriginsLogos([]), []);
  assert.deepEqual(getOriginsLogos(undefined), []);
  assert.deepEqual(getOriginsLogos(null), []);
});

test("omits unfinished or invalid logos without broken images", () => {
  assert.deepEqual(getOriginsLogos([
    { name: "Missing image" },
    { imageUrl: "/missing-name.png" },
    { name: "Invalid", imageUrl: "javascript:alert(1)" },
    { name: "Protocol relative", imageUrl: "//example.com/image.png" },
  ]), []);
});

test("fallback carries the same explicit media and CTA contract as the CMS", () => {
  const origins = RENAISSANCE_HOMEPAGE_FALLBACK.find(block => block._key === "renaissance-origin") as any;
  assert.equal(origins.renaissanceMediaLayout, "logos");
  assert.equal(getOriginsLogos(origins.renaissanceLogos).length, 9);
  assert.deepEqual(getRenderableCta(origins.cta), { text: "Our story", href: "/about-us", variant: "violet" });
  assert.equal(getRenderableCta(undefined), null);
  assert.equal(getRenderableCta({ text: "Incomplete" }), null);
});
