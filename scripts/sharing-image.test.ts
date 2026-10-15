import assert from "node:assert/strict";
import test from "node:test";

// @1sp/sanity-queries asserts these at import time; no request is made.
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= "test";
process.env.NEXT_PUBLIC_SANITY_DATASET ??= "test";
const load = () => import("../lib/sharing-image");

const CLOUDINARY = "https://res.cloudinary.com/dsu07dnes";

test("Cloudinary videos become a 1200x630 still frame", async () => {
  const { sharingImageUrl } = await load();
  const asset = {
    resource_type: "video",
    format: "mp4",
    secure_url: `${CLOUDINARY}/video/upload/v1773942965/Experiential_jzyg8p.mp4`,
  };
  const expected = `${CLOUDINARY}/video/upload/q_auto,f_auto,w_1200,h_630,c_fill,g_auto/q_auto,f_auto,so_0/v1773942965/Experiential_jzyg8p.jpg`;

  assert.equal(sharingImageUrl(asset), expected);
  assert.equal(sharingImageUrl({ asset }), expected);
  assert.equal(sharingImageUrl(asset.secure_url), expected);
});

test("Image URLs are cropped to 1200x630", async () => {
  const { sharingImageUrl } = await load();
  assert.equal(
    sharingImageUrl(`${CLOUDINARY}/image/upload/v1786467747/case.png`),
    `${CLOUDINARY}/image/upload/q_auto,f_auto,w_1200,h_630,c_fill,g_auto/v1786467747/case.png`,
  );
});

test("Pages without a usable image fall back to the 1SP default", async () => {
  const { DEFAULT_SHARING_IMAGE_URL, sharingImages, sharingImageUrl } = await load();
  assert.equal(sharingImageUrl(undefined), undefined);
  assert.equal(sharingImageUrl("https://example.com/clip.mp4"), undefined);
  assert.deepEqual(sharingImages(undefined, "Contact"), [
    { url: DEFAULT_SHARING_IMAGE_URL, width: 1200, height: 630, alt: "Contact" },
  ]);
  assert.equal(
    sharingImages({ secure_url: "https://example.com/clip.mp4" })[0].url,
    DEFAULT_SHARING_IMAGE_URL,
  );
});
