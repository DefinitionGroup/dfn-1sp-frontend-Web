# Service content: current ownership and editing

Maintained reference, checked on 21 September 2026 against local source and the scoped production audits. This describes current behavior; [the handoff](SERVICE_CONTENT_HANDOFF.md) owns proposed work. Audit measurements and document inventories live in [the cross-site record](records/sanity/service-content-ownership-audit-2026-09-21.md) and [MSM inventory](records/msm/msm-service-content-audit-2026-09-21.csv).

## Shared rules

**Globals remains the identity source.** A service has channel assignments and a language. Queries resolve an optional matching `siteContent[]` edition before base fields. Single-channel services may use base fields; identical edition copies are unnecessary. Publishing a global document includes its entire draft and all editions.

Pages have independent channel/language scope and use `content[]`. That shared field name does not merge page content or force the apps to share layouts. A service reference on a page does not automatically make its inline blocks inherit service copy.

| Field / content | Existing role |
| --- | --- |
| `name` | Reusable display name, with optional website override |
| `taglabel` | Short label; FLZR cards show it, otherwise service groups |
| `introText` | Short introduction; Renaissance/MSM cards and FLZR modal use it |
| `serviceDescription` | Full service description; Renaissance reference sections, FLZR modal and catalog SEO use it. MSM also stores duplicate page prose separately. |
| `deliverables` | Structured capabilities/outcomes; FLZR modal reads them |
| Service media | Card/gallery media, with explicit inherit/custom behavior for editions |
| Page blocks | Ordered hero, narrative, proof, metrics, cases and CTAs |
| Page metadata / slug | Page SEO and routing |

Unset edition fields inherit base values. Empty strings/arrays are not the same as missing values in the projection; some renderers additionally use truthiness fallbacks. Media explicitly uses `mediaMode`: custom plus no media is intentional. Check the [resolver](../packages/sanity-queries/src/service-presentation.ts) and consuming component before defining new behavior.

## Where editors work today

| Site | Reusable service content | Detailed presentation | Known limitation |
| --- | --- | --- | --- |
| Renaissance | Four website editions; two Renaissance-only base records | Services sections reference global descriptions | Already avoids duplicate local description storage |
| FLZR | Eight FLZR-only base records | Seven separate page narratives; AI Solutions modal reads Globals | Page links are hardcoded; seven page journeys bypass stored descriptions/deliverables, while catalog SEO still reads descriptions |
| MSM | Thirty-three MSM editions | Linked pages hold their own blocks | Duplicate descriptions/media and divergent carousel/directory teaser sources |

These are September 21 inventory counts, not validation constants. Renaissance has English services; FLZR's assigned services are English only despite configured DE/PL locales; MSM has EN and DE. Queries apply channel **and** language restrictions.

Renaissance editing detail: [Services and Globals](renaissance-global-services-and-studio.md). FLZR destinations: [current mapping](../apps/flzr-web/lib/service-pages.ts). MSM relationships: [page schema](../packages/sanity-schema/src/page.ts), where `msmPageKind` and `services[]` currently apply to MSM.

## Consistency to preserve

The intended ownership principle is one editable source for each reusable piece, with page-owned storytelling and presentation. This is **not yet enforced consistently** across all sites.

- Reference reusable overview/deliverables instead of storing a second inline copy.
- Let site pages own bespoke headlines, narrative, evidence and CTA placement.
- Keep service card media and page hero media separate where art direction differs; all seven FLZR service heroes intentionally differ from their card media selections.
- Retain `serviceDescription` as a shared contract. An MSM-only redundant-copy cleanup is different from deleting a field used by Renaissance, FLZR and SEO.
- Coordinate service summaries and catalog SEO when changing the description source.

CMS-owned primary landing-page relationships, clearer field labels and a consistent overview/deliverables reference block are proposed work. They are not existing platform features. The [handoff](SERVICE_CONTENT_HANDOFF.md) defines decisions and acceptance checks before implementation.

## Evidence hierarchy

Source code establishes readers/writers. A direct dataset audit establishes stored content at a timestamp. A successful build establishes compilation, not deployed state. Published CMS content and deployed frontend/schema are separate states. Follow [local diagnostics](local-sanity-debugging.md) before an audit and [deployment verification](DEPLOYMENT.md) for a release.
