import assert from 'node:assert/strict';
import type {SanityClient} from '@sanity/client';
import {createHash, randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {createSchema, validateDocument} from 'sanity';
import {getCliClient} from 'sanity/cli';
import {cloudinarySchemaPlugin} from 'sanity-plugin-cloudinary';
import {schema} from '../packages/sanity-schema/src';
import {CASE_STUDIES_QUERY, CASE_STUDY_BY_SLUG_QUERY, HOME_PAGE_QUERY, PAGE_QUERY, SMART_PEOPLE_QUERY} from '../packages/sanity-queries/src/groq';
import {campaigns, copy} from './renaissance-content-model';
import {assertMigratedResults, resultsBody} from './renaissance-results-model';
import {resultGroups} from './renaissance-results-data';

const ROOT = 'EXPORT/renaissance-rewrite-v4/publication';
const CHANNEL = 'renaissanceWeb';
const MODE = process.env.RENAISSANCE_PUBLICATION_MODE || 'inventory';
const QUERY = '*[!(_id in path("_.**")) && _type != "sanity.previewUrlSecret"]';
const save = (name: string, data: unknown) => writeFileSync(`${ROOT}/${name}.json`, JSON.stringify(data, null, 2) + '\n', {mode: 0o600});
const read = (name: string) => JSON.parse(readFileSync(`${ROOT}/${name}.json`, 'utf8'));
const inScope = (d: any) => d._id.startsWith('drafts.') && (Array.isArray(d.channel) ? d.channel.includes(CHANNEL) : d.channel === CHANNEL);
const clean = (doc: any) => {
  const {_id, _rev, _createdAt, _updatedAt, _system, ...content} = doc;
  return content;
};
const references = (value: any): string[] => {
  if (!value || typeof value !== 'object') return [];
  return [...(typeof value._ref === 'string' ? [value._ref] : []), ...Object.values(value).flatMap(references)];
};

/** Match Studio's publication semantics; intentionally weak refs stay weak. */
function strengthen(value: any): any {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(strengthen);
  const result = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, strengthen(v)]));
  if (result._type === 'reference' && result._strengthenOnPublish) {
    if (!result._strengthenOnPublish.weak) delete result._weak;
    delete result._strengthenOnPublish;
  }
  return result;
}

function transaction(client: any, plan: any) {
  const tx = client.transaction().transactionId(plan.transactionId);
  // Guard both sides before copying. Creation (not replacement) guards new IDs.
  for (const item of plan.items) {
    tx.patch(item.draftId, (p: any) => p.ifRevisionId(item.draftRevision).unset(['_revision_lock_pseudo_field_']));
    if (item.publishedRevision) tx.patch(item.published._id, (p: any) => p.ifRevisionId(item.publishedRevision).unset(['_revision_lock_pseudo_field_']));
  }
  for (const item of plan.items) {
    if (item.publishedRevision) tx.createOrReplace(item.published);
    else tx.create(item.published);
  }
  for (const item of plan.items) tx.delete(item.draftId);
  return tx;
}

async function caseViews(client: any) {
  const result: Record<string, any> = {};
  for (const channel of ['1spWeb', 'msmWeb']) {
    const doc = await client.fetch(CASE_STUDY_BY_SLUG_QUERY, {channel, language: 'en', slug: 'making-stalker-2-unmissableeverywhere-all-at-once'}, {perspective: 'published'});
    assert(doc);
    result[channel] = Object.fromEntries(['title', 'description', 'subtitle', 'seo', 'mainImage', 'mainVideo', 'isVerticalVideo', 'discovery', 'casesPageBuilder'].map(key => [key, doc[key]]));
  }
  return result;
}

async function prepare(client: any, all: any[]) {
  assert(!existsSync(`${ROOT}/publication-result.json`), 'Publication already recorded; run verify instead.');
  const backup = read('backup-verification');
  execFileSync('gzip', ['-t', backup.path]);
  assert.equal(createHash('sha256').update(readFileSync(backup.path)).digest('hex'), backup.sha256);
  const snapshot = read('inventory-snapshot');
  assert.deepEqual(all, snapshot, 'Dataset changed since the verified backup; refresh inventory and backup.');
  const drafts = all.filter(inScope);
  assert.equal(drafts.length, 225, 'Review a changed publication inventory before proceeding.');
  const ids = new Set(drafts.map(d => d._id.slice(7)));
  const publishedIds = new Set(all.filter(d => !d._id.startsWith('drafts.')).map(d => d._id));
  for (const draft of drafts) {
    assert.equal(draft.language, 'en');
    for (const ref of references(draft)) {
      assert(!ref.startsWith('drafts.'), `Direct draft reference: ${draft._id}`);
      assert(ids.has(ref) || publishedIds.has(ref), `Unpublished dependency: ${draft._id} -> ${ref}`);
    }
    const published = all.find(d => d._id === draft._id.slice(7));
    if (published && Array.isArray(published.channel) && published.channel.some((c: string) => c !== CHANNEL)) {
      const {channel: beforeChannels, siteContent: beforeEditions, ...before} = clean(published);
      const {channel: afterChannels, siteContent: afterEditions, ...after} = clean(draft);
      assert.deepEqual(after, before, `Shared content changed for another channel: ${draft._id}`);
      assert.deepEqual(afterChannels.filter((c: string) => c !== CHANNEL), beforeChannels.filter((c: string) => c !== CHANNEL));
      assert.deepEqual((afterEditions || []).filter((e: any) => e.channel !== CHANNEL), (beforeEditions || []).filter((e: any) => e.channel !== CHANNEL));
    }
  }
  const cloudinaryTypes = cloudinarySchemaPlugin().schema?.types;
  assert(Array.isArray(cloudinaryTypes));
  const compiled = createSchema({name: 'renaissance-publication', types: [...cloudinaryTypes, ...schema.types]});
  const validationClient = client.withConfig({perspective: 'drafts'});
  const workspace = {schema: compiled, getClient: () => validationClient, i18n: {loadNamespaces: async () => undefined, t: (key: string, opts: any) => opts?.defaultValue || key}} as any;
  const failures: any[] = [], warnings: any[] = [];
  for (let start = 0; start < drafts.length; start += 8) {
    await Promise.all(drafts.slice(start, start + 8).map(async document => {
      const markers = await validateDocument({document, workspace, getDocumentExists: async ({id}: {id: string}) => publishedIds.has(id) || ids.has(id.replace(/^drafts\./, '')), getClient: () => validationClient});
      const errors = markers.filter(m => m.level === 'error');
      if (errors.length) failures.push({id: document._id, errors});
      const notices = markers.filter(m => m.level !== 'error');
      if (notices.length) warnings.push({id: document._id, notices});
    }));
  }
  save('schema-validation', {documents: drafts.length, failures, warnings});
  assert.equal(failures.length, 0, `Schema errors in ${failures.length} documents; see schema-validation.json`);
  const plan = {project: 'wu6i3y0h', dataset: 'production', channel: CHANNEL, language: 'en', preparedAt: new Date().toISOString(), backup,
    transactionId: randomUUID(), items: drafts.map(draft => {
      const published = all.find(d => d._id === draft._id.slice(7));
      return {draftId: draft._id, draftRevision: draft._rev, publishedRevision: published?._rev,
        published: {...strengthen(clean(draft)), _id: draft._id.slice(7), _createdAt: published?._createdAt || draft._createdAt}};
    }), crossChannelBefore: await caseViews(client)};
  save('before', all); save('plan', plan);
  const dryRun = await transaction(client, plan).commit({dryRun: true, visibility: 'sync', tag: 'renaissance.publish.preflight'});
  save('dry-run', {verifiedAt: new Date().toISOString(), result: dryRun});
  console.log(JSON.stringify({mode: 'prepared', documents: drafts.length, newPublished: plan.items.filter(i => !i.publishedRevision).length, updatedPublished: plan.items.filter(i => i.publishedRevision).length, schemaErrors: 0, schemaWarnings: warnings.length, dryRun: 'passed', unrelatedDrafts: all.filter(d => d._id.startsWith('drafts.') && !inScope(d)).length}));
}

async function verify(client: SanityClient, plan: any) {
  const after = await client.fetch<any[]>(QUERY);
  const before = read('before');
  const affected = new Set(plan.items.flatMap((i: any) => [i.draftId, i.published._id]));
  for (const doc of before.filter((d: any) => !affected.has(d._id))) assert.deepEqual(after.find(d => d._id === doc._id), doc, `Unrelated document changed: ${doc._id}`);
  for (const item of plan.items) {
    assert(!after.some(d => d._id === item.draftId), `Draft remains: ${item.draftId}`);
    const published = after.find(d => d._id === item.published._id);
    assert(published, `Published document missing: ${item.published._id}`);
    assert.deepEqual(clean(published), clean(item.published));
    for (const ref of references(published)) assert(after.some(d => d._id === ref), `Unresolved published reference: ${ref}`);
  }
  assert.equal(after.filter(inScope).length, 0);
  assert.deepEqual(await caseViews(client), plan.crossChannelBefore, 'STALKER 2 changed in another channel');
  const params = {channel: CHANNEL, language: 'en'};
  const publishedClient = client.withConfig({perspective: 'published'});
  const cases = await publishedClient.fetch<any[]>(CASE_STUDIES_QUERY, params);
  assert.equal(cases.length, 66);
  let groups = 0, metrics = 0;
  for (const campaign of campaigns) {
    const resolved = await publishedClient.fetch<any>(CASE_STUDY_BY_SLUG_QUERY, {...params, slug: campaign.slug});
    assert(resolved?.mainImageUrl && resolved.client?.name, `Incomplete published case: ${campaign.slug}`);
    const source = after.find(d => d._id === campaign.id);
    const row = campaign.sourceRows.find(row => resultGroups[row]);
    if (row) assertMigratedResults(source, row);
    else assert.equal(resultsBody(source).body.filter((b: any) => b._type === 'resultsMetrics').length, 0);
    const results = resolved.casesPageBuilder.filter((b: any) => b._type === 'resultsMetrics');
    groups += results.length; metrics += results.flatMap((b: any) => b.metrics || []).length;
  }
  assert.equal(groups, 107); assert.equal(metrics, 248);
  for (const slug of ['services', 'cases', 'about-us', 'clients', 'contact']) assert(await publishedClient.fetch(PAGE_QUERY, {...params, slug}));
  const home = await publishedClient.fetch<any>(HOME_PAGE_QUERY, params);
  assert.equal(home.content[0].heading, copy(4));
  const about = await publishedClient.fetch<any>(PAGE_QUERY, {...params, slug: 'about-us'});
  const clients = await publishedClient.fetch<any>(PAGE_QUERY, {...params, slug: 'clients'});
  assert.equal(about.content[1].portraits.length, 19); assert.equal(about.content[3].sharedContent.content.logos.length, 10);
  assert.equal(clients.content[1].collectionClients.length, 125);
  assert.equal((await publishedClient.fetch<any[]>(SMART_PEOPLE_QUERY, {...params, maxItems: 100})).length, 19);
  assert.equal(after.find(d => d._id === 'site-settings-renaissanceWeb-en')?.renaissanceEnquiryEmail, 'martin@definition.studio');
  const summary = {verifiedAt: new Date().toISOString(), project: 'wu6i3y0h', dataset: 'production', channel: CHANNEL, language: 'en', documentsPublished: plan.items.length,
    newPublished: plan.items.filter((i: any) => !i.publishedRevision).length, updatedPublished: plan.items.filter((i: any) => i.publishedRevision).length,
    remainingRenaissanceDrafts: 0, unrelatedDraftsPreserved: after.filter(d => d._id.startsWith('drafts.')).length,
    unrelatedDocumentsUnchanged: true, otherStalkerEditionsUnchanged: true, cases: cases.length, resultGroups: groups, metrics, people: 19, clientLogos: 125, awardLogos: 10};
  save('after', after); save('verification', summary); console.log(JSON.stringify(summary));
}
async function main() {
  assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 'wu6i3y0h');
  assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET, 'production');
  const client = getCliClient({apiVersion: '2025-09-16'}).withConfig({projectId: 'wu6i3y0h', dataset: 'production', perspective: 'raw', useCdn: false});
  assert(client.config().token, 'Run through sanity exec --with-user-token');
  mkdirSync(ROOT, {recursive: true, mode: 0o700});
  assert(['inventory', 'prepare', 'apply', 'verify'].includes(MODE));
  if (MODE === 'verify') {await verify(client, read('plan')); return;}
  if (MODE === 'apply') {
    assert(!existsSync(`${ROOT}/publication-result.json`), 'Publication already recorded; run verify instead.');
    const plan = read('plan'); assert.equal(plan.items.length, 225);
    assert.equal(plan.backup.sha256, createHash('sha256').update(readFileSync(plan.backup.path)).digest('hex'));
    const fresh = await client.fetch<any[]>(QUERY);
    assert.deepEqual(fresh, read('before'), 'Dataset changed after preflight; review before retrying.');
    assert(read('dry-run').result, 'Missing successful preflight');
    const result = await transaction(client, plan).commit({visibility: 'sync', tag: 'renaissance.publish'});
    save('publication-result', {publishedAt: new Date().toISOString(), result});
    await verify(client, plan); return;
  }
  const all = await client.fetch<any[]>(QUERY);
  if (MODE === 'prepare') {await prepare(client, all); return;}
  const drafts = all.filter(d => d._id.startsWith('drafts.'));
  const inventory = drafts.map(d => {
    const published = all.find(p => p._id === d._id.slice(7));
    const fields = new Set([...Object.keys(clean(d)), ...Object.keys(published ? clean(published) : {})]);
    return {id: d._id, type: d._type, title: d.title || d.name, channel: d.channel, language: d.language, isNew: !published,
      inScope: (Array.isArray(d.channel) ? d.channel.includes(CHANNEL) : d.channel === CHANNEL),
      changedFields: [...fields].filter(k => JSON.stringify(d[k]) !== JSON.stringify(published?.[k])),
      references: [...new Set(references(d))]};
  });
  save('inventory-snapshot', all); save('inventory', inventory);
  console.log(JSON.stringify({documents: all.length, published: all.length - drafts.length, drafts: drafts.length,
    inScope: inventory.filter(d => d.inScope).length,
    types: Object.fromEntries([...new Set(inventory.filter(d => d.inScope).map(d => d.type))].map(type => [type, inventory.filter(d => d.inScope && d.type === type).length])),
    otherDrafts: inventory.filter(d => !d.inScope),
    existingInScope: inventory.filter(d => d.inScope && !d.isNew)}, null, 2));
}
main().catch(error => {console.error(error.message); process.exitCode = 1;});
