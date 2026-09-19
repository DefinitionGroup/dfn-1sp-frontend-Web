import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { createSchema, validateDocument } from 'sanity';
import { schema } from '../packages/sanity-schema/src';
import { copyCaseContent } from '../packages/sanity-schema/src/Global/Cases/CaseEditionInput';
import { CASE_STUDY_BY_SLUG_QUERY, CASE_STUDIES_QUERY, CASE_STUDIES_BY_IDS_QUERY, CASE_STUDIES_BY_CHANNEL_LIMIT_QUERY, HOME_PAGE_QUERY, SMART_PEOPLE_QUERY, getInteractiveCarouselQuery } from '../packages/sanity-queries/src/groq';
const require = createRequire(import.meta.url);
const { parse, evaluate } = createRequire(require.resolve('sanity/package.json'))('groq-js');
const asset = (url: string) => ({ _type: 'cloudinary.asset', secure_url: url });
const base = { _id: 'campaign', _type: 'caseStudy', language: 'en', channel: ['1spWeb', 'renaissanceWeb'], isPublished: true, slug: { current: 'campaign' }, title: 'Shared title', description: 'Shared summary', mainImage: asset('shared.jpg'), mainVideo: asset('shared.mp4'), connectedDataCarouselPromoRenaissance: true, casesPageBuilder: [{ _key: 'shared', _type: 'resultsMetrics', description: 'Shared results', fullWidth: true }] };
const edition = { _key: 'renaissance', _type: 'caseWebsiteContent', channel: 'renaissanceWeb', title: 'Renaissance title', description: 'Renaissance summary', bodyMode: 'custom', casesPageBuilder: [{ _key: 'custom', _type: 'resultsMetrics', description: 'Renaissance results', fullWidth: true, metrics: [] }] };
async function run(query: string, docs: any[], channel = 'renaissanceWeb') {
  const params = { channel, language: 'en', slug: 'campaign', ids: ['campaign'], maxItems: 6 };
  return (await evaluate(parse(query, { params }), { dataset: docs, params })).get();
}

test('all case entry points resolve one channel edition and preserve other channels', async () => {
  const doc = { ...base, siteContent: [edition] };
  const queries = [CASE_STUDY_BY_SLUG_QUERY, CASE_STUDIES_QUERY, CASE_STUDIES_BY_IDS_QUERY, CASE_STUDIES_BY_CHANNEL_LIMIT_QUERY, getInteractiveCarouselQuery('connectedDataCarouselPromoRenaissance')];
  for (const query of queries) {
    for (const channel of ['renaissanceWeb', '1spWeb']) {
      const result = await run(query, [doc], channel); const item = Array.isArray(result) ? result[0] : result;
      assert.equal(item._id, base._id);
      assert.equal(item.title, channel === 'renaissanceWeb' ? edition.title : base.title);
      assert.equal(item.description, channel === 'renaissanceWeb' ? edition.description : base.description);
      assert.equal(item.seo.title, item.title);
      assert.equal(item.mainImageUrl, 'shared.jpg');
    }
  }
  const detail = await run(CASE_STUDY_BY_SLUG_QUERY, [doc]);
  assert.equal(detail.casesPageBuilder[0].description, 'Renaissance results');
  assert.equal(detail.casesPageBuilder[0].fullWidth, true);
});

test('unset fields inherit, explicit empty values clear, and custom media does not inherit video', async () => {
  for (const siteContent of [undefined, [{ ...edition, title: undefined, description: undefined, bodyMode: 'inherit' }]]) {
    const detail = await run(CASE_STUDY_BY_SLUG_QUERY, [{ ...base, siteContent }]);
    assert.equal(detail.title, base.title); assert.equal(detail.description, base.description);
    assert.equal(detail.casesPageBuilder[0].description, 'Shared results');
    assert.equal(detail.casesPageBuilder[0].fullWidth, true);
  }
  const detail = await run(CASE_STUDY_BY_SLUG_QUERY, [{ ...base, siteContent: [{ ...edition, description: '', casesPageBuilder: [], mediaMode: 'custom', mainImage: asset('custom.jpg') }] }]);
  assert.equal(detail.description, ''); assert.equal(detail.seo.description, '');
  assert.deepEqual(detail.casesPageBuilder, []);
  assert.equal(detail.mainImageUrl, 'custom.jpg'); assert.equal(detail.mainVideoUrl, null);
});

test('manual page selections resolve editions, enforce scope, and reusable 1SP groups keep 1SP copy', async () => {
  const ref = { _type: 'reference', _ref: 'campaign' };
  const block = { _type: 'casesGalleryFiltered', selectedCases: [ref] };
  const page = { _id: 'home', _type: 'page', channel: 'renaissanceWeb', language: 'en', isHomepage: true, content: [block, { _type: 'oneSpComponentGroupReference', group: { _type: 'reference', _ref: 'group' } }] };
  const group = { _id: 'group', _type: 'oneSpComponentGroup', content: [block] };
  const result = await run(HOME_PAGE_QUERY, [page, group, { ...base, siteContent: [edition] }]);
  assert.equal(result.content[0].selectedCases[0].title, edition.title);
  assert.equal(result.content[1].group.content[0].selectedCases[0].title, base.title);
  const foreign = await run(HOME_PAGE_QUERY, [page, group, { ...base, language: 'de' }]);
  assert.deepEqual(foreign.content[0].selectedCases, []);
});

test('copying shared content excludes identity and relations and creates independent block objects', () => {
  const copied = copyCaseContent(base);
  assert.equal(copied._id, undefined); assert.equal(copied.channel, undefined);
  assert.equal(copied.hideSubtitle, true);
  assert.equal(copyCaseContent({ title: 'Only a title' }).hideDescription, true);
  (copied.casesPageBuilder as any[])[0].description = 'Edited';
  assert.equal(base.casesPageBuilder[0].description, 'Shared results');
});

test('Studio validates channel assignment and duplicate editions', async () => {
  const compiled = createSchema({ name: 'case-editions', types: [{ name: 'cloudinary.asset', type: 'object', fields: [{ name: 'secure_url', type: 'string' }] }, ...schema.types] });
  const client = { fetch: async () => null };
  const workspace = { schema: compiled, getClient: () => client, i18n: { loadNamespaces: async () => undefined, t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key } } as any;
  async function validate(doc: any) { return validateDocument({ document: { ...doc, _rev: 'test', _createdAt: '2026-09-19T00:00:00Z', _updatedAt: '2026-09-19T00:00:00Z' }, workspace, getDocumentExists: async () => true, getClient: () => client as any }); }
  const cleanEdition = { ...edition, casesPageBuilder: [] };
  assert.ok(!(await validate({ ...base, casesPageBuilder: [], siteContent: [cleanEdition] })).some(m => m.level === 'error'));
  assert.ok((await validate({ ...base, siteContent: [cleanEdition, { ...cleanEdition, _key: 'duplicate' }] })).some(m => m.message.includes('Only one edition')));
  assert.ok((await validate({ ...base, channel: ['1spWeb'], siteContent: [cleanEdition] })).some(m => m.message.includes('Assign this website')));
});


test('hide controls explicitly remove inherited optional text', async () => {
  const item = await run(CASE_STUDY_BY_SLUG_QUERY, [{ ...base, subtitle: 'Inherited label', siteContent: [{ ...edition, hideDescription: true, hideSubtitle: true }] }]);
  assert.equal(item.description, ''); assert.equal(item.subtitle, ''); assert.equal(item.seo.description, '');
});

test('Renaissance logo collections resolve local artwork and reject foreign channel or language', async () => {
  const client = { _id: 'client', _type: 'client', name: 'Shared client', channel: ['renaissanceWeb'], language: 'en', logo: asset('shared.jpg') };
  const foreign = { ...client, _id: 'foreign', language: 'de' };
  const collection = { _id: 'logos', _type: 'renaissanceClientCollection', channel: 'renaissanceWeb', language: 'en', items: [
    { client: { _ref: 'client' }, displayName: 'Renaissance label', logoOverride: asset('local.jpg') },
    { client: { _ref: 'foreign' } },
  ] };
  const page = { _id: 'home', _type: 'page', channel: 'renaissanceWeb', language: 'en', isHomepage: true, content: [
    { _type: 'clientLogoCarousel', selectionMode: 'collection', collection: { _ref: 'logos' } },
    { _type: 'clientLogoCarousel', selectionMode: 'manual', selectedClients: [{ _ref: 'client' }, { _ref: 'foreign' }] },
    { _type: 'clientLogoCarousel', selectionMode: 'auto' },
  ] };
  const result = await run(HOME_PAGE_QUERY, [page, collection, client, foreign]);
  assert.equal(result.content[0].collectionClients.length, 1);
  assert.equal(result.content[0].collectionClients[0].logo.secure_url, 'local.jpg');
  assert.equal(result.content[0].collectionClients[0].name, 'Renaissance label');
  assert.equal(result.content[1].selectedClients.length, 1);
  assert.equal(result.content[2].autoClients.length, 1);
  const rejected = await run(HOME_PAGE_QUERY, [page, { ...collection, channel: '1spWeb' }, client]);
  assert.deepEqual(rejected.content[0].collectionClients, []);
});

test('People selection uses site membership and language while preserving 1SP promotion opt-in', async () => {
  const person = { _id: 'person', _type: 'person', channel: ['renaissanceWeb', '1spWeb'], language: 'en', smartPeoplePromo1SP: false };
  const dataset = [person, { ...person, _id: 'german', language: 'de' }];
  assert.deepEqual((await run(SMART_PEOPLE_QUERY, dataset)).map((p: any) => p._id), ['person']);
  assert.deepEqual(await run(SMART_PEOPLE_QUERY, dataset, '1spWeb'), []);
});


test('Renaissance stays non-indexable until its production domain is configured', async () => {
  const { isRenaissancePublic, renaissanceRobotsMetadata, renaissanceDeploymentHeaders } = await import('../apps/renaissance-web/lib/deployment');
  assert.equal(isRenaissancePublic(), false);
  assert.equal(renaissanceRobotsMetadata().index, false);
  assert.match(renaissanceDeploymentHeaders()[0].headers[0].value, /noindex/);
});
