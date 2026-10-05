import type {SanityClient} from 'sanity';

type Reference = {_type: 'reference'; _key?: string; _ref: string};
export type UnitDocument = {
  _id: string;
  _type: 'msmUnit';
  _rev: string;
  name?: string;
  language?: string;
  isActive?: boolean;
  sortOrder?: number;
  caseStudies?: Reference[];
};
export type CaseIdentity = {_id: string; _type: string; language?: string; channel?: string[]};
export type AssignmentSnapshot = {case: CaseIdentity | null; units: UnitDocument[]};
export type UnitAssignment = {
  id: string;
  document: UnitDocument;
  draft?: UnitDocument;
  published?: UnitDocument;
  assigned: boolean;
  publishedAssigned: boolean;
};

// Fetch both variants together; filter language AFTER choosing the draft so a
// unit whose draft has changed language cannot appear under its old language.
export const MSM_CASE_ASSIGNMENTS_QUERY = `{
  "case": *[_id == $caseId && _type == "caseStudy"][0]{_id, _type, language, channel},
  "units": *[_type == "msmUnit" && !(_id in path("versions.**"))]{
    _id, _type, _rev, name, language, isActive, sortOrder, caseStudies
  }
}`;

export function publishedCaseId(id: string): string {
  const result = id.replace(/^drafts\./, '');
  if (!result || result.startsWith('versions.')) throw new Error('Open the regular case draft to manage MSM units.');
  return result;
}

export function unitAssignments(documents: UnitDocument[], caseId: string, language: string): UnitAssignment[] {
  const id = publishedCaseId(caseId);
  const pairs = new Map<string, {draft?: UnitDocument; published?: UnitDocument}>();
  for (const document of documents) {
    if (document._type !== 'msmUnit' || document._id.startsWith('versions.')) continue;
    const unitId = document._id.replace(/^drafts\./, '');
    const pair = pairs.get(unitId) || {};
    if (document._id.startsWith('drafts.')) pair.draft = document;
    else pair.published = document;
    pairs.set(unitId, pair);
  }
  return [...pairs.entries()].flatMap(([unitId, pair]) => {
    const document = (pair.draft || pair.published)!;
    if (document.language !== language) return [];
    return [{id: unitId, document, ...pair,
      assigned: document.caseStudies?.some(ref => ref._ref === id) || false,
      publishedAssigned: pair.published?.caseStudies?.some(ref => ref._ref === id) || false,
    }];
  }).sort((a, b) => (a.document.sortOrder ?? 0) - (b.document.sortOrder ?? 0) || (a.document.name || a.id).localeCompare(b.document.name || b.id));
}

export function canAssignCase(document: CaseIdentity | null, caseId: string, language: string): boolean {
  return document?._id === publishedCaseId(caseId) && document._type === 'caseStudy' &&
    document.language === language && document.channel?.includes('msmWeb') === true;
}

/** Build only draft edits to the case reference being changed, never whole
 * arrays or published documents. Other cases, ordering and unit content survive. */
export function assignmentActions(snapshot: AssignmentSnapshot, caseId: string, language: string,
  baseline: UnitAssignment[], choices: Record<string, boolean>, createKey: () => string) {
  const id = publishedCaseId(caseId);
  if (!canAssignCase(snapshot.case, id, language)) {
    throw new Error('Publish this case with its MSM channel and language before saving unit assignments.');
  }
  const current = unitAssignments(snapshot.units, id, language);
  return Object.entries(choices).flatMap(([unitId, assigned]) => {
    const before = baseline.find(unit => unit.id === unitId);
    if (!before) throw new Error('Unknown unit. Reload assignments before saving.');
    if (before.assigned === assigned) return [];
    const unit = current.find(item => item.id === unitId);
    if (!unit || unit.assigned !== before.assigned || unit.document.isActive !== before.document.isActive) {
      throw new Error('A unit or its assignment changed while you were editing. Reload assignments and try again.');
    }
    if (assigned && unit.document.isActive === false) throw new Error('Activate the unit before adding cases to it.');
    return [{
      actionType: 'sanity.action.document.edit' as const,
      publishedId: unitId,
      draftId: `drafts.${unitId}`,
      patch: {
        ...(unit.draft ? {ifRevisionID: unit.draft._rev} : {}),
        // Removing before inserting also makes adding a reference idempotent
        // if another editor creates the first draft during the request.
        unset: [`caseStudies[_ref==${JSON.stringify(id)}]`],
        ...(assigned ? {
          setIfMissing: {caseStudies: []},
          insert: {after: 'caseStudies[-1]', items: [{_type: 'reference', _key: createKey(), _ref: id}]},
        } : {}),
      },
    }];
  });
}

type AssignmentClient = Pick<SanityClient, 'fetch' | 'action'>;
export function fetchAssignments(client: AssignmentClient, caseId: string) {
  return client.fetch<AssignmentSnapshot>(MSM_CASE_ASSIGNMENTS_QUERY, {caseId: publishedCaseId(caseId)},
    {perspective: 'raw', useCdn: false});
}

export async function saveAssignments(client: AssignmentClient, caseId: string, language: string,
  baseline: UnitAssignment[], choices: Record<string, boolean>) {
  const current = await fetchAssignments(client, caseId);
  const actions = assignmentActions(current, caseId, language, baseline, choices,
    () => crypto.randomUUID().replaceAll('-', ''));
  if (actions.length) await client.action(actions);
  return actions.map(action => action.publishedId);
}
