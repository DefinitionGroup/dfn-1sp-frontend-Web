import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {HOME_PAGE_QUERY, PAGE_QUERY} from '../packages/sanity-queries/src/groq';
import {caseCarouselItems} from '../apps/renaissance-web/lib/caseCarousel';
import {createSchema, validateDocument} from 'sanity';
import {schema} from '../packages/sanity-schema/src';

const require = createRequire(import.meta.url);
const {parse, evaluate} = createRequire(require.resolve('sanity/package.json'))('groq-js');
const shared = {_id: 'case-a', _type: 'caseStudy', channel: ['renaissanceWeb', '1spWeb'], language: 'en', isPublished: true,
  title: 'Shared title', slug: {current: 'case-a'}, description: 'Shared description', mainImage: {secure_url: 'https://example.com/shared.jpg'}};
const edition = {channel: 'renaissanceWeb', title: 'Renaissance title', description: 'Renaissance description', subtitle: 'Games launch', mediaMode: 'custom', mainVideo: {secure_url: 'https://example.com/renaissance.mp4'}};
const second = {...shared, _id: 'case-b', slug: {current: 'case-b'}};
const page = {_id: 'page', _type: 'page', channel: 'renaissanceWeb', language: 'en', isHomepage: true, slug: {current: 'showcase'}, content: [
  {_type: 'renaissanceCaseCarousel', _key: 'carousel', selectedCases: [{_ref: 'case-b'}, {_ref: 'case-a'}]},
]};
async function run(query: string, dataset: any[], channel = 'renaissanceWeb') {
  const params = {channel, language: 'en', slug: 'showcase'};
  return (await evaluate(parse(query, {params}), {dataset, params})).get();
}

test('Home and inner page preserve selected order and resolve Renaissance text and custom media', async () => {
  for (const query of [HOME_PAGE_QUERY, PAGE_QUERY]) {
    const result = await run(query, [page, second, {...shared, siteContent: [edition]}]);
    const cases = result.content[0].caseStudies;
    assert.deepEqual(cases.map((c: any) => c._id), ['case-b', 'case-a']);
    assert.equal(cases[1].title, edition.title);
    assert.equal(cases[1].description, edition.description);
    assert.equal(cases[1].mainImage, null);
    const items = caseCarouselItems(cases);
    assert.equal(items[1].video?.secure_url, edition.mainVideo.secure_url);
    assert.equal(items[1].linkHref, '/cases/case-a');
  }
});

test('wrong-language, unassigned, hidden and deleted cases never leak into the carousel', async () => {
  for (const invalid of [null, {...shared, language: 'de'}, {...shared, channel: ['1spWeb']}, {...shared, isPublished: false}, {...shared, slug: null}]) {
    const result = await run(HOME_PAGE_QUERY, [page, second, ...(invalid ? [invalid] : [])]);
    assert.deepEqual(result.content[0].caseStudies.map((c: any) => c._id), ['case-b']);
  }
});

test('custom empty media omits the case instead of restoring shared imagery', async () => {
  const result = await run(HOME_PAGE_QUERY, [page, second, {...shared, siteContent: [{...edition, mainVideo: undefined}]}]);
  assert.deepEqual(caseCarouselItems(result.content[0].caseStudies).map(c => c.id), ['case-b']);
});

test('explicit hidden copy stays hidden and other channels cannot resolve a Renaissance block', async () => {
  const result = await run(HOME_PAGE_QUERY, [page, {...shared, siteContent: [{...edition, hideSubtitle: true, hideDescription: true}]}]);
  const [item] = caseCarouselItems(result.content[0].caseStudies);
  assert.equal(item.description, ''); assert.equal(item.subtitle, '');
  const other = await run(HOME_PAGE_QUERY, [{...page, channel: '1spWeb'}, shared], '1spWeb');
  assert.deepEqual(other.content[0].caseStudies, []);
});

test('empty and duplicate selections are safe; only complete case links render', () => {
  assert.deepEqual(caseCarouselItems(), []);
  assert.deepEqual(caseCarouselItems([shared, shared, {...second, title: ''}, {...second, slug: undefined}]).map(c => c.id), ['case-a']);
});

test('Studio registers the block, rejects other websites and requires unique selected cases', async () => {
  const compiled = createSchema({name: 'case-carousel-test', types: [
    {name: 'cloudinary.asset', type: 'object', fields: [{name: 'public_id', type: 'string'}]}, ...schema.types,
  ]});
  const content = (compiled.get('page') as any).fields.find((field: any) => field.name === 'content');
  assert(content.type.of.some((type: any) => type.name === 'renaissanceCaseCarousel' && !type.hidden));
  const client: any = {fetch: async () => null, withConfig: () => client};
  const workspace: any = {schema: compiled, getClient: () => client, i18n: {loadNamespaces: async () => undefined, t: (key: string, options: any) => options?.defaultValue || key}};
  const validate = (channel: string, selectedCases: any[]) => validateDocument({
    document: {...page, isHomepage: false, _rev: 'fixture', _createdAt: '2026-09-19T00:00:00Z', _updatedAt: '2026-09-19T00:00:00Z', channel,
      content: [{...page.content[0], selectedCases}]}, workspace, getClient: () => client, getDocumentExists: async () => true,
  });
  const ref = {_type: 'reference', _ref: 'case-a', _key: 'a'};
  assert.deepEqual(await validate('renaissanceWeb', [ref]), []);
  assert((await validate('1spWeb', [ref])).some(m => m.message.includes('Renaissance pages only')));
  assert((await validate('renaissanceWeb', [])).some(m => m.level === 'error'));
  assert((await validate('renaissanceWeb', [ref, {...ref, _key: 'b'}])).some(m => m.level === 'error'));
});
