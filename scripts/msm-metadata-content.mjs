import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';
import {buildMsmMetadataContentPlan} from './msm-metadata-model.mjs';

const projectId = 'wu6i3y0h';
const dataset = 'production';
const folder = 'EXPORT/msm-metadata-2026-10-06';
const client = getCliClient({apiVersion: '2025-09-16'}).withConfig({projectId, dataset, useCdn: false, perspective: 'raw'});
const query = `*[( _type == "page" && channel == "msmWeb") || _type == "msmUnit" || (_type in ["caseStudy", "person"] && "msmWeb" in channel)] | order(_id asc)`;
mkdirSync(folder, {recursive: true});

if (process.argv.includes('--apply')) {
  const plan = JSON.parse(readFileSync(`${folder}/plan.json`, 'utf8'));
  assert.equal(plan.projectId, projectId);
  assert.equal(plan.dataset, dataset);
  const backup = readFileSync(plan.backup);
  assert.equal(createHash('sha256').update(backup).digest('hex'), plan.backupSha256);
  const before = JSON.parse(backup);
  const stats = await client.request({uri: `/data/stats/${dataset}`});
  assert.equal(stats.stale, false, 'Refresh capacity statistics before applying.');
  assert(stats.fields.count.value < stats.fields.count.limit - 100, 'Insufficient attribute headroom.');
  const current = await client.getDocuments(plan.changes.map(change => change.id));
  let transaction = client.transaction();
  for (const [index, change] of plan.changes.entries()) {
    assert(!change.id.startsWith('drafts.'));
    assert.equal(current[index]?._rev, change.revision, `${change.id} changed; prepare again.`);
    const document = current[index];
    assert(document._type === 'msmUnit' || document.channel === 'msmWeb' || document.channel?.includes('msmWeb'));
    assert(Object.keys(change.set).every(field => ['metadata', 'siteContent'].includes(field)));
    if (change.set.siteContent) {
      assert.deepEqual(change.set.siteContent.filter(edition => edition.channel !== 'msmWeb'), (document.siteContent || []).filter(edition => edition.channel !== 'msmWeb'));
      const oldEdition = document.siteContent?.find(edition => edition.channel === 'msmWeb');
      const newEdition = change.set.siteContent.find(edition => edition.channel === 'msmWeb');
      for (const field of Object.keys(oldEdition || {}).filter(field => field !== 'seo')) assert.deepEqual(newEdition[field], oldEdition[field]);
    }
    transaction = transaction.patch(change.id, patch => patch.ifRevisionId(change.revision).set(change.set));
  }
  const receipt = await transaction.commit();
  const after = await client.getDocuments(plan.changes.map(change => change.id));
  for (const [index, change] of plan.changes.entries()) {
    const expected = {...before.find(doc => doc._id === change.id), ...change.set};
    for (const field of Object.keys(expected).filter(field => !['_rev', '_updatedAt'].includes(field))) assert.deepEqual(after[index][field], expected[field], `${change.id}.${field}`);
  }
  const drafts = before.filter(doc => doc._id.startsWith('drafts.'));
  assert.deepEqual(await client.getDocuments(drafts.map(doc => doc._id)), drafts, 'Drafts must remain unchanged.');
  writeFileSync(`${folder}/after.json`, JSON.stringify(after, null, 2), {mode: 0o600});
  writeFileSync(`${folder}/receipt.json`, JSON.stringify({transactionId: receipt.transactionId, documents: after.length}, null, 2), {mode: 0o600});
  console.log(JSON.stringify({mode: 'applied', transactionId: receipt.transactionId, documents: after.length}));
} else {
  const docs = await client.fetch(query);
  const translations = await client.fetch('*[_type == "translation.metadata"]{_id, translations}');
  const backup = `${folder}/before-${Date.now()}.json`;
  const data = JSON.stringify(docs, null, 2);
  writeFileSync(backup, data, {mode: 0o600});
  writeFileSync(`${folder}/snapshot.json`, JSON.stringify({projectId, dataset, backup, backupSha256: createHash('sha256').update(data).digest('hex'), translations}, null, 2), {mode: 0o600});
  if (process.argv.includes('--prepare')) {
    const {changes, coverage} = buildMsmMetadataContentPlan(docs, translations);
    writeFileSync(`${folder}/plan.json`, JSON.stringify({projectId, dataset, backup, backupSha256: createHash('sha256').update(data).digest('hex'), changes}, null, 2), {mode: 0o600});
    writeFileSync(`${folder}/coverage.json`, JSON.stringify(coverage, null, 2), {mode: 0o600});
    console.log(JSON.stringify({mode: 'dry-run', documents: changes.length, routes: coverage.length, images: Object.fromEntries([...new Set(coverage.map(row => row.imageSource))].map(source => [source, coverage.filter(row => row.imageSource === source).length]))}));
  }
  console.log(JSON.stringify({mode: 'snapshot', backup, documents: docs.length, translations: translations.length}));
}
