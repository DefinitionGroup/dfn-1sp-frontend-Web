> Completed-work record, classified 2026-09-20. Counts, verification and pending items describe the recorded run, not a live status check or instructions to replay it. See the [documentation index](../../README.md).

# Sanity attribute model options

> Follow-up: Stages 1 and 2 are complete. The deferred next steps and refreshed estimates are recorded in [Sanity data structure optimization recipe](../../SANITY_DATA_STRUCTURE_RECIPE.md). The figures below remain the original pre-cleanup research baseline.

Research date: 2026-09-19. Read-only schema/query investigation, with a fresh dataset backup and local simulations. No schema, runtime, or Content Lake mutations made. Measured local deltas below are estimates; architectural candidates without measurements have no claimed savings.

## Backup and measured findings

Fresh backup: `EXPORT/msmcontent-migration.tar.gz`, project `wu6i3y0h`, dataset `production`. The archive was opened successfully and all **966 exported documents** parsed. SHA-256: `533beb0b539eeb39b762b7d94b917c75250dba6877a5d38d1fd146d747ea580d`; a matching `.sha256` sidecar is saved. It includes published and draft content. It contains no native Sanity asset binaries; Cloudinary references/metadata are preserved, but this is not a separate backup of Cloudinary originals. The archive is locally restricted and ignored by Git.

The live, non-stale stats response reports **1,991 / 2,000 attributes**. The archive analyzer counts **1,989**. These are deliberately kept separate: the two-attribute difference has not been reconciled, and the API also reports 978 documents compared with 966 in the standard export. Treat the API as the quota authority and local deltas as estimates, not guaranteed post-migration API totals.

The local inventory shows:

- 1,038 combinations under the root `content` field; 146 under `casesPageBuilder`; 92 under `siteContent`.
- Cloudinary assets at 38 distinct locations, with 998 combinations under those media locations. This overlaps the preceding root totals; it must not be added to them.
- Only one null-typed path. Routine null cleanup is not a material solution here.
- The largest individual exported document shape has 318 combinations in this model. Dataset-wide diversity is the immediate pressure.

The following are **independent in-memory simulations on the export**. No transformed documents were uploaded. Each row is compared with 1,989 unless explicitly labeled combined.

| Simulated change | Local attributes after | Net reduction | Assessment |
| --- | ---: | ---: | --- |
| Remove only Cloudinary `created_by`, `uploaded_by`, `folder_id`, `asset_folder` from embedded `cloudinary.asset` objects | 1,749 | 240 | Best first prototype: operator/folder bookkeeping repeated at many paths |
| Broader media trim, retaining tags, custom metadata, display names, original filenames, identities, URLs, dimensions, duration and delivery version | 1,590 | 399 | Larger opportunity; includes plugin-related fields and needs stronger compatibility checks |
| Full tested operational-media trim, also removing tags/custom metadata/display names/original filenames | 1,497 | 492 | Upper exploration case, **not** the recommended default; semantic metadata may be needed |
| Rename root case `casesPageBuilder` storage to `content` | 1,897 | 92 | Cross-app/query/schema migration; renderers can remain separate |
| Full tested media trim plus root case-field alignment | 1,437 | 552 | Shows overlap: savings are not additive |
| Move embedded editions into separate referenced documents with root-level fields | 1,915 | 74 | Illustrative shape only; likely too much editor complexity for this saving alone |
| Remove null-valued properties | 1,988 | 1 | Negligible |
| Hypothetical state after replacing published bodies with their current draft bodies | 1,988 | 1 | Publishing is not an attribute-reduction strategy; this is not authorization to publish |

The broad media trim removes `_version`, `access_control`, `access_mode`, `asset_folder`, `bytes`, `created_at`, `created_by`, `folder_id`, `uploaded_by`; the full case additionally removes `metadata`, `tags`, `original_filename`, `display_name`. These are hypotheses for review, not an approved field deletion list. The delivery `version` is retained. Alt text and focal/crop settings are retained in every media scenario.

**Durability matters.** The installed `sanity-plugin-cloudinary` 2.0.7 copies the provider asset response into the saved field in both single-asset and array insertion paths (`node_modules/sanity-plugin-cloudinary/dist/index.js`, lines 425–467 and 628–632). A one-time cleanup can therefore grow back. First prototype a controlled input/import boundary that stores an agreed payload, including all required identity, rendering and editorial fields. Test select, replace, preview and array insertion before migrating stored media. Do not edit `node_modules` as the implementation.

The four-field candidate has no identified frontend read in the repository search. `asset_folder` is used as a Cloudinary **upload request parameter** in import scripts; that use must remain. Removing its stored copy from Sanity would not move assets in Cloudinary. Conversely, the shared video helper reads `metadata.resource_type` / `metadata.format` as fallbacks, so blindly deleting all metadata is not appropriate without resolving those dependencies.

Evidence: [backup record](../../../outputs/sanity-attribute-audit-20260919/backup.json), [live stats](../../../outputs/sanity-attribute-audit-20260919/live-stats.json), [path inventory](../../../outputs/sanity-attribute-audit-20260919/attributes.json), [simulations](../../../outputs/sanity-attribute-audit-20260919/scenarios.json), [media field savings](../../../outputs/sanity-attribute-audit-20260919/media-field-savings.json), and [shared media helpers](../../../packages/utils/src/cloudinary.ts).

**Recommended first scope:** keep Globals and existing editions; prototype the four-field media policy, then revision-guarded cleanup across every occurrence in draft and published content, followed by official stats and all-site media checks. Aim initially to recover at least 200 attributes, with a project warning threshold around 80% utilization. No such implementation or cleanup was performed during this investigation.

## What the limit means

Sanity counts populated path/datatype combinations across a dataset, not declared schema fields or the number of values. Repeating an existing shape is cheap; nesting the same shape at another path introduces another set. A removed schema field still counts while stored content uses it. A path disappears from the count only after its final occurrence is removed. Sanity recommends array page builders, bounded nesting, semantic fields, document-level localization, and a dataset export before restructuring. The official stats endpoint reports count and limit. [Sanity: Attribute limit](https://www.sanity.io/docs/content-lake/attribute-limit)

The documented dataset limits are 2,000 attributes on Free and 10,000 on Growth/Enterprise. Different primitive types at the same path count separately; arrays also count their element datatypes. Separate document limits remain: 1,000 attributes on Free/Growth, 8,000 on Enterprise, 20 levels of nesting, and 32 MB JSON. Growth therefore provides dataset headroom but does not remove every modeling constraint. [Sanity: Technical limits](https://www.sanity.io/docs/content-lake/technical-limits)

## Preserve the successful decisions

**Keep Globals, channel assignments, website editions, and distinct site renderers.** The current `siteContent[]` selector stores the channel as a value instead of creating `renaissanceContent`, `msmContent`, etc. The model can accommodate another channel at existing paths. Its weakness is heavy content nested inside an edition, not the existence of editions.

The same applies to language: the current translated-document model should stay. Studio groups, labels, channel filters, and hiding fields are editor concerns; reorganizing those alone is not a data migration. Sources: [case edition schema](../../../packages/sanity-schema/src/Global/Cases/caseWebsiteContent.ts), [service edition schema](../../../packages/sanity-schema/src/Global/Objects/serviceWebsiteContent.ts), [person edition schema](../../../packages/sanity-schema/src/Global/Objects/personWebsiteContent.ts).

The page builder already uses `page.content[]`. The query explicitly records that the previous per-channel content arrays were migrated away. Do not propose that same migration again or assume old content remains without checking the export. Sources: [page schema](../../../packages/sanity-schema/src/page.ts), [unified queries](../../../packages/sanity-queries/src/groq.ts).

## Options in recommended order

| Option | Concrete repository evidence | Proposed change, subject to measurement | Tradeoff |
|---|---|---|---|
| Remove proven obsolete stored fields | MSM Units support `image`, legacy `heroMedia`, and `heroImageSource`; queries coalesce them. | Inventory every stored path, its consumers, and all documents using it. Retire only values proven superseded and recoverable. | Lowest architectural disruption; a fallback may still be important to a published document. Removing a draft occurrence alone may free nothing. |
| Normalize embedded media | `cloudinary.asset` is embedded in cases, editions, page blocks, menu items, portraits, awards and client collections; `cloudinaryImage` adds an `asset` wrapper. | First identify unnecessary provider response fields. Longer term, consider a shared media document containing canonical Cloudinary identity/metadata, with use-specific alt/crop/focal data remaining beside each reference. | Potentially substantial path consolidation, but requires custom Studio input, dereferencing, preview compatibility and publish/reference handling. Do not blindly strip fields expected by the Cloudinary plugin. |
| Consolidate duplicated text structures | `tabbedContentSection` uses `content1[]`, `content2[]`, `tab1Label`, `tab2Label`; each text structure has spans and annotations. | Prototype `items[]` with `title` and `content[]`, keeping the current two-tab UI if desired. | Removes an arbitrary numbered-field convention. Must compare net paths, including the new array containers, and preserve order and formatting. |
| Align case composition storage | The same case block types exist under root `casesPageBuilder[]` and `siteContent[].casesPageBuilder[]`, in addition to page `content[]`. | Explore an explicit case-composition document with a root `content[]`, referenced by shared cases or individual website editions. A smaller alternative is root case `content[]` alignment, which does not solve nested editions by itself. | Larger migration across queries, preview and publication workflows. Beneficial only if enough existing nested paths are actually eliminated; retaining both copies indefinitely defeats the purpose. |
| Reduce presentation field proliferation | `twoColContentSection` exposes `titleColor`, `backgroundColor`, `showGridBackground`, `contentSize`, `paddingY`, and site-specific media settings. | Prefer a small set of purposeful layout variants interpreted by each app; keep meaningful editorial choices. | Preserve existing layouts. Savings likely secondary to media/text structure; do not trade identity or editor control for a few fields. |
| Establish an attribute budget | `scripts/msm-attributes.ts` and migration preflight already count path/type sets. | Generalize the read-only analyzer and evaluate proposed migrations against a full export. Measure net savings and temporary overlap, then compare against official stats. | A preventive control, not immediate cleanup. Local estimates must be calibrated against live statistics. |

Source files: [MSM Unit schema](../../../packages/sanity-schema/src/MSM/msmUnit.ts), [Cloudinary wrapper](../../../packages/sanity-schema/src/Global/Objects/cloudinaryImage.ts), [migration asset payload](../../../scripts/msm-content-assets.ts), [tabbed section](../../../packages/sanity-schema/src/1SP/Components/tabbedContentSection.ts), [two-column section](../../../packages/sanity-schema/src/1SP/Components/twoColContentSection.ts), [case presentation](../../../packages/sanity-queries/src/case-presentation.ts), [attribute analyzer](../../../scripts/msm-attributes.ts).

## The case-edition question

For small differences, keep the present override model. A different title, summary, role, quote, or selected media does not require a new global entity. A website-specific case body should remain a complete, intentional composition; do not reduce it to fragile positional patches against another channel's blocks.

For large bodies, references are worth a measured prototype:

```text
Global case identity
  shared composition -> composition document { content[] }
  website editions[]
    channel, title/summary/SEO overrides
    composition -> composition document { content[] }
```

This preserves one campaign identity and independent channel narratives. It is a proposed ownership/storage boundary, not a request to duplicate a case for every website. Smaller overrides can stay embedded. Studio could still present everything beneath Globals with a channel tab, but composing that editing experience and coordinating publication would require implementation work.

There are existing reference-based precedents: [Renaissance shared content](../../../packages/sanity-schema/src/Renaissance/Documents/sharedContent.ts) and [1SP component groups](../../../packages/sanity-schema/src/Global/oneSpComponentGroup.ts). Do not reuse the latter indiscriminately: it intentionally renders canonical 1SP components even when hosted elsewhere. MSM and Renaissance need their own renderer identity.

## Avoid these apparent shortcuts

- **Removing Globals or splitting each channel into its own dataset as the first response.** That introduces distribution and shared-identity problems for services, clients, people and cases. Consider separate datasets only for a real organizational or release boundary.
- **Renaming object types or reducing the Studio block menu.** That does not by itself remove populated data paths.
- **Replacing all rich text with plain strings or serialized JSON.** Current case/legal copy needs links and structure; hiding data sacrifices editing, querying and validation.
- **Replacing every field with a generic key/value array.** Useful for genuinely extensible specifications, poor for stable editorial concepts and predictable queries.
- **Deleting media assets or documents simply because there are many.** Quantity is not the primary measure here; the analyzer should identify exclusive paths and legitimate consumers first.
- **Automatically resetting editions to shared content.** The existing [CaseEditionInput](../../../packages/sanity-schema/src/Global/Cases/CaseEditionInput.tsx) explicitly supports copied, independent compositions. Similar-looking content may represent an intentional divergence.

## Suggested decision

Use a staged approach: measured obsolete-field cleanup, then a media payload/reference prototype, then composition consolidation only if the measured result justifies the extra workflow. Preserve current schemas as readable compatibility contracts until each consumer has migrated, but budget for the temporary old/new overlap. Validate published and draft behavior in all affected apps before removing old stored paths.

Do not regard the present spare capacity as a durable operating margin. Increasing the plan can provide room for safe migration and normal editing while structural improvements proceed; it is a separate commercial decision, not an automatic action or a substitute for cleanup. Establish a project-owned warning threshold with comfortable headroom instead of operating immediately below the hard limit.
