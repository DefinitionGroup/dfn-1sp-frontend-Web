# MSM Contact refinement — 4 October 2026

Contact now opens with the existing MSM hero, replaces its form with the company facts from Disclaimer, and shows all MSM people for the active language. This is an ordinary extension of the established MSM surface: Aspekta, square geometry, sparse mosaic accents, real media, and the existing selection-frame and corner motion remain the visual authority.

## Implementation and content authority

- The Contact route reuses `MsmPageBuilder` and its existing hero renderer. An authored Contact hero takes precedence; otherwise the hero uses Contact's CMS headline/subheadline, homepage hero media, and the first source company email as its CTA. The former `contactForm` fields remain editorial copy inputs, while the form is removed from this route only.
- `MsmContactDetailsBlock` renders all nine company groups extracted from the published Disclaimer: addresses, telephone/fax/email, directors, registry, VAT, and privacy contacts wherever present. The extractor supports both legacy paragraphs and compact newline groups, preserves Portable Text links, and excludes the separate copyright/legal prose. Existing social and messenger destinations from Contact remain available.
- `MsmContactPeopleBlock` shows the full pool of 12 MSM people per language, with source names, roles, email and profile links where supplied. Its query filters `person` by `msmWeb` and language; channel portrait and slug overrides take precedence over global fallbacks. Imported `%20` and leading email whitespace are normalized for usable links without changing CMS documents.
- Metadata, hero poster preload, conditional supplemental PageBuilder content, and structured data remain supported. The people JSON-LD includes the current contact pool. No CMS schema or block type was added; the new blocks are reusable React components rendered by Contact.

Source files: `apps/msm-web/app/(site)/[locale]/contact/page.tsx`, `apps/msm-web/components/contact/{ContactBlocks.module.css,MsmContactDetailsBlock.tsx,MsmContactPeopleBlock.tsx}`, `apps/msm-web/lib/{contact-content.ts,contact-data.ts}`, and `scripts/msm-contact-content.test.ts`.

The checked content scope was project `wu6i3y0h`, dataset `production` (the staging ground), channel `msmWeb`, English and German. These counts describe that source on the recorded date.

## Source versus incumbent system

| Aspect | Observed Contact implementation | Comparison |
| --- | --- | --- |
| Palette and ground | Existing Paper Black, Surface Black, Ink White and Signal Cyan tokens; fine rules and underlined links | Matches the established continuous dark field and sparse interaction signals |
| Typography | Aspekta inherited from MSM; section headings reuse `msm-title`; supporting links/details use the existing 1rem scale | Matches the current runtime; no font or weight override added |
| Layout and shape | Shared badge/content column structure, square portraits and existing `SelectionFrame`; company grid changes to two columns at 768px; people use one/two/three columns at 640px/1280px | Existing angular language adapted to company facts and people |
| Hero and imagery | Existing hero composition and renderer, CMS media, source portraits | Preserves MSM's real-media plane and signature hero behavior |
| Motion and access | Existing hero/frame/corner effects and `EditorialReveal`; fine-pointer portrait hover scales to 1.035 over 480ms; reduced motion removes the added transform/transitions; inherited cyan focus | Reuses the existing motion grammar and keyboard treatment |

Checked system sources were `apps/msm-web/PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `app/globals.css`, `SelectionCards.module.css`, `SelectionFrame.tsx`, and `pg-Header.tsx`. This task preserves those incumbent system files. Contact-specific grid and portrait values are recorded here rather than promoted to system tokens.

Pre-existing drift remains: DESIGN.md and its sidecar describe Medium (500) throughout, while current global CSS uses body weight 300 and heading weight 400 following earlier user changes. Their Contact-form guidance describes a reusable component that is no longer used on this route. Neither the typography drift nor the form documentation was rewritten or canonized as part of this extension.

## Verification and disposition

The implementation pass reported the following checks; this documentation pass inspected the changed source and incumbent system rather than rerunning them:

- `doctor:sanity` passed for `msmWeb` / English. Source comparison preserved nine company groups and returned 12 people in each locale.
- The four focused helper tests and targeted ESLint passed. The final `pnpm --filter @1sp/msm-web build` passed with 165 routes, including English and German Contact. An initial `.next/server/app/de` `ENOTEMPTY` rebuild failed; its retry passed.
- The built local preview on port 3000 was checked at 1440 × 1000, 831 × 1084, 390 × 844 and 320 × 844 in English, plus 390 × 844 in German. Checks found zero forms, nine companies, 12 people, no horizontal overflow, loaded first-row portraits, visible cyan keyboard focus, usable `mailto:`/`tel:` destinations, and an empty current browser error log.
- Three initial typography advisories were resolved by reusing `msm-title` and the existing supporting type scale. The final independent finish review returned **ship** for Contact: all five review sections were present, all 11 captures were valid, and no material Contact defects or further fixes remained. Type, material, ground, hero, content truth and behavior matched the approved extension; responsive company and people adaptations were accepted.

The 11 reviewed captures are retained in `.impeccable/review/`: `msm-contact-{hero-desktop,details-desktop,people-desktop,hero-mobile,details-mobile,people-mobile,hero-320,people-320,user-831,hero-de-mobile,details-de-mobile}.jpg`.

This record establishes local implementation and its checked Contact scope. No CMS write, production deployment, commit or push was performed for this task.
