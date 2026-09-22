# Documentation

Start with the [whole-project handoff](HANDOFF.md). It covers all four webapps, shared CMS contracts, Studio, previews, integrations, current work and operational quirks. Reviewed 21 September 2026; [scope and findings](records/project/project-handoff-review-2026-09-21.md).

## Orientation

| Need | Read |
| --- | --- |
| Understand or resume the entire project | [Project handoff](HANDOFF.md) |
| Find a feature's schema, query and renderer | [Feature map](PROJECT_FEATURES.md) |
| Preview, publish, back up, debug freshness or verify integrations | [Operations](PROJECT_OPERATIONS.md) |
| Start and build the apps | [Repository README](../README.md) |
| Understand content/app ownership | [Architecture](ARCHITECTURE.md) |
| Find source directories | [Context map](../CONTEXT-MAP.md) |

## Maintained task guides

| Task | Guide |
| --- | --- |
| Edit services across websites | [Service content](SERVICE_CONTENT.md) |
| Diagnose missing or mismatched content | [Local Sanity debugging](local-sanity-debugging.md) |
| Understand Globals channel/language filters | [Studio customization tutorial](<studiocustomize -tut.md>) |
| Edit Renaissance services and inheritance | [Services and Globals browser](renaissance-global-services-and-studio.md) |
| Add a page-builder block | [PageBuilder guide](PAGEBUILDER_COMPONENT_GUIDE.md); [shared helper package](../packages/pagebuilder-core/README.md) |
| Handle nullable CMS data | [Null handling](SANITY_NULL_HANDLING.md) |
| Configure the contact form | [Contact form](CONTACT_FORM.md) |
| Add the shared footer banner | [Footer external banner](footer-external-banner.md) |
| Use the Renaissance case carousel | [Case carousel](renaissance-case-carousel.md) |
| Verify a release | [Deployment verification](DEPLOYMENT.md) |
| Work in the correct checkout | [Worktree guide](WORKTREE_GUIDE.md) |

## Website design and domain references

- **FLZR:** [app README](../apps/flzr-web/README.md); [migration evidence](records/README.md#flzr).
- **MSM:** [app README](../apps/msm-web/README.md), [product](../apps/msm-web/PRODUCT.md), [design](../apps/msm-web/DESIGN.md), [domain context](../apps/msm-web/CONTEXT.md), [Unit relationship decision](../apps/msm-web/docs/adr/0001-unit-owned-shared-content-attribution.md).
- **Renaissance:** [app README](../apps/renaissance-web/README.md), [product](../apps/renaissance-web/PRODUCT.md), [design](../apps/renaissance-web/DESIGN.md), [design-system guide](../apps/renaissance-web/design-system/README.md), [component contract](../apps/renaissance-web/design-system/COMPONENTS.md), [release checklist](../apps/renaissance-web/design-system/RELEASE-CHECKLIST.md), [shared-content guide](../apps/renaissance-web/docs/shared-content.md).

## Proposed and deferred work

- [Service consolidation handoff](SERVICE_CONTENT_HANDOFF.md): audited proposal, not implemented. Preserve Renaissance references and clarify MSM/FLZR ownership.
- [FLZR conversion plan](FLZR_CONVERSION_PLAN.md) and [source audit](FLZR_CONVERSION_SOURCE_AUDIT.md): separate client-enquiry and recruitment journeys; proposed.
- [Data structure recipe](SANITY_DATA_STRUCTURE_RECIPE.md): Stage 3+ deferred by the user until more content work is complete; refresh quota measurements first.
- [Translation strategy](SANITY_AGENTIC_TRANSLATION_STRATEGY.md): implemented foundations plus proposed pilots; refresh provider/schema state before rollout.

## Evidence, archive and templates

- [Dated records](records/README.md): migration mappings, publication evidence, source reconciliation, backups and audits still needed for traceability. Counts and verification claims apply to the recorded date.
- [Archive](archived/README.md): superseded handoffs, old plans, obsolete guide versions and the completed page-content migration procedure. These are history, not the active queue.
- [Templates](templates/README.md): blueprints for other projects, not setup instructions for this repository.
- [Consolidation report](records/project/project-handoff-review-2026-09-21.md), [document inventory](records/project/documentation-inventory-2026-09-21.csv) and [move manifest](records/project/documentation-moves-2026-09-21.csv).

## Maintenance rule

Each subject has one owning guide. Keep app design documents beside the app. Record completed verification under `records/<topic>/`; move superseded documents to `archived/` and update inbound links. A completed migration record can remain in `records/` when its source mapping or recovery evidence is still useful. Do not delete it just because it is dated.

Source code establishes repository behavior. Dated records establish what was checked then. Current environment/provider checks establish operational state. Generated exports, private backups, vendor files and hidden tool review artifacts are outside this maintained documentation catalog.
