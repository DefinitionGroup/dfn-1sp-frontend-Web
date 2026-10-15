// Formatting only. Dry-run first with sanity exec --with-user-token.
// Apply the saved, revision-guarded plan with MSM_LEGAL_FORMATTING_APPLY=1.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';

const projectId = 'wu6i3y0h';
const dataset = 'production';
const folder = 'EXPORT/msm-legal-formatting-2026-10-04';
const client = getCliClient({apiVersion: '2025-09-16'}).withConfig({projectId, dataset, useCdn: false, perspective: 'raw'});
const ids = ['page-msm-disclaimer-de', 'page-msm-disclaimer-en', 'page-msm-privacy-policy-de', 'page-msm-privacy-policy-en'];
const text = block => (block.children || []).map(span => span.text || '').join('');
const withoutWhitespace = value => value.replace(/\s/g, '');
const normal = block => block._type === 'block' && block.style === 'normal' && !block.listItem;

function inlineSemantics(blocks) {
  return blocks.flatMap(block => (block.children || []).filter(span => withoutWhitespace(span.text || '')).map(span => ({
    text: withoutWhitespace(span.text),
    marks: (span.marks || []).map(mark => {
      const definition = block.markDefs?.find(item => item._key === mark);
      if (!definition) return mark;
      const {_key, ...value} = definition;
      return value;
    }),
  })));
}

function merge(blocks) {
  assert(blocks.every(normal), 'Only plain paragraphs may become line groups.');
  return {
    ...blocks[0], _key: `formatted-${blocks[0]._key}`,
    children: blocks.flatMap((block, index) => [
      ...(index ? [{_type: 'span', _key: `break-${index}`, marks: [], text: '\n'}] : []),
      ...block.children.map(span => ({...span, _key: `${index}-${span._key}`, marks: (span.marks || []).map(mark => block.markDefs?.some(def => def._key === mark) ? `${index}-${mark}` : mark)})),
    ]),
    markDefs: blocks.flatMap((block, index) => (block.markDefs || []).map(def => ({...def, _key: `${index}-${def._key}`}))),
  };
}

function mergeKeys(blocks, firstKey, lastKey) {
  if (blocks.some(block => block._key === `formatted-${firstKey}`)) return blocks;
  const start = blocks.findIndex(block => block._key === firstKey);
  const end = blocks.findIndex(block => block._key === lastKey);
  assert(start >= 0 && end >= start, `Missing contact range ${firstKey}–${lastKey}.`);
  return [...blocks.slice(0, start), merge(blocks.slice(start, end + 1)), ...blocks.slice(end + 1)];
}

function formatBlocks(source, page) {
  const isDisclaimer = page.slug.current === 'disclaimer';
  let blocks = source.map(block => {
    // Newly grouped lines and the authored German HubSpot address are intentional breaks.
    if (block._key.startsWith('formatted-') || (!isDisclaimer && page.language === 'de' && block._key === 'legal-198')) return block;
    let children = (block.children || []).map(span => span._type === 'span'
      ? {...span, text: span.text.replace(/[\t \u00a0]*\r?\n[\t \u00a0]*/g, ' ')} : span);
    // The old import lost separators between these distinct source runs.
    if (isDisclaimer && page.language === 'de') children = children.map(span => /^Registernummer:/.test(span.text || '') ? {...span, text: `\n${span.text}`} : span);
    if (!isDisclaimer && page.language === 'de' && block._key === 'legal-5') children = children.map(span => span._key === 'span-1' ? {...span, text: ` ${span.text.trimStart()}`} : span);
    if (!isDisclaimer && page.language === 'en' && block._key === 'legal-97') children = children.map((span, index) => ({...span, text: `${index ? '\n' : ''}${span.text.trim()}`}));
    return {...block, children};
  });

  if (isDisclaimer) {
    const output = [];
    let pending = [];
    let companyGroups = 0;
    for (const block of blocks) {
      if (block._key.startsWith('formatted-')) { output.push(block); companyGroups++; continue; }
      if (!normal(block)) { output.push(...pending, block); pending = []; continue; }
      pending.push(block);
      if (/^(?:VAT No\.|N\.I\.F\.)/.test(text(block).trim())) {
        output.push(merge(pending)); pending = []; companyGroups++;
      }
    }
    output.push(...pending);
    assert.equal(companyGroups, 9, 'All nine company entries must remain separate.');
    blocks = output;
  } else {
    if (page.language === 'en') blocks = mergeKeys(blocks, 'legal-3', 'legal-10');
    if (page.language === 'de') blocks = mergeKeys(blocks, 'legal-157', 'legal-158');
    // Existing inline-numbered clauses and provider details read as compact line groups.
    const output = [];
    for (let index = 0; index < blocks.length;) {
      const group = [blocks[index++]];
      const start = text(group[0]).trim();
      const pattern = /^\(1\)/.test(start) ? /^\(\d+\)/ : /^a\)/.test(start) ? /^[abc]\)/ : null;
      while (pattern && index < blocks.length && normal(blocks[index]) && pattern.test(text(blocks[index]).trim())) group.push(blocks[index++]);
      output.push(group.length > 1 ? merge(group) : group[0]);
    }
    blocks = output;
  }
  assert.deepEqual(inlineSemantics(blocks), inlineSemantics(source), 'Wording and inline link/emphasis meaning must stay identical.');
  return blocks;
}

function formatContent(page) {
  return page.content.map(section => section._type === 'contentSection'
    ? {...section, content: formatBlocks(section.content, page)} : section);
}

if (process.env.MSM_LEGAL_FORMATTING_APPLY === '1') {
  const plan = JSON.parse(readFileSync(`${folder}/plan.json`, 'utf8'));
  assert.equal(plan.projectId, projectId); assert.equal(plan.dataset, dataset);
  const backup = readFileSync(plan.backup);
  assert.equal(createHash('sha256').update(backup).digest('hex'), plan.backupSha256);
  const before = JSON.parse(backup);
  const current = await client.getDocuments(plan.changes.map(change => change.id));
  let transaction = client.transaction();
  for (const [index, change] of plan.changes.entries()) {
    assert(ids.includes(change.id)); assert.equal(current[index]?._rev, change.revision);
    assert.equal(current[index].channel, 'msmWeb');
    transaction = transaction.patch(change.id, patch => patch.ifRevisionId(change.revision).set({content: change.content}));
  }
  const receipt = await transaction.commit();
  const after = await client.getDocuments(plan.changes.map(change => change.id));
  for (const [index, change] of plan.changes.entries()) {
    assert.deepEqual(after[index].content, change.content);
    const original = before.find(page => page._id === change.id);
    for (const field of Object.keys(original).filter(field => !['_rev', '_updatedAt', 'content'].includes(field))) assert.deepEqual(after[index][field], original[field]);
  }
  writeFileSync(`${folder}/after.json`, JSON.stringify(after, null, 2), {mode: 0o600});
  writeFileSync(`${folder}/receipt.json`, JSON.stringify({transactionId: receipt.transactionId, ids: plan.changes.map(change => change.id)}, null, 2), {mode: 0o600});
  console.log(JSON.stringify({mode: 'applied', transactionId: receipt.transactionId, documents: after.length}));
} else {
  const pages = await client.getDocuments(ids);
  assert(pages.every(page => page?.channel === 'msmWeb'));
  const changes = pages.map(page => {
    const content = formatContent(page);
    assert.deepEqual(formatContent({...page, content}), content, 'Formatting must be idempotent.');
    return {id: page._id, revision: page._rev, content};
  }).filter(change => JSON.stringify(change.content) !== JSON.stringify(pages.find(page => page._id === change.id).content));
  mkdirSync(folder, {recursive: true});
  const backup = `${folder}/before-${Date.now()}.json`;
  const backupText = JSON.stringify(pages, null, 2);
  writeFileSync(backup, backupText, {mode: 0o600});
  const backupSha256 = createHash('sha256').update(backupText).digest('hex');
  writeFileSync(`${folder}/plan.json`, JSON.stringify({projectId, dataset, backup, backupSha256, changes}, null, 2), {mode: 0o600});
  console.log(JSON.stringify({mode: 'dry-run', projectId, dataset, backup, backupSha256, changes: changes.map(change => ({id: change.id, blocksBefore: pages.find(page => page._id === change.id).content.find(block => block._type === 'contentSection').content.length, blocksAfter: change.content.find(block => block._type === 'contentSection').content.length}))}));
}
