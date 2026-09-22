# Project feature map

Source inventory checked 21 September 2026 in the local worktree. Use [the project handoff](HANDOFF.md) for status and [operations](PROJECT_OPERATIONS.md) for execution. This map identifies implementation entry points; it is not a claim that every optional block is present in published content.

## Shared platform and Studio

| Capability | Implementation / guide | Details to preserve |
| --- | --- | --- |
| Channels, locales, site defaults | [site-config](../packages/site-config/src/index.ts), [architecture](ARCHITECTURE.md) | Five channels, four runtime apps; locale configuration is not content completeness |
| Schema and type contracts | [schema package](../packages/sanity-schema/src), [type package](../packages/sanity-types) | Shared schemas with app-specific rendering; backward compatibility matters for 1SP |
| Queries, caching, editions | [query package](../packages/sanity-queries/src), [case presentation](../packages/sanity-queries/src/case-presentation.ts), [service presentation](../packages/sanity-queries/src/service-presentation.ts) | Channel/language scoping, nullable fields and explicit inherit/custom semantics |
| Globals navigation/filtering | [Studio structure](../sanity/structure.ts), [Globals browser](../packages/sanity-schema/src/Studio/GlobalsBrowser.tsx), [tutorial](<studiocustomize -tut.md>) | Keep the Globals name; selected channel/language, assigned and unassigned views; filters do not duplicate content |
| Website-specific case content | [Case edition input](../packages/sanity-schema/src/Global/Cases/CaseEditionInput.tsx), [case tests](../scripts/case-website-content.test.ts) | Snapshot copy versus inheritance; explicit empty media/body; all editions publish in one document |
| Service copy, media and destinations | [editing contract](SERVICE_CONTENT.md), [audit and queue](SERVICE_CONTENT_HANDOFF.md) | Distinguish global identity, edition overview, service card and authored page narrative |
| Studio Presentation and preview links | [Studio config](../sanity.config.ts), [resolvers](../sanity/presentation/resolve.ts), [preview tests](../scripts/presentation-resolvers.test.ts) | Four separate app origins; page and document destinations must resolve for the correct channel |
| Translation | [guidelines schema](../packages/sanity-schema/src/Global/translationGuidelines.ts), [translation helpers](../packages/utils/src/translations.ts), [strategy](SANITY_AGENTIC_TRANSLATION_STRATEGY.md) | Separate translated documents and metadata; do not mistake schema support for a completed provider rollout |
| Cloudinary storage | [normalizer](../packages/utils/src/cloudinary-storage.ts), [Studio input](../sanity/components/CloudinaryStorageInput.tsx) | Embedded media objects remain; normalize redundant provider payload while retaining rendering fields |
| Shared component groups | [schema directory](../packages/sanity-schema/src/1SP), [import tests](../scripts/onesp-component-group-import.test.mjs) | Shared block references coexist with site-owned composition; validate consumers before changing a group |
| Relationships and cache actions | [Studio actions](../sanity/plugins/revalidateAction.ts), [relationship action](../sanity/lib/syncRelationships.ts), [server endpoint](../app/api/sync-relationships/route.ts) | Revalidate is separate from relationship mutation; synchronization is explicitly gated |

## Renderers, composition and motion

| Surface | Entry point | Important behavior |
| --- | --- | --- |
| Root pages and cases | [PageBuilder](../components/PageBuilder.tsx), [CasePageBuilder](../components/CasePageBuilder.tsx) | Preserve the established 1SP rendering baseline |
| FLZR pages and cases | [FlzrPageBuilder](../apps/flzr-web/components/FlzrPageBuilder.tsx), [case builder](../apps/flzr-web/components/CasePageBuilder.tsx) | Site-specific blocks, typography and composition |
| MSM pages and cases | [MsmPageBuilder](../apps/msm-web/components/MsmPageBuilder.tsx), [case builder](../apps/msm-web/components/CasePageBuilder.tsx), [design](../apps/msm-web/DESIGN.md) | Homepage-derived badge/selection sequence; dark case sections with block-specific motion |
| Renaissance pages and cases | [RenaissancePageBuilder](../apps/renaissance-web/components/RenaissancePageBuilder.tsx), [case builder](../apps/renaissance-web/components/CasePageBuilder.tsx) | Isolated visual contract with selected shared block support |
| Adding a block | [PageBuilder guide](PAGEBUILDER_COMPONENT_GUIDE.md), [helper package](../packages/pagebuilder-core/README.md) | Schema registration, projection, renderer and preview all need wiring. The helper is not automatically used by app switch registries |
| Shared menu membership CTA | [OneSpMembershipButton](../components/ui/OneSpMembershipButton.tsx), [Button2](../components/ui/Button2.tsx) | Green 1SP `minimenu` appearance across FLZR/MSM/Renaissance; label comes from site settings; local changes pending verification |
| MSM hero scramble and preview control cleaning | [DecryptRotator](../apps/msm-web/components/ui/DecryptRotator.tsx), [preview controls](../apps/msm-web/lib/preview-controls.ts) | Preserve `headlineReveal`; clean stega from enum/control comparisons, not indiscriminately from visible copy |
| MSM case in-view reveals | [CaseReveal](../apps/msm-web/components/pagebuilder/cases/CaseReveal.tsx), [CaseSection](../apps/msm-web/components/pagebuilder/cases/CaseSection.tsx) | Verify timing and viewport triggers block by block, including headline and text sequencing |
| MSM interactive service carousel | [block schema](../packages/sanity-schema/src/MSM/interactiveServiceCarousel.ts), [server resolver](../apps/msm-web/components/pagebuilder/server/InteractiveServiceCarouselBlock.tsx), [renderer](../apps/msm-web/components/pagebuilder/pg-InteractiveServiceCarousel.tsx), [motion hook](../apps/msm-web/components/pagebuilder/useServiceCarousel.ts) | Assigned services; one Motion track handles drag, wheel and settling. Autoplay pauses outside viewport, on hover/focus/interaction, when hidden, and for reduced motion |
| FLZR service destinations | [service page map](../apps/flzr-web/lib/service-pages.ts) | Frontend-owned mapping is a consolidation gap; preserve AI Solutions modal behavior |
| FLZR case categories | [reference category map](../apps/flzr-web/lib/reference-categories.ts) | Case IDs mapped to five category labels in code; not editable through service references |
| MSM Units | [domain context](../apps/msm-web/CONTEXT.md), [ADR](../apps/msm-web/docs/adr/0001-unit-owned-shared-content-attribution.md) | Dedicated site-owned pages and one-way case/person references |
| Renaissance homepage fallback | [authored fallback](../apps/renaissance-web/data/homepageFallback.ts) | Intended response to missing CMS homepage/content, not proof of a broken renderer |
| Renaissance section anchors and Origins | [section frame](../apps/renaissance-web/components/RenaissanceSectionFrame.tsx), [Origins](../apps/renaissance-web/components/RenaissanceOrigins.tsx) | Match marker roles and IDs to menu targets; section links and page links have different destinations |
| Renaissance temporal/news block | [RenaissanceNewsCTABlock](../apps/renaissance-web/components/RenaissanceNewsCTABlock.tsx) | `newsCTABlock` support exists independently of current homepage selection |
| Renaissance case carousel | [guide](renaissance-case-carousel.md), [renderer](../apps/renaissance-web/components/pagebuilder/pg-RenaissanceCaseCarousel.tsx) | Referenced case selection and order, responsive interaction and reduced motion |
| Renaissance shared portraits, clients and awards | [shared-content guide](../apps/renaissance-web/docs/shared-content.md), [component contract](../apps/renaissance-web/design-system/COMPONENTS.md) | Reusable/site-owned compositions and global identities have separate ownership |
| Results and metric counters | [implementation record](records/renaissance/renaissance-results-metrics-implementation.md), [mapping ledger](renaissance-results-metrics-mapping.md), [motion tests](../scripts/renaissance-metric-motion.test.ts) | Explanatory groups plus numeric counters; preserve units, qualifiers and meanings. Do not fabricate numbers from ranks/dates |
| Footer external banner | [guide](footer-external-banner.md) | Shared support, scoped site content; historical card counts are not a live inventory |

Read app design contracts before adjusting motion. Use `motion/react` where the app already does. Verify keyboard, touch, viewport activation and reduced motion in the browser; typechecking cannot prove them.

## Integrations and operational features

- [Contact API and forms](CONTACT_FORM.md): Sanity submission records, validation, honeypot and process-local request limiting; test the app-specific route and channel. Storage success is not email delivery.
- [Personio jobs endpoint](../app/api/personio/jobs/route.ts): recruiting credentials, normalization, process-local cache and configured XML fallback; app copies must be checked independently.
- [Cookiebot](../components/CookiebotBanner.tsx), [consent-aware Google Analytics](../components/GoogleAnalyticsConsent.tsx), [deployment-tier guards](../packages/utils/src/deployment-tier.ts): configuration and actual consent/network behavior are separate checks.
- SEO: each app owns metadata, sitemap and robots alongside its route model; see [deployment checks](DEPLOYMENT.md). Service structured data is another content consumer, not merely visible page text.
- Revalidation: app-local `/api/revalidate` and `/api/revalidate-home`, Studio action and Sanity live events; invalidating one deployment is not proof that all app caches were invalidated.
- Diagnostics: [local environment guide](local-sanity-debugging.md), package `doctor:*` scripts, component debug badges and root CSS diagnostic mode.

The [operations guide](PROJECT_OPERATIONS.md) records the practical checks and known boundaries for these integrations.
