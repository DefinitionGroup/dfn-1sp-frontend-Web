import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';
import { getCliClient } from 'sanity/cli';
import { legacyPortraits, legacyAwardWall } from '../apps/renaissance-web/data/legacyPeopleProof';

async function main() {
const apply = process.argv.includes('--apply');
const client = getCliClient({ apiVersion: '2025-09-16' }).withConfig({ useCdn: false, perspective: 'raw' });
const { projectId, dataset } = client.config();
if (projectId !== 'wu6i3y0h' || dataset !== 'dev-dataset') throw Error('This trial is restricted to wu6i3y0h/dev-dataset.');
const portraitsId = 'renaissance-shared-portraits-en';
const awardsId = 'renaissance-shared-awards-en';
const settingsId = 'site-settings-renaissanceWeb-en';
const ids = [portraitsId, awardsId, settingsId];
const existing = await client.fetch<any[]>('*[_id in $ids || _id in $draftIds]', { ids, draftIds: ids.map(id => `drafts.${id}`) });
if (existing.some(doc => doc._id.startsWith('drafts.'))) throw Error('Existing drafts need editorial review before seeding defaults.');
const settings = existing.find(doc => doc._id === settingsId);
if (settings && (settings.channel !== 'renaissanceWeb' || settings.language !== 'en')) throw Error('Settings scope mismatch.');
for (const [field, id] of [['renaissanceDefaultPortraits', portraitsId], ['renaissanceDefaultAwards', awardsId]]) {
  if (settings?.[field]?._ref && settings[field]._ref !== id) throw Error(`Existing ${field} selection will not be overwritten.`);
}
const shared = [
  { _id: portraitsId, _type: 'renaissanceSharedPortraits', title: 'People portraits', channel: 'renaissanceWeb', language: 'en',
    content: { ...legacyPortraits, portraits: legacyPortraits.portraits?.map(p => ({ ...p, name: p.name || 'Renaissance team member' })) } },
  { _id: awardsId, _type: 'renaissanceSharedAwards', title: 'Awards & recognition', channel: 'renaissanceWeb', language: 'en', content: legacyAwardWall },
];
for (const doc of shared) {
  const previous = existing.find(old => old._id === doc._id);
  if (previous && (previous._type !== doc._type || previous.channel !== doc.channel || previous.language !== doc.language)) throw Error(`Existing ${doc._id} has a different scope.`);
}
const defaults = {
  renaissanceDefaultPortraits: { _type: 'reference', _ref: portraitsId },
  renaissanceDefaultAwards: { _type: 'reference', _ref: awardsId },
};
console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', projectId, dataset,
  create: shared.filter(doc => !existing.some(old => old._id === doc._id)).map(doc => ({ id: doc._id, title: doc.title })),
  settings: settingsId, defaults, homepageChanges: false }, null, 2));
if (apply) {
  const backupDir = resolve('tmp/renaissance-shared-content'); mkdirSync(backupDir, { recursive: true });
  const path = resolve(backupDir, `before-${Date.now()}.json.gz`);
  const snapshot = JSON.stringify({ projectId, dataset, ids, documents: existing });
  writeFileSync(path, gzipSync(snapshot));
  if (gunzipSync(readFileSync(path)).toString() !== snapshot) throw Error('Backup validation failed.');
  let transaction = client.transaction();
  for (const doc of shared) if (!existing.some(old => old._id === doc._id)) transaction = transaction.create<(typeof shared)[number]>(doc);
  if (settings) transaction = transaction.patch(settingsId, patch => patch.ifRevisionId(settings._rev).set(defaults));
  else transaction = transaction.create({ _id: settingsId, _type: 'siteSettings', channel: 'renaissanceWeb', language: 'en', oneSpMembershipLabel: 'proud member of', ...defaults });
  await transaction.commit();
  const verified = await client.fetch('*[_id == $id][0]{renaissanceDefaultPortraits->{_id,content},renaissanceDefaultAwards->{_id,content}}', { id: settingsId });
  if (verified?.renaissanceDefaultPortraits?._id !== portraitsId || verified?.renaissanceDefaultAwards?._id !== awardsId) throw Error('Post-write verification failed.');
  console.log(JSON.stringify({ verified: true, portraits: verified.renaissanceDefaultPortraits.content.portraits.length,
    awards: verified.renaissanceDefaultAwards.content.logos.length, backup: path }));
}

}
main().catch(error => { console.error(error); process.exitCode = 1; });
