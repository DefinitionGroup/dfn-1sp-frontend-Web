import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { HOME_PAGE_QUERY, PAGE_QUERY } from '../packages/sanity-queries/src/groq';
import { resolvePeopleProof } from '../apps/renaissance-web/lib/renaissancePeopleProof';
import { createSchema, validateDocument } from 'sanity';
import { legacyPortraits, legacyAwardWall } from '../apps/renaissance-web/data/legacyPeopleProof';
import { schema } from '../packages/sanity-schema/src/index';
const require = createRequire(import.meta.url);
const { parse, evaluate } = createRequire(require.resolve('sanity/package.json'))('groq-js');
const portraits = { _type: 'renaissancePortraitGrid' as const, portraits: [{ name: 'Person', imageUrl: '/person.jpg' }] };
const awards = { _type: 'renaissanceAwardLogoWall' as const, headline: 'Awards', logos: [{ name: 'Award', imageUrl: '/award.png' }] };
const ref = (id: string) => ({ _type: 'reference', _ref: id });
const marker = { _type: 'renaissanceSectionBand' as const, sectionRole: 'people' as const };
function fixture() {
  return [
    { _id: 'portraits', _type: 'renaissanceSharedPortraits', channel: 'renaissanceWeb', language: 'en', content: structuredClone(portraits) },
    { _id: 'awards', _type: 'renaissanceSharedAwards', channel: 'renaissanceWeb', language: 'en', content: structuredClone(awards) },
    { _id: 'settings', _type: 'siteSettings', channel: 'renaissanceWeb', language: 'en', renaissanceDefaultPortraits: ref('portraits'), renaissanceDefaultAwards: ref('awards') },
    ...['home', 'about'].map(id => ({ _id: id, _type: 'page', channel: 'renaissanceWeb', language: 'en', slug: { current: id }, isHomepage: id === 'home', content: [marker, { _type: 'renaissanceSharedContentReference', sharedContent: ref('portraits') }] })),
  ];
}
async function query(query: string, dataset: any[], slug = 'home') {
  return (await evaluate(parse(query), { dataset, params: { channel: 'renaissanceWeb', language: 'en', slug } })).get();
}
test('one central edit updates defaults and explicit references on two pages', async () => {
  const data = fixture();
  const changed = data[0] as any;
  changed.content.portraits[0].name = 'Updated centrally';
  for (const [q, slug] of [[HOME_PAGE_QUERY, 'home'], [PAGE_QUERY, 'about']]) {
    const page = await query(q, data, slug);
    assert.equal(page.content[0].sharedDefaults.portraits.content.portraits[0].name, 'Updated centrally');
    assert.equal(page.content[1].sharedContent.content.portraits[0].name, 'Updated centrally');
    const proof = resolvePeopleProof(page.content[0], page.content.slice(1));
    assert.equal(proof.portraits, null, 'Explicit reference prevents duplicate automatic portraits');
    assert.deepEqual(proof.awards, awards);
  }
});
test('local overrides are independent and missing configured defaults do not resurrect hardcoded content', () => {
  const section = { ...marker, sharedDefaults: { portraitsConfigured: true, awardsConfigured: true, portraits: { content: portraits }, awards: { content: awards } } };
  assert.deepEqual(resolvePeopleProof(section, [portraits]), { portraits: null, awards });
  assert.deepEqual(resolvePeopleProof(section, [awards]), { portraits, awards: null });
  assert.deepEqual(resolvePeopleProof(marker, []), { portraits: undefined, awards: undefined });
  assert.deepEqual(resolvePeopleProof({ ...marker, sharedDefaults: { portraitsConfigured: true, portraits: null } }, []), { portraits: null, awards: undefined });
});
test('query refuses shared content from another channel or language', async () => {
  for (const change of [{ channel: '1spWeb' }, { language: 'de' }]) {
    const data = fixture(); Object.assign(data[0], change);
    const page = await query(HOME_PAGE_QUERY, data);
    assert.equal(page.content[1].sharedContent.content, undefined);
    assert.equal(page.content[0].sharedDefaults.portraits.content, undefined);
  }
});
test('Studio registers shared documents and an insertable reference block', () => {
  const compiled = createSchema({ name: 'shared-content-test', types: [
    { name: 'cloudinary.asset', type: 'object', fields: [{ name: 'public_id', type: 'string' }] }, ...schema.types,
  ] });
  for (const name of ['renaissanceSharedPortraits', 'renaissanceSharedAwards']) assert.ok(compiled.get(name));
  const page = compiled.get('page') as any;
  const block = page.fields.find((f: any) => f.name === 'content').type.of.find((t: any) => t.name === 'renaissanceSharedContentReference');
  assert.ok(block && !block.hidden);
});


test('trial content is publishable and foreign-channel shared documents are rejected', async () => {
  const compiled = createSchema({ name: 'shared-validation', types: [
    { name: 'cloudinary.asset', type: 'object', fields: [{ name: 'public_id', type: 'string' }] }, ...schema.types,
  ] });
  const client = { fetch: async () => null };
  const workspace = { schema: compiled, getClient: () => client,
    i18n: { loadNamespaces: async () => undefined, t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key } } as any;
  const validate = (document: any) => validateDocument({ document, workspace,
    getDocumentExists: async () => true, getClient: () => client as any });
  const docs = [
    { _type: 'renaissanceSharedPortraits', content: { ...legacyPortraits, portraits: legacyPortraits.portraits?.map(p => ({ ...p, name: p.name || 'Renaissance team member' })) } },
    { _type: 'renaissanceSharedAwards', content: legacyAwardWall },
  ];
  for (const doc of docs) {
    const document = { ...doc, _id: 'shared-test', _rev: 'test', _createdAt: '2026-09-11T00:00:00Z', _updatedAt: '2026-09-11T00:00:00Z', title: 'Shared test', channel: 'renaissanceWeb', language: 'en' };
    assert.deepEqual(await validate(document), []);
    assert.ok((await validate({ ...document, channel: '1spWeb' })).some(marker => marker.level === 'error'));
  }
});
