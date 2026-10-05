import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {assignmentActions, canAssignCase, MSM_CASE_ASSIGNMENTS_QUERY, publishedCaseId, saveAssignments, unitAssignments,
  type AssignmentSnapshot, type UnitDocument} from '../packages/sanity-schema/src/Global/Cases/msmUnitAssignments';

const require = createRequire(import.meta.url);
const {parse, evaluate} = createRequire(require.resolve('sanity/package.json'))('groq-js');
const campaign = {_id: 'case-one', _type: 'caseStudy', language: 'en', channel: ['msmWeb', '1spWeb']};
const reference = (id: string) => ({_type: 'reference' as const, _key: `key-${id}`, _ref: id});
const unit = (id: string, refs: string[] = [], extra: Partial<UnitDocument> = {}): UnitDocument => ({
  _id: id, _type: 'msmUnit', _rev: `rev-${id}`, name: id, language: 'en', isActive: true, caseStudies: refs.map(reference), ...extra,
});
const snapshot = (units: UnitDocument[]): AssignmentSnapshot => ({case: campaign, units});
const plan = (data: AssignmentSnapshot, choices: Record<string, boolean>, baseline = unitAssignments(data.units, campaign._id, 'en')) =>
  assignmentActions(data, 'drafts.case-one', 'en', baseline, choices, () => 'new-key');

test('one case can be added to three units, only through draft edit actions', () => {
  const data = snapshot([unit('communications', ['other-case']), unit('channel'), unit('xr')]);
  const original = structuredClone(data);
  const actions = plan(data, {communications: true, channel: true, xr: true});
  assert.equal(actions.length, 3);
  for (const action of actions) {
    assert.equal(action.actionType, 'sanity.action.document.edit');
    assert.equal(action.draftId, `drafts.${action.publishedId}`);
    assert.deepEqual(action.patch.insert?.items, [reference('case-one')].map(ref => ({...ref, _key: 'new-key'})));
    assert.deepEqual(action.patch.unset, ['caseStudies[_ref=="case-one"]']);
    assert.equal('set' in action.patch, false, 'Never replace a case array or other unit fields');
  }
  assert.deepEqual(data, original);
});

test('draft membership takes precedence while published membership remains visible', () => {
  const data = [unit('a', ['case-one']), unit('drafts.a', []), unit('b'), unit('drafts.b', ['case-one'])];
  const rows = unitAssignments(data, 'drafts.case-one', 'en');
  assert.deepEqual(rows.map(row => [row.id, row.assigned, row.publishedAssigned]), [['a', false, true], ['b', true, false]]);
});

test('draft language overrides published language; releases and other locales stay out', async () => {
  const units = [unit('a'), unit('drafts.a', [], {language: 'de'}), unit('b'), unit('c', [], {language: 'de'}), unit('versions.release.b')];
  const data = await (await evaluate(parse(MSM_CASE_ASSIGNMENTS_QUERY), {dataset: [campaign, ...units], params: {caseId: 'case-one'}})).get();
  assert.deepEqual(unitAssignments(data.units, 'case-one', 'en').map(row => row.id), ['b']);
  assert.equal(data.units.some((doc: UnitDocument) => doc._id.startsWith('versions.')), false);
  assert.throws(() => publishedCaseId('versions.release.case-one'), /regular case draft/);
});

test('removal targets only this case and guards the current draft revision', () => {
  const data = snapshot([unit('a', ['case-one', 'other-case']), unit('drafts.a', ['other-case', 'case-one'])]);
  assert.deepEqual(plan(data, {a: false})[0].patch, {ifRevisionID: 'rev-drafts.a', unset: ['caseStudies[_ref=="case-one"]']});
});

test('untouched memberships produce no writes, including existing pending assignments', () => {
  const data = snapshot([unit('a'), unit('drafts.a', ['case-one']), unit('b')]);
  assert.deepEqual(plan(data, {}), []);
  assert.deepEqual(plan(data, {a: true, b: false}), []);
});

test('fresh revisions preserve concurrent changes to unrelated case references', () => {
  const before = snapshot([unit('drafts.a', ['other-case'])]);
  const after = snapshot([unit('drafts.a', ['other-case', 'new-unrelated-case'], {_rev: 'fresh-revision'})]);
  const action = plan(after, {a: true}, unitAssignments(before.units, 'case-one', 'en'))[0];
  assert.equal(action.patch.ifRevisionID, 'fresh-revision');
  assert.equal(action.patch.insert?.after, 'caseStudies[-1]');
  assert.equal('set' in action.patch, false);
});

test('conflicting membership, removed units, language changes and unknown units fail before writing', () => {
  const before = unitAssignments([unit('a')], 'case-one', 'en');
  for (const units of [[unit('a', ['case-one'])], [], [unit('a', [], {language: 'de'})]]) {
    assert.throws(() => plan(snapshot(units), {a: true}, before), /changed while/);
  }
  assert.throws(() => plan(snapshot([unit('a')]), {unknown: true}), /Unknown unit/);
});

test('inactive units allow cleanup but cannot receive new assignments', () => {
  assert.throws(() => plan(snapshot([unit('a', [], {isActive: false})]), {a: true}), /Activate the unit/);
  assert.equal(plan(snapshot([unit('a', ['case-one'], {isActive: false})]), {a: false}).length, 1);
});

test('unpublished cases, removed MSM channel and language mismatches cannot be assigned', () => {
  for (const document of [null, {...campaign, _id: 'drafts.case-one'}, {...campaign, channel: ['1spWeb']}, {...campaign, language: 'de'}]) {
    assert.equal(canAssignCase(document, 'case-one', 'en'), false);
    assert.throws(() => plan({case: document, units: [unit('a')]}, {a: true}), /Publish this case/);
  }
  assert.equal(canAssignCase(campaign, 'case-one', 'en'), true);
});

test('save refetches state and sends all selected unit edits in one request', async () => {
  const data = snapshot([unit('a'), unit('b'), unit('c')]);
  const calls: unknown[] = [];
  const client = {
    fetch: async (...args: unknown[]) => {calls.push(args); return data;},
    action: async (actions: unknown) => {calls.push(actions); return {transactionId: 'test'};},
  } as unknown as Parameters<typeof saveAssignments>[0];
  const ids = await saveAssignments(client, 'case-one', 'en', unitAssignments(data.units, 'case-one', 'en'), {a: true, b: true, c: true});
  assert.deepEqual(ids, ['a', 'b', 'c']);
  assert.equal(calls.length, 2);
  assert.deepEqual((calls[0] as unknown[])[2], {perspective: 'raw', useCdn: false});
  assert.equal((calls[1] as unknown[]).length, 3);
});

test('save propagates transaction failures without retrying or publishing', async () => {
  const data = snapshot([unit('drafts.a')]);
  let attempts = 0;
  const client = {
    fetch: async () => data,
    action: async () => {attempts++; throw new Error('Revision conflict');},
  } as unknown as Parameters<typeof saveAssignments>[0];
  await assert.rejects(saveAssignments(client, 'case-one', 'en', unitAssignments(data.units, 'case-one', 'en'), {a: true}), /Revision conflict/);
  assert.equal(attempts, 1);
});
