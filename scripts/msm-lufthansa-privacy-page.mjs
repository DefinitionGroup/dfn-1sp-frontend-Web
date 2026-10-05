// Create the supplied English policy in MSM staging using existing legal-page blocks.
// Dry run: pnpm exec sanity exec scripts/msm-lufthansa-privacy-page.mjs --with-user-token
// Apply: MSM_LUFTHANSA_PRIVACY_APPLY=1 pnpm exec sanity exec scripts/msm-lufthansa-privacy-page.mjs --with-user-token
// Existing pages/drafts are never overwritten. Recovery evidence lives in ignored EXPORT/.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';

const projectId = 'wu6i3y0h';
const dataset = 'production'; // MSM staging; live 1SP uses dev-dataset.
const folder = 'EXPORT/msm-lufthansa-privacy-page-2026-10-05';
const source = readFileSync('apps/msm-web/data/lufthansa-mr-showroom-privacy-page.json', 'utf8');
const page = JSON.parse(source);
const sourceSha256 = createHash('sha256').update(source).digest('hex');
const client = getCliClient({apiVersion: '2025-09-16'}).withConfig({projectId, dataset, useCdn: false, perspective: 'raw'});
assert.equal(page._id, 'page-msm-privacy-policy-for-lufthansa-mr-showroom-en');
assert.equal(page.channel, 'msmWeb');
assert.equal(page.language, 'en');
assert.equal(page.slug.current, 'privacy-policy-for-lufthansa-mr-showroom');

function save(name, value) {
  writeFileSync(`${folder}/${name}.json`, JSON.stringify(value, null, 2), {mode: 0o600});
}

// Guard both the document identity and channel/language-scoped route, including drafts.
const existing = await client.fetch(`*[_id in $ids || (_type == "page" && channel == $channel && language == $language && slug.current == $slug)]`, {
  ids: [page._id, `drafts.${page._id}`], channel: page.channel, language: page.language, slug: page.slug.current,
});
if (existing.length) {
  assert.equal(existing.length, 1, 'A competing page or draft already exists.');
  for (const [key, value] of Object.entries(page)) assert.deepEqual(existing[0][key], value, `Existing ${key} differs; refusing to overwrite.`);
  console.log(JSON.stringify({mode: 'already-present', projectId, dataset, id: page._id}));
} else if (process.env.MSM_LUFTHANSA_PRIVACY_APPLY === '1') {
  const plan = JSON.parse(readFileSync(`${folder}/plan.json`, 'utf8'));
  assert.equal(plan.projectId, projectId);
  assert.equal(plan.dataset, dataset);
  assert.equal(plan.sourceSha256, sourceSha256, 'Content changed since dry run.');
  assert.deepEqual(plan.page, page);
  const receipt = await client.transaction().create(page).commit();
  const after = await client.getDocument(page._id);
  for (const [key, value] of Object.entries(page)) assert.deepEqual(after[key], value);
  save('after', after);
  save('receipt', {projectId, dataset, id: page._id, transactionId: receipt.transactionId});
  console.log(JSON.stringify({mode: 'created', projectId, dataset, id: page._id, transactionId: receipt.transactionId}));
} else {
  const disclaimer = await client.fetch('*[_type == "page" && channel == "msmWeb" && language == "en" && slug.current == "disclaimer" && !(_id in path("drafts.**"))][0]');
  assert(disclaimer?.content.some(block => block._type === 'servicesHeroWithBadge'));
  assert(disclaimer?.content.some(block => block._type === 'contentSection'));
  mkdirSync(folder, {recursive: true});
  save('before', {existing, disclaimer});
  save('plan', {projectId, dataset, sourceSha256, page});
  console.log(JSON.stringify({mode: 'dry-run', projectId, dataset, id: page._id, sections: page.content.slice(1).map(block => block.title), sourceSha256}));
}
