import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';

// Moves the MSM home smartCarousel directly below the casesIntro block.
// Dry run by default; MSM_HOME_CAROUSEL_APPLY=1 patches the published page.
//   pnpm exec sanity exec scripts/msm-home-carousel-order.ts --with-user-token

const ID = 'msm-page-home-en';
const CAROUSEL = 'c892a0f7aeca';
const ANCHOR = 'proof'; // casesIntro
const OUT = 'EXPORT/msm-home-carousel-order';

async function main() {
  assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 'wu6i3y0h');
  assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET, 'production');
  const client = getCliClient({apiVersion: '2025-09-16'}).withConfig({projectId: 'wu6i3y0h', dataset: 'production', perspective: 'raw', useCdn: false});
  assert(client.config().token, 'Run with sanity exec --with-user-token');

  const docs = await client.fetch<any[]>('*[_id in $ids]', {ids: [ID, `drafts.${ID}`]});
  const published = docs.find(d => d._id === ID);
  assert(published, `Missing ${ID}`);
  assert(!docs.some(d => d._id.startsWith('drafts.')), 'A draft exists; publish or discard it before reordering');

  const content: any[] = published.content;
  const block = content.find(b => b._key === CAROUSEL);
  assert.equal(block?._type, 'smartCarousel', 'smartCarousel block not found');
  assert.equal(content.find(b => b._key === ANCHOR)?._type, 'casesIntro', 'casesIntro anchor not found');

  const rest = content.filter(b => b._key !== CAROUSEL);
  const at = rest.findIndex(b => b._key === ANCHOR) + 1;
  const next = [...rest.slice(0, at), block, ...rest.slice(at)];
  assert.equal(next.length, content.length);
  assert.deepEqual(new Set(next.map(b => b._key)), new Set(content.map(b => b._key)), 'Block set changed');

  const apply = process.env.MSM_HOME_CAROUSEL_APPLY === '1';
  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run', id: ID, rev: published._rev,
    before: content.map(b => `${b._type}:${b._key}`),
    after: next.map(b => `${b._type}:${b._key}`),
  }, null, 2));
  if (!apply) return;

  mkdirSync(OUT, {recursive: true, mode: 0o700});
  writeFileSync(`${OUT}/before.json`, JSON.stringify(published, null, 2) + '\n', {mode: 0o600});
  await client.patch(ID).ifRevisionId(published._rev).set({content: next}).commit();
  const after = await client.fetch<any[]>('*[_id == $id][0].content[]{_type,_key}', {id: ID});
  assert.deepEqual(after.map(b => `${b._type}:${b._key}`), next.map(b => `${b._type}:${b._key}`), 'Order did not stick');
  console.log('Moved smartCarousel below casesIntro.');
}

main().catch(e => {console.error(e.message); process.exitCode = 1;});
