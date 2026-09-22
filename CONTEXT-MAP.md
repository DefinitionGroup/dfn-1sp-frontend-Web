# Context map

Use [Architecture](docs/ARCHITECTURE.md) for implemented app boundaries and [Service content](docs/SERVICE_CONTENT.md) for shared service ownership. This map identifies domain relationships, not deployment status.

## Website contexts

- [MSM](apps/msm-web/CONTEXT.md): specialist Units, shared cases/people and website-owned pages.
- [FLZR](apps/flzr-web/README.md): retail-marketing pages and its own service page/modal presentation.
- [Renaissance](apps/renaissance-web/README.md): games communications, reference-driven service sections and site-owned shared compositions.
- Root 1SP: existing frontend and embedded Studio; preserve its runtime contract when evolving the other sites.

## Shared relationships

- Globals makes cases, services, people, clients and global units available by channel and language. Website editions supply deliberate presentation differences.
- MSM Units own their case and leadership attribution; [the Unit decision](apps/msm-web/docs/adr/0001-unit-owned-shared-content-attribution.md) keeps it separate from the global Unit model.
- Service identity and service landing-page composition are distinct. Their current site-specific relationships and proposed consolidation are documented in [the handoff](docs/SERVICE_CONTENT_HANDOFF.md).

## Whole-project handoff

Start with [the project handoff](docs/HANDOFF.md), [feature map](docs/PROJECT_FEATURES.md) and [operations guide](docs/PROJECT_OPERATIONS.md). The [documentation index](docs/README.md) distinguishes current guides, proposed work, dated evidence and archived procedures.
