import assert from 'node:assert/strict';
import {createHash, randomUUID} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createSchema, validateDocument} from 'sanity';
import {getCliClient} from 'sanity/cli';
import {cloudinarySchemaPlugin} from 'sanity-plugin-cloudinary';
import {schema} from '../packages/sanity-schema/src';
import {HOME_PAGE_QUERY, PAGE_QUERY, SERVICES_BY_CHANNEL_QUERY} from '../packages/sanity-queries/src/groq';
import {resolveServiceCard} from '../apps/renaissance-web/lib/serviceContent';
import media from './data/renaissance-service-media.json';

const root = 'EXPORT/renaissance-home-six-services';
const homeId = 'page-renaissance-home-en';
const productId = 'service-product-management-support-en';
const goToMarketId = 'f6eea649-36bb-4398-907d-7df055747982';
const paidId = 'service-paid-media-planning-buying-en';
const eventsId = 'd118cc4d-59f7-44a2-9ebd-64fffd1f773f';
const params = {channel: 'renaissanceWeb', language: 'en'};
const inventoryQuery = '*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"] | order(_id)';
const require = createRequire(import.meta.url);
const {parse, evaluate} = createRequire(require.resolve('sanity/package.json'))('groq-js');
const save = (name: string, value: unknown) => writeFileSync(`${root}/${name}.json`, JSON.stringify(value, null, 2)+'\n', {mode: 0o600});
const read = (name: string) => JSON.parse(readFileSync(`${root}/${name}.json`, 'utf8'));
const clean = ({_rev, _createdAt, _updatedAt, ...doc}: any) => doc;
const background = (asset: any, alt: string) => ({_type: 'cloudinaryImage', asset, alt});
async function offline(query: string, dataset: any[], queryParams: any) {
  return (await evaluate(parse(query, {params: queryParams}), {dataset, params: queryParams})).get();
}

function buildPlan(before: any[]) {
  const map = new Map(before.map(d => [d._id, d]));
  const changes = [homeId, productId, goToMarketId, paidId, eventsId].map(id => {
    assert(map.has(id), `Missing expected document ${id}`);
    assert(!map.has(`drafts.${id}`), `Preserve outstanding draft ${id}`);
    return structuredClone(map.get(id));
  });
  const [home, product, go, paid, events] = changes;
  assert.equal(home.channel, params.channel); assert.equal(home.language, params.language);
  assert.equal(home.isHomepage, true);
  for (const service of changes.slice(1)) {
    assert.equal(service._type, 'services'); assert.equal(service.language, params.language);
    assert(service.channel.includes(params.channel));
  }
  assert(!product.serviceBackground?.asset && !product.siteContent?.length, 'Product media changed; review before overwriting.');
  product.serviceBackground = background(media['Measurement & AI'], 'A person studying illuminated charts and data panels');
  const goEdition = go.siteContent.find((e: any) => e.channel === params.channel);
  assert(goEdition && goEdition.mediaMode === 'custom' && !goEdition.serviceBackground?.asset);
  assert.equal(go.serviceBackground?.asset?.resource_type, 'video');
  goEdition.serviceBackground = {
    ...structuredClone(go.serviceBackground),
    alt: 'Laptop displaying a video game storefront surrounded by star ratings',
  };
  assert.equal(paid.introText, '');
  paid.introText = 'deciding when, where, and how much to spend on paid promotion, via a trusted partner.';
  const eventsEdition = events.siteContent.find((e: any) => e.channel === params.channel);
  assert.equal(eventsEdition?.introText, '');
  eventsEdition.introText = 'planning and producing launch events, VIP previews and industry awards from start to finish.';
  const block = home.content.find((b: any) => b._key === 'renaissance-services');
  assert.equal(block?._type, 'cardContainerComponent'); assert.equal(block.cards.length, 4);
  assert.deepEqual(block.cards.map((c: any) => c.service?._ref), [
    '93e175b0-cfe2-4918-bedd-e4893c27e79a', 'f172b651-99a4-4471-94c6-1ac402a109eb', productId, goToMarketId,
  ]);
  block.cards.push(
    {_key: 'rpr-v4-23-home', _type: 'cardInsideComponent', service: {_type: 'reference', _ref: paidId}},
    {_key: 'rpr-v4-24-home', _type: 'cardInsideComponent', service: {_type: 'reference', _ref: eventsId}},
  );
  block.columns = 3;
  return changes.map(doc => ({
    id: doc._id, revision: doc._rev, document: doc,
    set: doc._id === homeId ? {
      'content[_key=="renaissance-services"].cards': block.cards,
      'content[_key=="renaissance-services"].columns': 3,
    } : doc._id === productId ? {serviceBackground: doc.serviceBackground}
      : doc._id === paidId ? {introText: doc.introText} : {siteContent: doc.siteContent},
  }));
}

async function verifyContent(dataset: any[]) {
  const home = await offline(HOME_PAGE_QUERY, dataset, params);
  const services = await offline(SERVICES_BY_CHANNEL_QUERY, dataset, params);
  const page = await offline(PAGE_QUERY, dataset, {...params, slug: 'services'});
  const block = home.content.find((b: any) => b._key === 'renaissance-services');
  assert.equal(services.length, 6); assert.equal(block.cards.length, 6); assert.equal(block.columns, 3);
  assert.deepEqual(new Set(block.cards.map((c: any) => c.service?._id)), new Set(services.map((s: any) => s._id)));
  assert.equal(page.content.filter((b: any) => b.service?._id).length, 6);
  const cards = block.cards.map(resolveServiceCard);
  for (const card of cards) {
    assert(card?.headline && card.text && card.text.length <= 150);
    assert(card.media?.secure_url && card.media.resource_type === 'video');
  }
  assert.equal(new Set(cards.map((c: any) => c.media.public_id)).size, 6);
  return {block, cards};
}

async function main() {
  const mode = process.env.RENAISSANCE_SIX_SERVICES_MODE || 'prepare';
  assert(['prepare', 'apply', 'verify'].includes(mode));
  const client = getCliClient({apiVersion: '2025-09-16'}).withConfig({useCdn: false, perspective: 'raw'});
  assert.equal(client.config().projectId, 'wu6i3y0h'); assert.equal(client.config().dataset, 'production');
  mkdirSync(root, {recursive: true, mode: 0o700});
  const current = await client.fetch<any[]>(inventoryQuery);
  if (mode === 'prepare') {
    assert(!existsSync(`${root}/before.json`), 'Existing snapshot; review it instead of overwriting.');
    save('before', current);
    const changes = buildPlan(current);
    const ids = new Set(changes.map(c => c.id));
    const projected = [...current.filter(d => !ids.has(d._id)), ...changes.map(c => c.document)];
    const {cards, block} = await verifyContent(projected);
    const assets = await Promise.all(cards.map(async (card: any) => {
      const response = await fetch(card.media.secure_url, {method: 'HEAD'});
      assert(response.ok && response.headers.get('content-type')?.startsWith('video/'), `Video unavailable: ${card.media.public_id}`);
      return {name: card.headline, asset: card.media.public_id, status: response.status};
    }));
    const validationClient: any = {withConfig: () => validationClient, fetch: (q: string, p: any) => offline(q, projected, p)};
    const pluginTypes = cloudinarySchemaPlugin().schema?.types; assert(Array.isArray(pluginTypes));
    const compiled = createSchema({name: 'renaissance-six-services', types: [...pluginTypes, ...schema.types]});
    const workspace = {schema: compiled, getClient: () => validationClient, i18n: {loadNamespaces: async () => undefined, t: (key: string, opts: any) => opts?.defaultValue || key}} as any;
    const validation = [];
    for (const {document} of changes) validation.push({id: document._id, markers: await validateDocument({document, workspace, getClient: () => validationClient, getDocumentExists: async ({id}: {id: string}) => projected.some(d => d._id === id)})});
    save('schema-validation', validation);
    assert(!validation.some(d => d.markers.some(m => m.level === 'error')), 'Schema validation failed.');
    save('plan', {transactionId: randomUUID(), backupSha256: createHash('sha256').update(readFileSync(`${root}/before.json`)).digest('hex'), changes, assets});
    save('fallback-service-block', {...block, cards: cards.map(({service, serviceConfigured, ...card}: any) => card)});
  }
  const before = read('before'); const plan = read('plan');
  assert.equal(createHash('sha256').update(readFileSync(`${root}/before.json`)).digest('hex'), plan.backupSha256);
  if (mode === 'verify') {
    const ids = new Set(plan.changes.map((c: any) => c.id));
    assert.deepEqual(current.filter(d => !ids.has(d._id)), before.filter((d: any) => !ids.has(d._id)), 'Unrelated documents changed.');
    for (const change of plan.changes) assert.deepEqual(clean(current.find(d => d._id === change.id)), clean(change.document));
    const {cards} = await verifyContent(current);
    const home = await client.fetch<any>(HOME_PAGE_QUERY, params, {perspective: 'published'});
    assert.equal(home.content.find((b: any) => b._key === 'renaissance-services').cards.filter((c: any) => c.service?.serviceBackground?.asset?.resource_type === 'video').length, 6);
    for (const channel of ['1spWeb', 'flizrWeb', 'msmWeb', 'studioco2Web']) {
      const stripTime = (rows: any[]) => rows.map(({_updatedAt, ...row}: any) => row);
      assert.deepEqual(stripTime(await offline(SERVICES_BY_CHANNEL_QUERY, current, {channel, language: 'en'})), stripTime(await offline(SERVICES_BY_CHANNEL_QUERY, before, {channel, language: 'en'})), `${channel} content changed`);
    }
    save('verification', {verifiedAt: new Date().toISOString(), cards: cards.map((c: any) => ({name: c.headline, asset: c.media.public_id})), otherChannelsUnchanged: true, unrelatedDocumentsUnchanged: true});
    console.log('Verified: six published homepage services, six distinct videos, six Services page references, other channels and unrelated documents unchanged.');
    return;
  }
  assert(!existsSync(`${root}/result.json`), 'Already applied; use verify.');
  // Fail on editorial drift before applying the reviewed plan.
  assert.deepEqual(current, before, 'Dataset changed since preparation; review before applying.');
  const tx = client.transaction().transactionId(plan.transactionId);
  for (const change of plan.changes) tx.patch(change.id, p => p.ifRevisionId(change.revision).set(change.set));
  if (mode === 'apply') assert(existsSync(`${root}/dry-run.json`));
  const result = await tx.commit({dryRun: mode === 'prepare', visibility: 'sync', tag: 'renaissance.six-services'});
  save(mode === 'apply' ? 'result' : 'dry-run', result);
  console.log(JSON.stringify({mode, changedDocuments: plan.changes.length, homeCards: 6, distinctVideos: 6, columns: 3, assets: plan.assets}, null, 2));
}
main().catch(error => {console.error(error); process.exitCode = 1;});
