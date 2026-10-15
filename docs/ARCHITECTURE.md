# Architecture and content ownership

Repository reference, checked against source on 2026-09-21. This describes the checked-out code, not the state of a hosted deployment.

## Applications and shared contracts

| Website | App root | Channel | Configured languages |
| --- | --- | --- | --- |
| 1SP + embedded Studio | repository root | `1spWeb` | EN |
| FLZR | `apps/flzr-web` | `flizrWeb` | EN, DE, PL |
| MSM | `apps/msm-web` | `msmWeb` | EN, DE |
| Renaissance | `apps/renaissance-web` | `renaissanceWeb` | EN |
| Studio CO2 | channel configuration only; no independent app in this checkout | `studioco2Web` | EN, DE |

[Site configuration](../packages/site-config/src/index.ts) owns channel names, supported locales, domain configuration and brand defaults. A configured domain does not prove that this code is deployed there.

Shared packages own schema, query contracts, types, PageBuilder plumbing and utilities. Apps own routing, shell, theme and rendering. Some compatibility imports still reach into the root app; do not assume complete code isolation. See [PageBuilder plumbing](../packages/pagebuilder-core/README.md).

## Content boundaries

- Pages, menus, navigation and settings are website-specific and scoped by channel and language.
- **Globals** holds reusable cases, services, people, clients and global units. Assignment controls availability; it is not ownership duplication.
- Website editions in `siteContent[]` support intentional differences without replacing the shared identity. Respect explicit inherit/custom choices, including empty custom content or media.
- MSM Units are a distinct organizational model. They own references to shared cases and people; see the [MSM context](../apps/msm-web/CONTEXT.md) and [relationship decision](../apps/msm-web/docs/adr/0001-unit-owned-shared-content-attribution.md).
- Renaissance also has site-owned client collections and shared portrait/award compositions; see [its component contract](../apps/renaissance-web/design-system/COMPONENTS.md) and [shared-content guide](../apps/renaissance-web/docs/shared-content.md).
- Translations use separate language documents linked by translation metadata.

Service descriptions have different current consumers across the apps. Use [Service content](SERVICE_CONTENT.md) for the maintained editing contract and [the handoff](SERVICE_CONTENT_HANDOFF.md) for proposed consolidation. A service reference does not automatically replace inline page copy. Renaissance already renders referenced descriptions; FLZR and MSM also have independent page narratives.

## Storage and rendering

Pages use unified `content[]`; the old per-channel page arrays are historical. Cases currently retain root and edition `casesPageBuilder[]`. Moving the root case field to `content[]` is **deferred**, as described in the [data structure recipe](SANITY_DATA_STRUCTURE_RECIPE.md).

Schema definitions live in [packages/sanity-schema/src](../packages/sanity-schema/src). Shared projections live in [groq.ts](../packages/sanity-queries/src/groq.ts), with case-edition resolution in [case-presentation.ts](../packages/sanity-queries/src/case-presentation.ts). App-specific builders select their own renderers; sharing storage does not require sharing the visual design.

Cloudinary objects currently remain embedded. The [storage policy](../packages/utils/src/cloudinary-storage.ts) and [Studio input](../sanity/components/CloudinaryStorageInput.tsx) prevent known redundant provider fields from returning. Media references are a proposed later stage, not the current model.

## Environments and publishing

Studio source, stored schema, hosted Studio bundle, frontend code and dataset content are separate states. Check each relevant state before diagnosing a mismatch or releasing work.

The September MSM/Renaissance records document authorized changes to `wu6i3y0h/production`. Older July records describe `dev-dataset` and earlier deployment branches. Neither establishes the environment of a running process today. Follow [local diagnostics](local-sanity-debugging.md) and [deployment verification](DEPLOYMENT.md).
