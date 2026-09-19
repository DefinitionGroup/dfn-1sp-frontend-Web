import { getCliClient } from 'sanity/cli';
import { writeFileSync, readFileSync } from 'node:fs';

// Run with sanity exec --with-user-token; apply only with MSM_NETWORK_REMOVE=1.
const client = getCliClient({ apiVersion: '2025-09-16' }).withConfig({
  projectId: 'wu6i3y0h', dataset: 'production', useCdn: false, perspective: 'raw',
});
const docs = await client.fetch('*[_type == "page" && channel == "msmWeb" && isHomepage == true]');
const key = 'a9a2b6bd17adf0b3a12069379433a725';
const changes = [];
for (const doc of docs) {
  const targets = (doc.content || []).filter(b => b._key === key);
  if (!targets.length) continue;
  if (doc.language !== 'en' || targets.length !== 1 || targets[0]._type !== 'galleryListStep') throw new Error('Unexpected target');
  const content = doc.content.filter(b => b._key !== key);
  console.log(JSON.stringify({ id: doc._id, revision: doc._rev, removed: targets[0], remaining: content.map(b => b._type) }));
  changes.push({ doc, content });
}
if (process.env.MSM_NETWORK_REMOVE === '1' && changes.length) {
  const backup = `/private/tmp/msm-network-removal-${Date.now()}.json`;
  writeFileSync(backup, JSON.stringify(changes.map(c => c.doc), null, 2), { mode: 0o600 });
  if (JSON.parse(readFileSync(backup, 'utf8')).length !== changes.length) throw new Error('Invalid backup');
  let tx = client.transaction();
  for (const { doc, content } of changes) tx = tx.patch(doc._id, p => p.ifRevisionId(doc._rev).set({ content }));
  await tx.commit();
  for (const { doc, content } of changes) {
    const updated = await client.getDocument(doc._id);
    if (JSON.stringify(updated.content) !== JSON.stringify(content)) throw new Error('Content verification failed');
  }
  console.log(`Verified ${changes.length} homepage updates. Backup: ${backup}`);
} else console.log(`Dry run: ${changes.length} homepage documents would change.`);
