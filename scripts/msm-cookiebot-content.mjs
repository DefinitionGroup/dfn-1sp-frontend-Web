// Add the editable declaration to MSM's two staging privacy pages.
// Dry-run: pnpm exec sanity exec scripts/msm-cookiebot-content.mjs --with-user-token
// Apply that saved plan: MSM_COOKIEBOT_APPLY=1 followed by the same command.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';

const projectId = 'wu6i3y0h';
const dataset = 'production'; // Staging; live 1SP's dev-dataset is outside this operation.
const folder = 'EXPORT/msm-cookiebot-2026-10-06';
const client = getCliClient({apiVersion: '2025-09-16'}).withConfig({projectId, dataset, useCdn: false, perspective: 'raw'});
const ids = ['page-msm-privacy-policy-en', 'page-msm-privacy-policy-de'];

function declarationFor(page) {
  return {
    _type: 'contentSection',
    _key: 'cookiebot-declaration',
    title: page.language === 'de' ? 'Cookie-Erklärung' : 'Cookie declaration',
    showCookieDeclaration: true,
    hideFromNav: true,
    contentSize: 'base',
  };
}

function assertPage(page) {
  assert(page && ids.includes(page._id));
  assert.equal(page.channel, 'msmWeb');
  assert.equal(page.slug?.current, 'privacy-policy');
  assert(['en', 'de'].includes(page.language));
  assert(Array.isArray(page.content));
}

if (process.env.MSM_COOKIEBOT_APPLY === '1') {
  const plan = JSON.parse(readFileSync(`${folder}/plan.json`, 'utf8'));
  assert.equal(plan.projectId, projectId);
  assert.equal(plan.dataset, dataset);
  const backup = readFileSync(plan.backup);
  assert.equal(createHash('sha256').update(backup).digest('hex'), plan.backupSha256);
  const before = JSON.parse(backup);
  const current = await client.getDocuments(ids);
  const drafts = await client.getDocuments(ids.map(id => `drafts.${id}`));
  assert(drafts.every(draft => !draft), 'Resolve unpublished privacy-page drafts before applying.');
  let transaction = client.transaction();
  for (const change of plan.changes) {
    const page = current.find(page => page?._id === change.id);
    assertPage(page);
    assert.equal(page._rev, change.revision, 'The page changed since dry-run.');
    assert.deepEqual(change.declaration, declarationFor(page));
    assert(!page.content.some(block => block.showCookieDeclaration || block._key === change.declaration._key));
    transaction = transaction.patch(page._id, patch => patch.ifRevisionId(change.revision).append('content', [change.declaration]));
  }
  const receipt = plan.changes.length ? await transaction.commit() : null;
  const after = await client.getDocuments(ids);
  for (const page of after) {
    assertPage(page);
    const original = before.find(item => item._id === page._id);
    const changed = plan.changes.some(change => change.id === page._id);
    assert.deepEqual(page.content, changed ? [...original.content, declarationFor(page)] : original.content);
    for (const field of Object.keys(original).filter(field => !['_rev', '_updatedAt', 'content'].includes(field))) {
      assert.deepEqual(page[field], original[field]);
    }
  }
  writeFileSync(`${folder}/after.json`, JSON.stringify(after, null, 2), {mode: 0o600});
  writeFileSync(`${folder}/receipt.json`, JSON.stringify({transactionId: receipt?.transactionId, ids: plan.changes.map(change => change.id)}, null, 2), {mode: 0o600});
  console.log(JSON.stringify({mode: 'applied', projectId, dataset, transactionId: receipt?.transactionId, changed: plan.changes.length}));
} else {
  const pages = await client.getDocuments(ids);
  pages.forEach(assertPage);
  const drafts = await client.getDocuments(ids.map(id => `drafts.${id}`));
  assert(drafts.every(draft => !draft), 'Resolve unpublished privacy-page drafts before applying.');
  const changes = pages.filter(page => !page.content.some(block => block.showCookieDeclaration === true)).map(page => {
    assert(!page.content.some(block => block._key === 'cookiebot-declaration'));
    return {id: page._id, revision: page._rev, declaration: declarationFor(page)};
  });
  mkdirSync(folder, {recursive: true});
  const backup = `${folder}/before-${Date.now()}.json`;
  const backupText = JSON.stringify(pages, null, 2);
  writeFileSync(backup, backupText, {mode: 0o600});
  const backupSha256 = createHash('sha256').update(backupText).digest('hex');
  const plan = {projectId, dataset, backup, backupSha256, changes};
  writeFileSync(`${folder}/plan.json`, JSON.stringify(plan, null, 2), {mode: 0o600});
  console.log(JSON.stringify({mode: 'dry-run', ...plan}));
}
