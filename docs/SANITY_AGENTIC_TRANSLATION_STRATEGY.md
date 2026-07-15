# Sanity agentic translation strategy

## Outcome

Build a channel-aware translation system that creates reviewable drafts without
changing the existing document-level localization contract or publishing AI
output automatically.

The stable workflow starts with Sanity Content Agent. Programmatic Agent
Actions are introduced only as a guarded development-dataset pilot because the
Translate API is still experimental.

## Locale policy

The source of truth is `@1sp/site-config`.

| Scope | Source | Targets |
| --- | --- | --- |
| 1SP pages and menus | English | none currently |
| MSM pages and menus | English | German |
| Studio CO2 pages and menus | English | German |
| FLZR pages and menus | English | German, Polish |
| Global reusable content | English | Languages required by its assigned channels |

Website-specific document types are `page` and `menu`. Global reusable types
are `caseStudy`, `unit`, `client`, `person`, `services`, `serviceGroup`, and
`oneSpComponentGroup`.

A global document assigned to MSM needs English and German. One assigned to
FLZR needs English, German, and Polish. A global assigned to several channels
needs the union of their languages. An unassigned global is treated as
platform-wide and therefore needs every platform language.

Changing a locale in `SITE_CONFIGS` changes the Studio template and audit
policy. Global translation requirements are calculated from each document's
channel assignments rather than maintained as a separate fixed language list.

## Tool responsibilities

### Content Agent: stable reviewed bulk work

Use Content Agent in the Sanity Dashboard to find translation gaps, propose
translations, and place approved changes into drafts or a Content Release.
Content Agent must remain approval-gated.

Recommended prompt pattern:

```text
Find published FLZR pages whose English translation family has no German
member. Use the FLZR Translation Guidelines document as context. Propose German
drafts only. Preserve protected terms, references, URLs, IDs, and tracking
values. Do not publish anything.
```

Start with three documents, review the result, then expand the batch.

### Translation Guidelines: editorial control plane

Studio exposes one fixed guidelines document for global content and one per
website channel. Each stores:

- voice and style guide;
- protected terms;
- approved glossary translations;
- a human review checklist.

These documents are attached as Content Agent context now. Later, the same
documents become `styleGuide` and `styleGuideParams` inputs for Agent Actions,
so automation does not hardcode brand voice in a function.

### Agent Actions Translate: automatic draft generation

Agent Actions is the programmatic layer for creating translation drafts from a
Sanity Function, CI job, or controlled script. It is not enabled for automatic
writes in this first slice.

The future pipeline is:

1. A source-language document is published.
2. Resolve the expected target locales from `@1sp/site-config`.
3. Find its `translation.metadata` family.
4. Skip target locales already represented by a published document or draft.
5. Load the matching Translation Guidelines document.
6. Call Agent Actions Translate into a deterministic draft target.
7. Link the new target to the existing translation family.
8. Put the result into a Content Release or normal draft state.
9. Notify editors; never publish automatically.

The function must be idempotent and must ignore translation metadata documents,
translation-generated mutations, non-source locales, and documents without a
valid scope.

## Safety gates

Run before every pilot or batch:

```bash
pnpm doctor:sanity
pnpm doctor:translations
```

Automatic writes stay blocked when the translation audit reports:

- empty translation families;
- dangling family references;
- source documents without a translation family;
- invalid or ambiguous channel assignment.

Missing targets are expected work, not a structural failure. Existing language
documents that are not linked into the same family must be repaired rather than
silently duplicated.

## Rollout

### Phase 1 — implemented foundations

- Central locale policy shared by frontend and Studio.
- Global English/German policy separated from per-channel locales.
- Translation Guidelines schema and fixed Studio documents.
- Read-only translation readiness audit.
- Deployed-schema and connected-Studio readiness verified on `dev-dataset`.

### Phase 2 — editorial Content Agent pilot

1. Fill the global and FLZR/MSM guideline documents.
2. Repair the empty and unlinked metadata families reported by the audit.
3. Ask Content Agent to translate one FLZR page from English to German.
4. Approve into a draft or dedicated Content Release.
5. Review Portable Text, page-builder strings, SEO, slugs, links, references,
   legal claims, and brand terminology.
6. Repeat for Polish only after German quality is accepted.

### Phase 3 — guarded Agent Actions pilot

- Development dataset only.
- One explicit document ID and one target locale per run.
- Dry-run output by default; an explicit execution flag is required.
- Abort when a target or unlinked sibling already exists.
- Create drafts only and link them to the existing family.
- Log source ID, target ID, locale pair, schema ID, and operation result.

### Phase 4 — event-driven automation

After the pilot is repeatable, move the same logic into a Sanity Function that
reacts to source-language publish events. Add retry/idempotency controls and a
monthly AI-credit budget. Keep the human publish gate.

### Phase 5 — freshness automation

Track whether the source changed after its translated sibling. Content Agent or
a scheduled audit should surface stale translations for review; it should not
overwrite reviewed translations automatically.

## Current platform constraints

- Content Agent requires a connected Studio and deployed schema; both are now
  present for the development dataset.
- Content Agent proposes changes for approval; it is not an unattended event
  trigger.
- Agent Actions Translate currently remains experimental.
- Translate `create` produces an unlinked draft, so translation-family linking
  is an application responsibility.
- AI-generated translations require human review and consume Sanity AI credits.

Official references:

- [Content Agent introduction](https://www.sanity.io/docs/content-agent/introduction)
- [Agent Actions Translate quick start](https://www.sanity.io/docs/agent-actions/translate-quickstart)
- [Content translation with AI Assist](https://www.sanity.io/docs/studio/ai-assist-content-translation)
- [Document internationalization](https://www.sanity.io/plugins/document-internationalization)
