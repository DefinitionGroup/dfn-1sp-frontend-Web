# Adding a PageBuilder block

Current repository guide, checked 2026-09-20. Pages use `content[]`; schema definitions live under `packages/sanity-schema/src`. The [original single-site guide](archived/guides/pagebuilder-guide-original.md) is retained only as history.

## Choose ownership first

Identify the website and whether this is a page block, a case block or a genuinely shared data contract. Read that app's design guidance. Renaissance work also requires its [component contract](../apps/renaissance-web/design-system/COMPONENTS.md) and [release checklist](../apps/renaissance-web/design-system/RELEASE-CHECKLIST.md).

For service blocks, read [Service content](SERVICE_CONTENT.md) first: a block should reference reusable service data where appropriate, not silently create a second editing source. Renaissance service-reference resolution is app-specific; a schema reference alone does not implement it in FLZR or MSM.

Reuse an existing block when its semantics fit. Sharing schema does not require routing each site through the root 1SP renderer.

## Implementation sequence

1. **Schema.** Add the object under the appropriate directory in [schema source](../packages/sanity-schema/src). Follow neighboring field, validation, media and preview conventions. Match the `_type` name exactly across schema, queries and renderer.
2. **Registration.** Register it through the relevant module (`1spContent.ts`, `flzrContent.ts`, `msmContent.ts`, `caseStudyContent.ts`) or [schema index](../packages/sanity-schema/src/index.ts), following the existing pattern. Registration and availability in an array are separate steps.
3. **Authoring.** For pages, add the supported type to [page.ts](../packages/sanity-schema/src/page.ts)'s `content.of`. For cases, inspect the root and [website-edition schema](../packages/sanity-schema/src/Global/Cases/caseWebsiteContent.ts) and enable only the intended contexts. Do not reintroduce the historical per-channel page fields.
4. **Projection and types.** Extend [shared queries](../packages/sanity-queries/src/groq.ts), app-specific resolution and [types](../packages/sanity-types/src) as needed. Resolve references explicitly and apply channel/language restrictions to global content. Preserve draft perspective and visual-editing metadata.
5. **Renderer.** Add the component to the appropriate app builder listed below. Use existing loading, error and empty-state conventions. Keep server fetching separate from interactive client code when the neighboring blocks do so.
6. **Media and interaction.** Use existing Cloudinary helpers and normalized storage boundaries. Preserve usage-specific alt text, focal points, video/poster behavior, keyboard support and reduced motion. Respect the site's design rather than copying a generic layout.
7. **Verification.** Confirm the block can be inserted and edited in local Studio, resolves through the actual page query and renders on desktop/mobile. Check draft preview and published rendering separately. Run focused contract tests and the affected app build; shared changes also require the 1SP build.

## Renderer entry points

| Website | Builder |
| --- | --- |
| 1SP | [components/PageBuilder.tsx](../components/PageBuilder.tsx) |
| FLZR | [FlzrPageBuilder.tsx](../apps/flzr-web/components/FlzrPageBuilder.tsx) |
| MSM | [MsmPageBuilder.tsx](../apps/msm-web/components/MsmPageBuilder.tsx) |
| Renaissance | [RenaissancePageBuilder.tsx](../apps/renaissance-web/components/RenaissancePageBuilder.tsx) |

Use `_key` values to preserve block identity. Handle nullable Sanity values explicitly; see [null handling](SANITY_NULL_HANDLING.md). A block appearing in the schema does not establish that every app supports it.

## Completion criteria

The intended channel can author the block, queries return the expected data, previews and public rendering work, and unrelated sites retain their behavior. Record validation limits. Schema deployment, frontend deployment and content publication remain separate release steps.

Before adding deeply nested or repeated structures, check [the deferred data structure recipe](SANITY_DATA_STRUCTURE_RECIPE.md) and current dataset capacity. That recipe is guidance for future work, not an instruction to migrate existing content while adding a block.
