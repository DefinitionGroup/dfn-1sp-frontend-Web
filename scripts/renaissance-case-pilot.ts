import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { getCliClient } from 'sanity/cli';
import { CASE_STUDY_BY_SLUG_QUERY } from '../packages/sanity-queries/src/groq';

async function main() {
  assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 'wu6i3y0h');
  assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET, 'production');
  const client = getCliClient({ apiVersion: '2025-09-16' }).withConfig({ projectId: 'wu6i3y0h', dataset: 'production', useCdn: false, perspective: 'raw' });
  assert(client.config().token, 'Run with sanity exec --with-user-token');
  const id = '9d295e99-7801-42b8-96e7-a15afb267e72';
  const docs = await client.fetch<any[]>('*[_id in $ids]', { ids: [id, `drafts.${id}`] });
  const published = docs.find(d => d._id === id);
  const draft = docs.find(d => d._id.startsWith('drafts.'));
  assert(published?.language === 'en' && published?.client?._ref === 'bf0e4443-5cd6-40c0-9422-f0a15a4195c5', 'Pilot campaign/client changed');
  assert(published.channel.includes('1spWeb') && published.channel.includes('msmWeb'));
  const source = JSON.parse(readFileSync('scripts/data/renaissance-rewrite-v4.json', 'utf8'));
  const copy = (row: number) => source.rows.find((r: any) => r.row === row).rewrite;
  const edition = {
    _type: 'caseWebsiteContent', _key: 'renaissance-v4', channel: 'renaissanceWeb',
    title: 'S.T.A.L.K.E.R. 2: Heart of Chornobyl',
    description: copy(91).split(' Renaissance delivered')[0], bodyMode: 'custom', mediaMode: 'inherit',
    casesPageBuilder: [
      { _type: 'headlineChallenge', _key: 'rpr-v4-91', title: 'The brief', description: copy(91) },
      { _type: 'resultsMetrics', _key: 'rpr-v4-92', title: 'Results', description: copy(92), fullWidth: true, metrics: [] },
    ],
  };
  const current = draft || published;
  const existing = current.siteContent?.find((e: any) => e.channel === 'renaissanceWeb');
  if (existing) {
    assert.deepEqual(existing, edition, 'Existing Renaissance edition differs; reconcile instead of overwriting');
    console.log('Pilot draft already matches the v4 edition.');
    return;
  }
  const content = { channel: [...new Set([...current.channel, 'renaissanceWeb'])], siteContent: [...(current.siteContent || []), edition] };
  console.log(JSON.stringify({ mode: process.env.RENAISSANCE_PILOT_APPLY === '1' ? 'apply' : 'dry-run', projectId: 'wu6i3y0h', dataset: 'production', id, existingDraft: Boolean(draft), sharedTitle: published.title, sharedNarrative: published.casesPageBuilder?.map((b: any) => ({ type: b._type, description: b.description, challengeDescription: b.challengeDescription })), edition, publishedDocumentWillChange: false }, null, 2));
  if (process.env.RENAISSANCE_PILOT_APPLY !== '1') return;
  const backupRoot = 'EXPORT/production-before-channel-editions-2026-09-19T11-30-09Z';
  const manifest = JSON.parse(readFileSync(`${backupRoot}/manifest.json`, 'utf8'));
  assert.equal(createHash('sha256').update(readFileSync(`${backupRoot}/production.tar.gz`)).digest('hex'), manifest.sha256);
  const folder = `EXPORT/renaissance-rewrite-v4/pilot-${new Date().toISOString().replaceAll(':', '-')}`;
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  writeFileSync(`${folder}/before.json`, JSON.stringify(docs, null, 2), { mode: 0o600 });
  const baselines = await Promise.all(['1spWeb', 'msmWeb'].map(channel => client.fetch(CASE_STUDY_BY_SLUG_QUERY, { slug: published.slug.current, channel, language: 'en' }, { perspective: 'published' })));
  const tx = client.transaction();
  if (draft) tx.patch(draft._id, p => p.ifRevisionId(draft._rev).set(content));
  else {
    const { _rev, _createdAt, _updatedAt, ...body } = published;
    assert.equal((await client.getDocument(id))?._rev, _rev, 'Published source changed while preparing the draft');
    tx.create({ ...body, ...content, _id: `drafts.${id}` });
  }
  await tx.commit();
  const after = await client.getDocument(`drafts.${id}`);
  assert.deepEqual(after?.siteContent, content.siteContent);
  for (const [channel, baseline] of ['1spWeb', 'msmWeb'].map((c, i) => [c, baselines[i]] as const)) {
    assert.deepEqual(await client.fetch(CASE_STUDY_BY_SLUG_QUERY, { slug: published.slug.current, channel, language: 'en' }, { perspective: 'published' }), baseline);
  }
  assert.equal(await client.fetch(CASE_STUDY_BY_SLUG_QUERY, { slug: published.slug.current, channel: 'renaissanceWeb', language: 'en' }, { perspective: 'published' }), null);
  const preview = await client.fetch<any>(CASE_STUDY_BY_SLUG_QUERY, { slug: published.slug.current, channel: 'renaissanceWeb', language: 'en' }, { perspective: 'drafts' });
  assert.equal(preview.title, edition.title); assert.equal(preview.casesPageBuilder[1].description, copy(92));
  writeFileSync(`${folder}/verification.json`, JSON.stringify({ id, slug: published.slug.current, draftRevision: after?._rev, sourceCells: ['F91', 'F92'], otherPublishedChannelsUnchanged: true, publishedRenaissanceAbsent: true, draftEditionResolved: true }, null, 2));
  console.log(JSON.stringify({ savedDraft: after?._id, slug: published.slug.current, backup: folder, published: false }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
