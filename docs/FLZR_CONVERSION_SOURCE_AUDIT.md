# FLZR conversion: source audit

Status: read-only findings and proposed work, 2026-09-20. No application, CMS or tracking changes. This source audit supports the broader live-content and browser audit. Published-path observations below were cross-checked with the main audit; optional component risks are explicitly distinguished.

The two conversion goals are qualified client enquiries and recruitment applications. Measure and design them as separate journeys. Preserve FLZR's established visual language, the approved migrated English copy, global entities and channel editions. The earlier homepage rewrite was deliberately rolled back; a new composition or copy revision needs explicit scope.

## Confirmed source findings

### Navigation prioritizes an external destination

- Desktop CMS menu entries share the same styling; the separate button leads to `https://1sp.agency`. Mobile repeats a prominent external group link below the menu. Sources: [FrontNavOverlay.tsx](../apps/flzr-web/components/menu/FrontNavOverlay.tsx#L500), [desktop group button](../apps/flzr-web/components/menu/FrontNavOverlay.tsx#L596), [mobile group link](../apps/flzr-web/components/menu/FrontNavOverlay.tsx#L725).
- This is a priority hypothesis, not measured lost conversions: give FLZR's client enquiry action the persistent primary slot; retain a distinct Careers entry and make group membership a secondary trust signal.
- Footer already has a direct, localized “Start a project” action. Keep it. [FlzrSiteWrapper.tsx](../apps/flzr-web/components/FlzrSiteWrapper.tsx#L259).

### Contact lacks enquiry context and a verified operational handoff

- The form is rendered after the entire CMS block list. The browser audit confirmed the form starts approximately 4,725 CSS pixels down at a 390 × 844 viewport; see the [conversion plan](FLZR_CONVERSION_PLAN.md). [contact/page.tsx](<../apps/flzr-web/app/(site)/[locale]/contact/page.tsx#L189>).
- Required fields are name, email and message; company is optional. This is already a short form, so adding mandatory qualification fields is not the first recommendation. [ContactForm.tsx](../apps/flzr-web/components/ui/ContactForm.tsx#L134).
- The submitted payload contains form fields, language and channel; no service, case, originating page or campaign attribution. [ContactForm.tsx](../apps/flzr-web/components/ui/ContactForm.tsx#L56).
- The API creates a `contactSubmission` and returns success. No notification or CRM dispatch exists in this route. External Sanity webhooks/automation may exist and were not inspected; do not claim that enquiries currently go unread. Verify the operational owner, notification and qualified-lead status loop before optimizing traffic. [contact/route.ts](../apps/flzr-web/app/api/contact/route.ts#L123).
- Success/error messages, field labels and several status strings are partly hardcoded English. Errors are displayed as ordinary text and success replaces the form without an explicit live status region/focus handoff. Validate keyboard/screen-reader behavior and localization before other locales are promoted. [ContactForm.tsx](../apps/flzr-web/components/ui/ContactForm.tsx#L116), [error state](../apps/flzr-web/components/ui/ContactForm.tsx#L186).
- Proposed: contextual CTA into the same contact route with optional service/case context; short project brief prompt; an honest response expectation agreed with the receiving team; a visible alternative contact method; accessible submission feedback. Avoid inventing a response SLA.

### Service-to-enquiry paths are inconsistent

- Seven approved English service document IDs resolve to dedicated pages; other IDs/locales retain a modal. This is intentional migration scope, not evidence of a broken link. [service-pages.ts](../apps/flzr-web/lib/service-pages.ts#L1), [card destination](../apps/flzr-web/components/data/data-ServiceGallery.tsx#L135).
- The service modal ends with deliverables and service group text, with no contact action in the modal. [data-ServiceGallery.tsx](../apps/flzr-web/components/data/data-ServiceGallery.tsx#L705).
- Proposed: reuse the approved service names, explain buyer outcomes in approved copy, show relevant case proof and add one contextual enquiry action in each full-page/modal journey. Do not create a new service taxonomy or extra mandatory form fields without evidence.

### Case browsing mixes direct links and preview behavior

- `CaseGalleryCard` contains a valid semantic link on its title, nested inside a clickable `motion.div` that opens the preview. The image/body rely on that non-focusable outer click target. The title click can bubble to the preview handler. Do not describe the entire card as lacking a semantic link. [outer handler](../apps/flzr-web/components/data/CaseGalleryCard.tsx#L59), [title link](../apps/flzr-web/components/data/CaseGalleryCard.tsx#L111).
- The main browser audit confirmed `/en/cases` has sector/service filters and pagination. Activating SONY Europe's case opens the overlay; its “View Case Study” subsequently navigates successfully to `/en/cases/sonys-retail-sales-force`. This is an additional step, not a broken case link.
- The overlay button renders `href="#"` because `Button2` receives no href; its click bubbles to a wrapper that closes the preview and calls `router.push` after 50ms. This delegated behavior works in the verified flow, although an explicit link would make its purpose and keyboard/browser behavior clearer. [overlay action](../apps/flzr-web/components/data/data-CaseGallery.tsx#L198), [navigation handler](../apps/flzr-web/components/data/data-CaseGallery.tsx#L92), [button fallback](../apps/flzr-web/components/ui/Button2.tsx#L587).
- Proposed: preserve the existing useful filters, make the primary case action a direct semantic link, optionally retain preview as an explicitly separate action, and use concise client/service/outcome captions supported by evidence. Test meaningful case-to-enquiry transitions, not merely clicks.
- Case detail always mounts the `CasePoweredByContact` component, but it returns nothing when there is no assigned person or unit logo. With a person, it offers email/LinkedIn only when those fields exist. There is no component-level general enquiry fallback. The site footer still provides a general CTA, so this is not a total dead end. [case client](<../apps/flzr-web/app/(site)/[locale]/cases/[slug]/CaseStudyPageClient.tsx#L149>), [conditional closure](../apps/flzr-web/components/pagebuilder/cases/pg-CasePoweredByContact.tsx#L70), [contact actions](../apps/flzr-web/components/pagebuilder/cases/pg-CasePoweredByContact.tsx#L159).
- Proposed: reliable “Discuss a similar project” action carrying the case context, with the named specialist as useful supporting information. Do not force a person assignment solely to obtain a CTA.

### Recruitment needs clearer provider routing; optional feed concerns are future prerequisites

- The main audit confirmed the published Careers route uses a hero CTA to the group Personio site and a separate myFLZR link, **not** the optional embedded jobs block. Personio displayed FLZR roles alongside other companies; myFLZR provides jobs, login and registration. Role types overlap: do not infer “Personio = office” and “myFLZR = field” without recruiting-team confirmation.
- Proposed current-path improvement: give each destination a concise, accurate explanation of who it serves and what happens next, with a deliberately FLZR-scoped destination where supported. Keep applicants out of the client enquiry form. Make open-role discovery prominent, maintain the distinction between applying and signing into an existing account, and verify attribution across both provider handoffs.
- The app also supports a Personio block. Its following limitations are **prerequisites if we later choose to reuse it**, not defects in the currently published Careers page. [FlzrPageBuilder.tsx](../apps/flzr-web/components/FlzrPageBuilder.tsx#L677), [historical outbound migration](../scripts/flzr-home-careers-two-thirds.mjs#L172).
- The optional block requests language/maxItems/publication state, with no FLZR channel or explicit business-unit scope, and initially selects “all” units. Unit matching is inferred from names/department/location/title. [jobs fetch](../apps/flzr-web/components/pagebuilder/pg-PageBuilderPersonioJobs.tsx#L263), [matching](../apps/flzr-web/components/pagebuilder/pg-PageBuilderPersonioJobs.tsx#L385).
- Its API slices published jobs to `maxItems` (default 20, maximum 100) before client-side unit/contract/time filtering. Relevant jobs outside that slice could be omitted. [API slicing](../apps/flzr-web/app/api/personio/jobs/route.ts#L802), [client filters](../apps/flzr-web/components/pagebuilder/pg-PageBuilderPersonioJobs.tsx#L478).
- Its error and empty states display text without a provider/recruiter fallback. Job actions pass the provider URL directly and open externally through `Button2`; there is no application-completion callback. [job states](../apps/flzr-web/components/pagebuilder/pg-PageBuilderPersonioJobs.tsx#L537), [apply link](../apps/flzr-web/components/pagebuilder/pg-PageBuilderPersonioJobs.tsx#L683), [external button behavior](../apps/flzr-web/components/ui/Button2.tsx#L587).
- An embedded listing is an option, not a necessary first-stage redesign. If selected, establish reliable FLZR scope and complete result retrieval before display, make filters useful to applicants, and preserve provider fallback links if the feed fails.

### Measurement cannot yet distinguish the two funnels in source

- FLZR loads Vercel Analytics and Speed Insights. Google Analytics initialization is gated by production tracking and its configured measurement ID, and consent is handled in the shared component. [layout.tsx](../apps/flzr-web/app/layout.tsx#L74), [GoogleAnalyticsConsent.tsx](../components/GoogleAnalyticsConsent.tsx#L26).
- Source search found no explicit business funnel events in FLZR's contact, service, case or jobs components. Provider dashboards and GA configuration were not inspected; automatic analytics may capture some interactions but are not proof of qualified leads or completed applications.
- Client funnel: service/case engagement → enquiry CTA → form start → validated submission → qualified enquiry. A successful client fetch or mailto click alone is not a qualified enquiry.
- Recruitment funnel: Careers/role discovery → role detail/provider handoff → submitted application → qualified application. An outbound job click is a handoff, not an application. Completion requires provider reporting/integration or an agreed reconciliation method.
- Capture route, language, audience, CTA placement and relevant content ID; keep names, email addresses and free-text messages out of analytics. Use consent-aware tracking and deduplication. Tie quality statuses to the appropriate sales/recruiting workflow.

## Recommended sequencing

1. Verify live destinations, mobile/keyboard journeys, enquiry delivery ownership and recruitment provider attribution. Establish separate baseline funnels.
2. Reprioritize navigation for FLZR enquiries and Careers; standardize contextual CTA behavior and robust form/job failure paths.
3. Reorder existing approved content around visitor questions: offering → relevant proof → delivery confidence → enquiry for clients; role discovery → employment fit → process → application for candidates.
4. Pilot one service page, one case and Careers with existing blocks before extending. Only add schema fields where the required meaning cannot be represented cleanly already.
5. Evaluate qualified outcomes and lead/application quality by source and device. No numerical uplift can be claimed without traffic volume, baseline and outcome data.

No form or application submissions were sent. No production configuration, CMS content, application code or analytics configuration was changed.
