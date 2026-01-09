# Component Cleanup Documentation

> Generated: January 9, 2026

This document provides a comprehensive overview of all components in the project, their usage patterns, and which components are exposed to the PageBuilder system.

---

## Table of Contents

1. [Component Architecture Overview](#component-architecture-overview)
2. [PageBuilder Components](#pagebuilder-components)
3. [CasePageBuilder Components](#casepagebuilder-components)
4. [UI Components](#ui-components)
5. [Data Components](#data-components)
6. [Menu Components](#menu-components)
7. [Utility/Dev Components](#utilitydev-components)
8. [Unused/Deprecated Components](#unuseddeprecated-components)
9. [Cleanup Recommendations](#cleanup-recommendations)

---

## Component Architecture Overview

The project uses a **PageBuilder pattern** where Sanity CMS content blocks are mapped to React components dynamically. The main entry points are:

| Builder | File | Purpose |
|---------|------|---------|
| `PageBuilder` | `components/PageBuilder.tsx` | Main site pages |
| `CasePageBuilder` | `components/CasePageBuilder.tsx` | Case study pages |

### Component Hierarchy

```
PageBuilder.tsx / CasePageBuilder.tsx
├── pagebuilder/pg-*.tsx (PageBuilder components)
│   ├── ShowtimeGallerySteps/pg-*.tsx (Gallery step components)
│   ├── Fragments/pg-*.tsx (Reusable fragments)
│   └── cases/pg-*.tsx (Case study components)
├── data/data-*.tsx (Data-fetching wrapper components)
│   └── Fragments/data-*.tsx (Data fragment components)
└── ui/*.tsx (Presentational UI components)
```

---

## PageBuilder Components

Components exposed to the **main PageBuilder** and mapped via Sanity schema `_type`:

| Sanity `_type` | Component File | Sanity Schema |
|----------------|----------------|---------------|
| `showtimeGallery` | `pg-ShowtimeGallery.tsx` | `1SP/Components/showtimeGallery` |
| `heroShowTime` | `pg-HeroShowtime.tsx` | `1SP/Components/heroShowtime` |
| `sublineComponent` | `pg-SublineComponent.tsx` | `1SP/Components/sublineComponent` |
| `oneSPHeader` | `pg-Header.tsx` | `1SP/Components/Header` |
| `contentSection` | `pg-ContentSection.tsx` | `1SP/Components/contentSection` |
| `twoColContentSection` | `pg-2ColContentSection.tsx` | `1SP/Components/twoColContentSection` |
| `casesIntro` | `pg-CasesIntro.tsx` | `1SP/Components/casesIntro` |
| `casesGalleryFiltered` | `pg-CasesGalleryFiltered.tsx` | `1SP/Components/casesGalleryFiltered` |
| `casesGalleryFilteredWithPagination` | `pg-CasesGalleryFilteredWithPagination.tsx` | `1SP/Components/casesGalleryFilteredWithPagination` |
| `servicesGalleryFiltered` | `pg-ServicesGalleryFiltered.tsx` | `1SP/Components/servicesGalleryFiltered` |
| `servicesHeroWithBadge` | `pg-ServicesHeroWithBadge.tsx` | `1SP/Components/servicesHeroWithBadge` |
| `intertitleCTA` | `pg-IntertitleCTA.tsx` | `1SP/Components/intertitleCTA` |
| `galleryHeroStep` | `pg-GalleryHeroStep.tsx` | `1SP/Components/galleryHeroStep` |
| `galleryCardsStep` | `pg-GalleryCardsStep.tsx` | `1SP/Components/galleryCardsStep` |
| `galleryListStep` | `pg-GalleryListStep.tsx` | `1SP/Components/galleryListStep` |
| `galleryPeopleStep` | `pg-GalleryPeopleStep.tsx` | `1SP/Components/galleryPeopleStep` |
| `galleryScrollHighlightStep` | `pg-GalleryHighlightStep.tsx` | `1SP/Components/galleryScrollHighlightStep` |
| `galleryRevealStep` | `pg-GalleryRevealStep.tsx` | `1SP/Components/GalleryRevealStep` |
| `galleryOverview` | `pg-GalleryOverviewStep.tsx` | `1SP/Components/GalleryOverviewStep` |
| `carousel` | `pg-InteractiveCarousel.tsx` | `1SP/Components/carousel` |
| `smartCarousel` | `pg-SmartCarousel.tsx` | `1SP/Components/smartCarousel` |
| `smartPeople` | `data/data-SmartPeople.tsx` | `1SP/Components/smartPeople` |
| `smartUnitsGallery` | `data/data-UnitsExpandableCards.tsx` | `1SP/Components/smartUnitsGallery` |
| `smartUnitsGlobe` | `data/data-SmartUnitsGlobe.tsx` | `1SP/Components/smartUnitsGlobe` |
| `globeComponent` | `pg-GlobeComponent.tsx` | `1SP/Components/globeComponent` |
| `headlineChallenge` | `cases/pg-HeadlineChallenge.tsx` | (also in CasePageBuilder) |

---

## CasePageBuilder Components

Components exposed to the **CasePageBuilder** for case study pages:

| Sanity `_type` | Component File | Sanity Schema |
|----------------|----------------|---------------|
| `headlineChallenge` | `cases/pg-HeadlineChallenge.tsx` | `CaseStudy/Components/headlineChallenge` |
| `challengeAndSolution` | `cases/pg-ChallengeAndSolution.tsx` | `CaseStudy/Components/challengeAndSolution` |
| `approachSection` | `cases/pg-ApproachSection.tsx` | `CaseStudy/Components/approachSection` |
| `resultsMetrics` | `cases/pg-ResultsMetrics.tsx` | `CaseStudy/Components/resultsMetrics` |

---

## UI Components

### Actively Used Components

| Component | File | Used By |
|-----------|------|---------|
| `AnimateNumberinView` | `ui/AnimateNumberinView.tsx` | `pg-ResultsMetrics.tsx` |
| `AuroraShaderBackground` | `ui/AuroraShaderBackground.tsx` | `HamburgerGradientMenu.tsx` |
| `Badgemodule` | `ui/Badgemodule.tsx` | Multiple ShowtimeGallerySteps, `pg-ServicesHeroWithBadge.tsx` |
| `Button` | `ui/Button.tsx` | `not-found.tsx` |
| `Button2` | `ui/Button2.tsx` | Multiple pagebuilder components, menu, data components |
| `ContactForm` | `ui/ContactForm.tsx` | Contact page API |
| `GridBackground` | `ui/GridBackground.tsx` | Multiple ShowtimeGallerySteps, case components, pagebuilder |
| `HamburgerGradientMenu` | `ui/HamburgerGradientMenu.tsx` | `CaseStudyPageClient.tsx`, `pg-CasesIntro.tsx` |
| `ListContainerComponent` | `ui/ListContainerComponent.tsx` | `pg-ListStep.tsx`, case components, `pg-ServicesHeroWithBadge.tsx` |
| `ListItemComponent` | `ui/ListItemComponent.tsx` | Same as ListContainerComponent |
| `MapVertical` | `ui/MapVertical.tsx` | `CaseStudyPageClient.tsx`, `PageWithMapVertical.tsx` |
| `not-found` | `ui/not-found.tsx` | Multiple page routes |
| `PageWithMapVertical` | `ui/PageWithMapVertical.tsx` | `SiteWrapper.tsx` |
| `percentageDiagramHorizontal` | `ui/percentageDiagramHorizontal.tsx` | `pg-ResultsMetrics.tsx` |
| `percentageDiagramVertical` | `ui/percentageDiagramVertical.tsx` | `pg-ResultsMetrics.tsx` |
| `percentagePosNegDiagram` | `ui/percentagePosNegDiagram.tsx` | `pg-ResultsMetrics.tsx` |
| `PersonCard` | `ui/PersonCard.tsx` | `data-SmartPeople.tsx` |
| `ScrollHighlight` | `ui/ScrollHighlight.tsx` | `pg-HighlightStep.tsx` |
| `StaggeredFadeIn` | `ui/StaggeredFadeIn.tsx` | `pg-PeopleShowcaseHero.tsx`, `pg-ContentSection.tsx`, `PersonCard.tsx` |
| `StaggeredSlideUp` | `ui/StaggeredSlideUp.tsx` | Many components (animations) |
| `TextHeadlineCombo` | `ui/TextHeadlineCombo.tsx` | `pg-OverviewStep.tsx` |
| `TextReveal` | `ui/TextReveal.tsx` | `pg-RevealStep.tsx` |
| `tracing-beam` | `ui/tracing-beam.tsx` | `pg-HighlightStep.tsx` |
| `TypewriterRotator` | `ui/TypewriterRotator.tsx` | `pg-Header.tsx` |
| `arrowBig` | `ui/arrowBig.tsx` | `pg-HighlightStep.tsx` |
| `globe` | `ui/globe.tsx` | `globalDataComponent.tsx` |

---

## Data Components

Data components fetch or transform data before rendering:

| Component | File | Used By |
|-----------|------|---------|
| `data-CaseGallery` | `data/data-CaseGallery.tsx` | `pg-CasesGalleryFiltered.tsx`, `pg-CasesGalleryFilteredWithPagination.tsx` |
| `data-CaseGalleryMenu` | `data/data-CaseGalleryMenu.tsx` | `FrontNavOverlay.tsx` |
| `data-InteractiveCarousel` | `data/data-InteractiveCarousel.tsx` | `pg-HeroStep.tsx`, `pg-SmartCarousel.tsx` |
| `data-ServiceGallery` | `data/data-ServiceGallery.tsx` | `pg-ServicesGalleryFiltered.tsx` |
| `data-SmartPeople` | `data/data-SmartPeople.tsx` | PageBuilder (`smartPeople`), `pg-HeroStep.tsx` |
| `data-SmartUnitsGlobe` | `data/data-SmartUnitsGlobe.tsx` | PageBuilder (`smartUnitsGlobe`) |
| `data-UnitsExpandableCards` | `data/data-UnitsExpandableCards.tsx` | PageBuilder (`smartUnitsGallery`) |

### Data Fragments

| Fragment | File | Used By |
|----------|------|---------|
| `data-CtaMiniComponent` | `data/Fragments/data-CtaMiniComponent.tsx` | `pg-ServicesHeroWithBadge.tsx` |
| `data-HeaderImageVideoComp` | `data/Fragments/data-HeaderImageVideoComp.tsx` | `CaseStudyPageClient.tsx` |
| `data-HeaderImageVideoComp2` | `data/Fragments/data-HeaderImageVideoComp2.tsx` | `pg-ServicesHeroWithBadge.tsx` |
| `data-IntertitleCTA` | `data/Fragments/data-IntertitleCTA.tsx` | `data-CaseGalleryMenu.tsx` |

---

## Menu Components

| Component | File | Used By |
|-----------|------|---------|
| `FooterNew` | `menu/FooterNew.tsx` | `SiteWrapper.tsx` |
| `FooterMenuContext` | `menu/FooterMenuContext.tsx` | Context provider |
| `FrontNavOverlay` | `menu/FrontNavOverlay.tsx` | `SiteWrapper.tsx`, `HamburgerGradientMenu.tsx` |

---

## Utility/Dev Components

| Component | File | Used By | Purpose |
|-----------|------|---------|---------|
| `ErrorBoundary` | `ErrorBoundary.tsx` | `PageBuilder.tsx`, `CasePageBuilder.tsx` | Error handling |
| `SiteWrapper` | `SiteWrapper.tsx` | Multiple page routes | Layout wrapper |
| `TransitionLoader` | `TransitionLoader.tsx` | `[locale]/layout.tsx` | Page transitions |
| `StegaErrorHandler` | `StegaErrorHandler.tsx` | `[locale]/layout.tsx` | Sanity preview |
| `DisableDraftMode` | `DisableDraftMode.tsx` | `[locale]/layout.tsx` | Draft mode toggle |
| `globalDataComponent` | `globalDataComponent.tsx` | `[locale]/page.tsx` | Globe with data |
| `DebugBadge` | `dev/DebugBadge.tsx` | `withDebugBadge.tsx` | Dev debugging |
| `withDebugBadge` | `dev/withDebugBadge.tsx` | Many pagebuilder components | HOC for debugging |

---

## PageBuilder Fragment Components

Internal fragments used within PageBuilder components (not directly exposed to Sanity):

| Fragment | File | Used By |
|----------|------|---------|
| `pg-CtaMiniComponent` | `Fragments/pg-CtaMiniComponent.tsx` | `pg-CtaSplitHeader.tsx`, ShowtimeGallerySteps, case components |
| `pg-CtaSplitHeader` | `Fragments/pg-CtaSplitHeader.tsx` | `pg-ListStep.tsx` |
| `pg-ExpandableCards` | `Fragments/pg-ExpandableCards.tsx` | `data-UnitsExpandableCards.tsx`, ShowtimeGallerySteps |
| `pg-HeaderImageVideoComp2` | `Fragments/pg-HeaderImageVideoComp2.tsx` | Multiple ShowtimeGallerySteps, case components, `pg-Header.tsx`, `pg-HeroShowtime.tsx` |
| `pg-InteractiveCarousel` | `Fragments/pg-InteractiveCarousel.tsx` | `pg-HeroStep.tsx`, `pg-InteractiveCarousel.tsx` |
| `pg-PeopleShowcaseHero` | `Fragments/pg-PeopleShowcaseHero.tsx` | `pg-PeopleStep.tsx` |

---

## ShowtimeGallery Step Components

These are internal steps used by `pg-ShowtimeGallery.tsx` and also exposed as standalone PageBuilder components:

| Step Component | File | Standalone Type |
|----------------|------|-----------------|
| `pg-HeroStep` | `ShowtimeGallerySteps/pg-HeroStep.tsx` | `galleryHeroStep` |
| `pg-CardsStep` | `ShowtimeGallerySteps/pg-CardsStep.tsx` | `galleryCardsStep` |
| `pg-ListStep` | `ShowtimeGallerySteps/pg-ListStep.tsx` | `galleryListStep` |
| `pg-PeopleStep` | `ShowtimeGallerySteps/pg-PeopleStep.tsx` | `galleryPeopleStep` |
| `pg-HighlightStep` | `ShowtimeGallerySteps/pg-HighlightStep.tsx` | `galleryScrollHighlightStep` |
| `pg-RevealStep` | `ShowtimeGallerySteps/pg-RevealStep.tsx` | `galleryRevealStep` |
| `pg-OverviewStep` | `ShowtimeGallerySteps/pg-OverviewStep.tsx` | `galleryOverview` |

---

## Unused/Deprecated Components

Based on the component-usage.json analysis, the following components are listed but **no longer exist** in the codebase:

| Component | Status | Notes |
|-----------|--------|-------|
| `components/overlayNav.tsx` | ❌ DELETED | No file found |
| `components/TextLayout.tsx` | ❌ DELETED | No file found |
| `components/NavbarVariantProvider.tsx` | ❌ DELETED | No file found |
| `components/LogoCarousel.tsx` | ❌ DELETED | No file found |
| `components/PeopleShowcaseHero.tsx` | ❌ DELETED | Replaced by `Fragments/pg-PeopleShowcaseHero.tsx` |
| `components/dataPointerRadial.tsx` | ❌ DELETED | No file found |
| `components/ui/AnimatedPathIconView.tsx` | ❌ DELETED | No file found |
| `components/ui/AnimatedPathIcon.tsx` | ❌ DELETED | No file found |
| `components/ui/closeIcon.tsx` | ❌ DELETED | CloseIcon is inline in multiple components |
| `pagebuilder/Fragments/pg-HeaderImageVideoComp.tsx` | ❌ DELETED | Replaced by `pg-HeaderImageVideoComp2.tsx` |

---

## Cleanup Recommendations

### 1. Update component-usage.json

Remove references to deleted components from `component-usage.json`:

```json
// Remove these entries:
"components/overlayNav.tsx"
"components/TextLayout.tsx"
"components/NavbarVariantProvider.tsx"
"components/LogoCarousel.tsx"
"components/PeopleShowcaseHero.tsx"
"components/dataPointerRadial.tsx"
"components/ui/AnimatedPathIconView.tsx"
"components/ui/AnimatedPathIcon.tsx"
"components/ui/closeIcon.tsx"
"components/pagebuilder/Fragments/pg-HeaderImageVideoComp.tsx"
```

### 2. Consolidate CloseIcon

`CloseIcon` is duplicated in multiple files:
- `ui/ScrollHighlight.tsx`
- `data/data-CaseGallery.tsx`
- `data/data-ServiceGallery.tsx`
- `pagebuilder/Fragments/pg-ExpandableCards.tsx`

**Recommendation**: Create a single `ui/CloseIcon.tsx` and import it where needed.

### 3. Review Button Components

Two button components exist:
- `ui/Button.tsx` - Used only by `not-found.tsx`
- `ui/Button2.tsx` - Used extensively

**Recommendation**: Consider consolidating or renaming for clarity.

### 4. Review GlobalDataComponent Naming

Two similarly named components:
- `globalDataComponent.tsx` (root) - Uses `ui/globe.tsx`
- `pg-GlobalDataComponent.tsx` (pagebuilder) - Different implementation

**Recommendation**: Rename for clarity or consolidate if functionality overlaps.

### 5. Verify pg-GlobalDataComponent Usage

`pg-GlobalDataComponent.tsx` is imported by:
- `pg-GlobeComponent.tsx`
- `data-SmartUnitsGlobe.tsx`

But is **not** directly exposed to the PageBuilder. This is intentional as it's a helper component.

---

## Component Dependency Graph

```
SiteWrapper.tsx
├── PageWithMapVertical.tsx
│   └── MapVertical.tsx
├── FrontNavOverlay.tsx
│   ├── data-CaseGalleryMenu.tsx
│   │   └── data-IntertitleCTA.tsx
│   └── Button2.tsx
└── FooterNew.tsx

PageBuilder.tsx
├── pg-ShowtimeGallery.tsx
│   └── ShowtimeGallerySteps/*.tsx
├── pg-HeroShowtime.tsx
│   └── pg-HeaderImageVideoComp2.tsx
├── pg-Header.tsx
│   ├── pg-HeaderImageVideoComp2.tsx
│   └── TypewriterRotator.tsx
├── pg-ContentSection.tsx
│   ├── GridBackground.tsx
│   └── StaggeredSlideUp.tsx
├── data-SmartPeople.tsx
│   └── PersonCard.tsx
├── data-SmartUnitsGlobe.tsx
│   └── pg-GlobalDataComponent.tsx
└── ... (other pagebuilder components)

CasePageBuilder.tsx
├── pg-HeadlineChallenge.tsx
├── pg-ChallengeAndSolution.tsx
├── pg-ApproachSection.tsx
└── pg-ResultsMetrics.tsx
    ├── AnimateNumberinView.tsx
    ├── percentageDiagram*.tsx
    └── Badgemodule.tsx
```

---

## Summary Statistics

| Category | Count |
|----------|-------|
| PageBuilder Components | 27 |
| CasePageBuilder Components | 4 |
| UI Components | 26 |
| Data Components | 7 |
| Data Fragments | 4 |
| PageBuilder Fragments | 6 |
| ShowtimeGallery Steps | 7 |
| Menu Components | 3 |
| Utility Components | 6 |
| **Total Active Components** | **90** |
| Deleted/Unused (in JSON) | 10 |

---

## Notes

- All PageBuilder components use `dynamic` imports with SSR enabled for code splitting
- Components wrapped with `withDebugBadge` HOC for development debugging
- All PageBuilder blocks are wrapped in `ErrorBoundary` for graceful error handling
- Gallery step components can be used both inside `showtimeGallery` or as standalone blocks
