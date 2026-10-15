# Documentation consolidation and fact-check — 21 September 2026

Status: completed documentation-only review. Application code, schema, CMS content and deployments were not changed. No commit or push was requested.

## Scope

The initial repository documentation inventory contained **78 Markdown files** in the root, `docs`, apps, packages and migration directory. All were classified and their local Markdown file targets checked. Generated output, private exports, dependency/vendor trees and hidden tool artifacts were excluded. This is a structural catalog plus targeted source/evidence review, **not a claim that every sentence in every historical design audit was re-proven**.

The content review concentrated on active entry points, service ownership, app/locale boundaries, PageBuilder storage and adoption, local configuration, publication status, deployment boundaries, deferred optimization, the root contact API and footer guidance. Dated service counts come from the direct production audits linked below. External URLs, Figma baselines, hosting settings, production releases, old visual measurements and provider/API readiness were not re-verified in this documentation pass.

## Canonical documents after consolidation

| Reader need | Canonical document | What remains elsewhere |
| --- | --- | --- |
| Resume service work | [Handoff](../../SERVICE_CONTENT_HANDOFF.md) | Dated audits retain measurements; no competing work queue in app READMEs |
| Understand service editing | [Service content](../../SERVICE_CONTENT.md) | App-specific pointers and Renaissance editor walkthrough |
| Understand platform ownership | [Architecture](../../ARCHITECTURE.md) | Domain decisions remain beside their apps |
| Find documentation | [Index](../../README.md) | Records, archives and templates keep distinct roles |
| Verify deployment | [Deployment verification](../../DEPLOYMENT.md) | Older deployment files remain labeled historical/compatibility references |
| Resume capacity optimization | [Deferred recipe](../../SANITY_DATA_STRUCTURE_RECIPE.md) | Stage reports retain dated statistics |

The former Renaissance guide mixed day-to-day editing with migration plans, backups and historical verification. Its original text is now preserved in [the September 19 record](../renaissance/renaissance-global-services-implementation-2026-09-19.md); [its original path](../../renaissance-global-services-and-studio.md) remains a concise current guide. No historical source mappings or recovery records were deleted.

## Claim reconciliation

| Claim / location | Verdict | Verified basis and disposition |
| --- | --- | --- |
| Pages should use `content[]` | True in current schema and queries | `packages/sanity-schema/src/page.ts`, `packages/sanity-queries/src/groq.ts`; maintained in architecture and block guide |
| Legacy page content fields are still temporarily present | False as a description of current schema | Studio `Content` helper text/comment is stale. Recorded in handoff as code/UI-copy debt; not changed by this documentation-only task |
| All Renaissance service copy lives in website editions | Overbroad | Live audit: four editions and two single-channel base records. Corrected maintained Renaissance guide |
| Renaissance service sections need another copy of the description | False for current implementation | Six section and six card references resolve Globals; preserve existing model |
| FLZR descriptions can be removed because cards open pages | False | AI Solutions modal and service-catalog JSON-LD still consume them. New canonical guide records the consumers |
| FLZR service landing-page links are CMS-owned | False today | `apps/flzr-web/lib/service-pages.ts` contains seven mappings; CMS relationship remains proposed |
| One service-to-page reference makes page prose inherit service content | False | MSM page reference supplies relationship/routing; inline blocks remain independent. Explicit in current guide |
| MSM has no drafts | True only at the September 20 publication checkpoint | September 21 audit finds one later AR-Link service draft, editorially equal to published. Publication record now states the checkpoint and links later evidence |
| MSM migration is draft-only / already published | Different phases, not contradictory present states | Original draft-only section is explicitly dated and separated from its later publication update |
| Footer banner setup in `dev-dataset` describes today's content | Unsupported/stale operational assumption | Kept as historical setup evidence; active guidance requires current dataset/menu verification |
| Footer banner always has ten agency cards | Snapshot-specific | Query filters determine current result; removed universal wording |
| Root contact API still needs its first spam/rate protection | False | Existing fixed-window limiter, honeypot, field/email checks and Content-Length guard in `app/api/contact/route.ts`; guide corrected without claiming complete protection |
| Client-supplied channel owns a contact submission | False | Root contact API obtains authoritative channel from server environment and validates language against site configuration |
| Every app already follows the package registry renderer | False | Current app builders do not call `renderBlocks`; package guide now describes optional helpers, not an automatic migration requirement |
| `defineRegistry<Union>` alone rejects every missing block | False for the current signature | A focused TypeScript probe accepted an incomplete two-member registry. Documentation now uses `satisfies Required<BlockRegistry<Union>>` for exhaustiveness; runtime/helper implementation unchanged |
| PageBuilder conversion is required whenever a builder is touched | Unsupported future instruction | Removed implied automatic work; adoption is a separate decision |
| MSM Unit attribution owns or mutates shared case/person identity | False | Unit ADR remains valid; context wording clarified to distinguish attribution from permitted website-edition edits |
| Shared `casesPageBuilder[]` has already moved to `content[]` | False | Case schema still uses root/edition case fields; Stage 3 remains deferred |
| Shared media references are already implemented | False | Embedded Cloudinary storage remains; referenced-media stage is proposed |
| Configured languages mean complete translated service content | False | FLZR has EN/DE/PL configuration but assigned global services are EN only at audit time |
| Published CMS / successful build / Git branch proves public deployment | False | Kept separate in handoff, architecture and release guide; provider state not inspected here |

## Retained with explicit status

- The July root `MEMORY.md` and `deploymentplan.md`, unified-page migration runbook, archived platform handoffs and older audits remain historical. Their original authorization, branch, dataset and progress claims are not current instructions.
- Stage 1/2 storage results and the recorded 1,567/2,000 attribute baseline remain dated evidence. Current capacity was not measured in this documentation pass; no estimated savings are promoted to verified live results.
- FLZR conversion work remains proposed, with separate enquiry and recruitment journeys. Navigation experiments from that plan do not override the later requested compact membership button implementation without a new design decision.
- Historical implementation/build/browser-check records remain evidence of the recorded revision. The dirty checkout and future release need their own checks.
- Templates remain starter/reference material rather than descriptions of the current installation. Product and design documents retain their normative brand guidance; no new visual review is implied.

## Validation

- Local Markdown file-target check covers **82 final Markdown files**, including records and archives, with zero missing local targets. File paths are verified; external destinations and heading-fragment accuracy are not claimed by that check.
- `git diff --check` passes. New guide, handoff and audit links resolve locally.
- Source checks covered actual schema fields, projections, service renderers/page links, app/channel configuration, root contact API and PageBuilder imports. The cross-site audit rechecked 131 live document revisions; the production snapshots are timestamped in that audit.
- No app build was necessary for documentation-only edits. Prior builds were not rerun or represented as fresh verification.
- A focused TypeScript check verified the corrected registry-exhaustiveness example and exposed the old example's incomplete-registry acceptance.

Evidence: [MSM service audit](../msm/msm-service-content-audit-2026-09-21.md), [cross-site service audit](service-content-ownership-audit-2026-09-21.md), and [documentation index](../../README.md). The handoff is the only current consolidation queue; the audit recommendations remain dated context.
