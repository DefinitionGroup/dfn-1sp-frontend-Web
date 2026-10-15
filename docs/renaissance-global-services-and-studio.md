# Renaissance services and Globals editing

Maintained guide, verified against source and production on 21 September 2026. For cross-site ownership and field semantics, use [Service content](SERVICE_CONTENT.md). The original migration, backups and test evidence are preserved in the [19 September implementation record](records/renaissance/renaissance-global-services-implementation-2026-09-19.md).

## Where to edit

Open **Globals → Services**, select Renaissance and English, then the service. Assigned-service shortcuts open the same documents.

| Service | Authoritative copy location |
| --- | --- |
| Go-to-market Communication Planning | Renaissance website edition of Go-to-Market & Sell-Through Support |
| Earned PR Campaign Planning | Renaissance website edition of Video Games PR & Communications |
| Paid & Organic Influencer Planning | Renaissance website edition of Influencer & Creator Partnerships & Talent Management |
| Event Management & Production | Renaissance website edition of Experiential & Live Event Marketing |
| Product Management & Support | Base fields on its Renaissance-only global service |
| Paid Media Planning & Buying | Base fields on its Renaissance-only global service |

Unset edition fields inherit base content. Custom media replaces the shared selection; an empty custom selection deliberately shows no media. Publishing a service publishes its entire draft, including every website edition.

The six Home service cards resolve name, short introduction and media from these services. The six Services-page sections resolve the full description. Those 12 placements store references, not duplicate descriptions. Page-owned anchors, spacing and the headings “Events” and “Also available through our partner network” remain intentional presentation choices.

A configured reference that cannot resolve for the selected channel/language is omitted rather than silently replaced with stale inline text. The code-owned homepage fallback is separate resilience behavior, not an alternative CMS authoring location.

## Studio navigation

The shared Globals browser filters Cases, People, Clients and Services by channel/language, with search and pagination. **Unassigned** means no channel assignment, not safe to delete. A draft removing an assignment can change the current Studio view even while published content remains assigned. See the [Studio customization tutorial](<studiocustomize -tut.md>) for implementation details.

Keep Renaissance descriptions in this reference-driven model. The MSM cleanup proposals do not justify removing the global description field or converting Renaissance services into standalone pages.
