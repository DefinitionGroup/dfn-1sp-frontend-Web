import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { HOME_PAGE_QUERY, PAGE_QUERY } from '../packages/sanity-queries/src/groq';
import { ctaToButtonProps } from '../packages/utils/src/cloudinary';
import carouselItem from '../packages/sanity-schema/src/1SP/Items/carouselItem';

const require = createRequire(import.meta.url);
const sanityRequire = createRequire(require.resolve('sanity/package.json'));
const { parse, evaluate } = sanityRequire('groq-js');
const slide = {
  _type: 'carouselItem', id: 1, title: 'Campaign',
  image: { secure_url: 'https://example.com/poster.jpg' },
  video: { secure_url: 'https://example.com/campaign.mp4' },
  cta: { text: 'Read the story', link: { linkType: 'internal', page: { _type: 'reference', _ref: 'destination' } } },
};
const carousel = { _type: 'carousel', items: [slide, { ...slide, id: 2, cta: undefined }] };
const dataset = [
  { _id: 'destination', _type: 'page', slug: { current: 'story' } },
  { _id: 'group', _type: 'oneSpComponentGroup', content: [carousel] },
  { _id: 'home', _type: 'page', channel: 'renaissanceWeb', language: 'en', isHomepage: true,
    slug: { current: 'home' }, content: [carousel, { _type: 'oneSpComponentGroupReference', group: { _type: 'reference', _ref: 'group' } }] },
];

for (const [name, query] of [['homepage', HOME_PAGE_QUERY], ['page', PAGE_QUERY]]) {
  test(`${name} resolves slide page links and preserves both media in direct and grouped carousels`, async () => {
    const result = await (await evaluate(parse(query), { dataset, params: { channel: 'renaissanceWeb', language: 'en', slug: 'home' } })).get();
    for (const block of [result.content[0], result.content[1].group.content[0]]) {
      assert.equal(block.items[0].video.secure_url, slide.video.secure_url);
      assert.equal(block.items[0].image.secure_url, slide.image.secure_url);
      assert.equal(ctaToButtonProps(block.items[0].cta)?.href, '/story');
      assert.equal(ctaToButtonProps(block.items[1].cta), null);
    }
  });
}

test('Studio slide fields expose optional video and the reusable page-link CTA', () => {
  assert.equal(carouselItem.fields.find(field => field.name === 'video')?.type, 'cloudinary.asset');
  assert.equal(carouselItem.fields.find(field => field.name === 'cta')?.type, 'cta');
});
