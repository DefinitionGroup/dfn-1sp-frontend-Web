import { getCliClient } from 'sanity/cli';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

// Run via sanity exec --with-user-token. Dry-run unless MSM_UNITS_APPLY=1.
const client = getCliClient({ apiVersion: '2025-09-16' }).withConfig({
  projectId: 'wu6i3y0h', dataset: 'production', useCdn: false, perspective: 'raw',
});
const docs = await client.fetch('*[_type == "page" && channel == "msmWeb" && isHomepage == true]');
for (const language of ['en', 'de']) {
  if (docs.filter(d => d.language === language && !d._id.startsWith('drafts.')).length !== 1) {
    throw new Error(`Expected exactly one published ${language} MSM homepage`);
  }
}
let tx = client.transaction();
const changed = [];
for (const doc of docs) {
  if (!['en', 'de'].includes(doc.language)) throw new Error('Unexpected homepage language');
  if (!Array.isArray(doc.content) || !doc.content.length) throw new Error('Empty homepage');
  if (doc.content.some(b => b._type === 'msmUnitsGrid')) continue;
  const block = {
    _key: 'msm-home-unit-explorer', _type: 'msmUnitsGrid', embedded: true,
    headline: doc.language === 'de' ? 'Vier Units. Ein Ziel.' : 'Four units. One goal.',
    eyebrow: doc.language === 'de' ? 'Unsere Units' : 'Our units', selectionMode: 'auto',
  };
  const index = doc.content.findIndex(b => b._type === 'galleryPeopleStep');
  const content = [...doc.content];
  content.splice(index < 0 ? content.length : index, 0, block);
  changed.push(doc);
  console.log(JSON.stringify({ id: doc._id, revision: doc._rev, order: content.map(b => b._type) }));
  tx = tx.patch(doc._id, p => p.ifRevisionId(doc._rev).set({ content }));
}
if (process.env.MSM_UNITS_APPLY === '1' && changed.length) {
  const dir = '/private/tmp/msm-home-units-backup';
  mkdirSync(dir, { recursive: true });
  const path = `${dir}/${Date.now()}.json`;
  writeFileSync(path, JSON.stringify(changed, null, 2), { mode: 0o600 });
  if (JSON.parse(readFileSync(path, 'utf8')).length !== changed.length) throw new Error('Backup verification failed');
  console.log('Backup:', path);
  await tx.commit();
  const verified = await client.fetch('*[_id in $ids]{_id,"blocks":content[]{_type,_key,embedded}}', { ids: changed.map(d => d._id) });
  for (const doc of verified) {
    if (doc.blocks.filter(b => b._type === 'msmUnitsGrid').length !== 1) throw new Error('Post-write verification failed');
  }
  console.log('Verified:', JSON.stringify(verified));
} else console.log(`Dry run: ${changed.length} homepage documents would change.`);
