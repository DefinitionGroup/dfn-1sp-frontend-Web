# PageBuilder Components Overview

This document explains how PageBuilder components are integrated and which blocks are available in the 1SP channel.

## How the PageBuilder pipeline works
- Sanity document: `page` has an array field `content1sp` that stores ordered blocks (`sanity/schemaTypes/page.ts`).
- The frontend pulls a page via `PAGE_QUERY`/`HOME_PAGE_QUERY` (`sanity/lib/queries.ts`).
- The PageBuilder component (`components/PageBuilder.tsx`) loops over `content1sp` and renders a React component per `_type` via a switch.

## Adding a new PageBuilder component (1SP channel)
1) **Create/extend the Sanity schema**  
   - Add a component schema under `sanity/schemaTypes/1SP/Components/` (or object/item as needed).  
   - Export it through `sanity/schemaTypes/1spContent.ts` so it is registered.
2) **Allow the block in `content1sp`**  
   - Add the new schema type to the `of` array for `content1sp` in `sanity/schemaTypes/page.ts` (inside the 1spWeb channel section).
3) **Expose data in queries**  
   - Update `PAGE_QUERY` and `HOME_PAGE_QUERY` in `sanity/lib/queries.ts` to project the fields your component needs (and any nested references).
4) **Render it in the frontend**  
   - Dynamically import the React component in `components/PageBuilder.tsx` and add a `case` for the `_type` that returns your component.  
   - Place the React component under `components/pagebuilder/` (or `components/data/` if it is a data-driven widget).
5) **Test**  
   - Create a page in Sanity, add the new block to `content1sp`, publish, and load the page in the app to verify data flows and rendering.

## Available PageBuilder components (1SP)
Location of renderer: `components/PageBuilder.tsx`. Location of schemas: `sanity/schemaTypes/1SP/Components/*` and `sanity/schemaTypes/1SP/Objects/*`.

- `showtimeGallery` → `components/pagebuilder/pg-ShowtimeGallery`
- `heroShowTime` → `components/pagebuilder/pg-HeroShowtime`
- `sublineComponent` → `components/pagebuilder/pg-SublineComponent`
- `oneSPHeader` → `components/pagebuilder/pg-Header`
- `contentSection` → `components/pagebuilder/pg-ContentSection`
- `casesIntro` → `components/pagebuilder/pg-CasesIntro`
- `casesGalleryFiltered` → `components/pagebuilder/pg-CasesGalleryFiltered`
- `casesGalleryFilteredWithPagination` → `components/pagebuilder/pg-CasesGalleryFilteredWithPagination`
- `servicesGalleryFiltered` → `components/pagebuilder/pg-ServicesGalleryFiltered`
- `servicesHeroWithBadge` → `components/pagebuilder/pg-ServicesHeroWithBadge`
- `intertitleCTA` → `components/pagebuilder/pg-IntertitleCTA`
- `galleryHeroStep` → `components/pagebuilder/pg-GalleryHeroStep`
- `galleryCardsStep` → `components/pagebuilder/pg-GalleryCardsStep`
- `galleryListStep` → `components/pagebuilder/pg-GalleryListStep`
- `galleryPeopleStep` → `components/pagebuilder/pg-GalleryPeopleStep`
- `galleryScrollHighlightStep` → `components/pagebuilder/pg-GalleryHighlightStep`
- `galleryRevealStep` → `components/pagebuilder/pg-GalleryRevealStep`
- `galleryOverview` → `components/pagebuilder/pg-GalleryOverviewStep`
- `carousel` → `components/pagebuilder/pg-InteractiveCarousel`
- `smartCarousel` → `components/pagebuilder/pg-SmartCarousel`
- `smartPeople` → `components/data/data-SmartPeople`
- `smartUnitsGallery` → `components/data/data-UnitsExpandableCards`
- `smartUnitsGlobe` → `components/data/data-SmartUnitsGlobe`
- `headlineChallenge` → `components/pagebuilder/cases/pg-HeadlineChallenge`

Notes:
- Some components (e.g., gallery steps) exist both as part of `showtimeGallery` and as standalone entries in `content1sp`.
- Data-heavy components (smart* blocks) fetch their own data via Sanity queries encapsulated in their component modules.
- For other channels (MSM, Studio CO2, Flizr), `contentMSM`, `contentStudioCO2`, and `contentStudioFlizr` are present but currently use basic block arrays; extend similarly if needed.
