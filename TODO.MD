Globe: Editable text for headline/subcopy
~~Vertical Nav: Option to include component or not. Rogue 'Gradient' entry~~ ✅ DONE (2026-01-18)
Logo sizing: Generally inconsistent
~~Manually re-order cases for smart carousel~~ ✅ DONE (2026-01-18)
~~Option to include and/or edit 'Challenges' headline and sub copy on Case Study page~~ ✅ DONE (2026-01-18)
~~Intro Component: override need to include CTA~~ ✅ DONE (2026-01-18) - See ChallengeAndSolution showCta toggle
~~Option to include (or not) 'Solution' headline on Case Study page~~ ✅ DONE (2026-01-18)
Grid lines not showing when going from grey to white background

---

## Completed Tasks

### ✅ Hide from Navigation Feature (2026-01-18)

Added ability to selectively hide pagebuilder sections from the vertical navigation minimap.

**Changes made:**

1. **Core Logic** (`components/ui/PageWithMapVertical.tsx`)
   - Added detection for `data-nav-hidden="true"` attribute

2. **Shared Field Definitions** (NEW: `sanity/schemaTypes/shared/navigationFields.ts`)
   - Created reusable `hideFromNavField` and `navPointNameField` definitions
   - Can be imported as `navigationFields` array for new components

3. **Updated Sanity Schemas** (added `hideFromNav` boolean field):
   - `contentSection.ts`
   - `heroShowtime.tsx`
   - `intertitleCTA.ts`
   - `Header.tsx`
   - `twoColContentSection.ts`
   - `casesGalleryFiltered.ts`
   - `casesGalleryFilteredWithPagination.ts`
   - `casesIntro.ts`
   - `globeComponent.ts`
   - `servicesGalleryFiltered.ts`
   - `servicesHeroWithBadge.ts`
   - `sublineComponent.ts`
   - `galleryHeroStep.ts`
   - `galleryCardsStep.ts`
   - `galleryListStep.ts`
   - `galleryPeopleStep.ts`
   - `galleryScrollHighlightStep.ts`
   - `GalleryRevealStep.ts`
   - `GalleryOverviewStep.ts`
   - `headlineChallenge.ts` (CaseStudy)
   - `approachSection.ts` (CaseStudy)
   - `resultsMetrics.ts` (CaseStudy)
   - `challengeAndSolution.ts` (CaseStudy)

4. **Updated React Components** (added `hideFromNav` prop and `data-nav-hidden` attribute):
   - `pg-ContentSection.tsx`
   - `pg-HeroShowtime.tsx`
   - `pg-IntertitleCTA.tsx`
   - `pg-Header.tsx`
   - `pg-2ColContentSection.tsx`

5. **Updated Documentation**
   - `docs/PAGEBUILDER_COMPONENT_GUIDE.md` - Updated templates to include `hideFromNav`

**How to use:**
In Sanity Studio, each component has a "Navigation" group with:
- **Navigation Point Name** - Custom label for the vertical nav
- **Hide from Navigation** - Toggle to hide this section from the vertical nav

**Note:** The remaining React components (cases, services, gallery steps) will read `hideFromNav` 
from their data props and should have the `data-nav-hidden` attribute added to their wrapper 
elements if full functionality is needed.

### ✅ Smart Carousel Manual Selection (2026-01-18)

Added ability to manually select and reorder cases in the Smart Carousel via drag & drop.

**Changes made:**

1. **Sanity Schema** (`sanity/schemaTypes/1SP/Components/smartCarousel.ts`)
   - Added `selectionMode` field with "Auto" and "Manual Selection" options
   - Added `selectedCases` array for drag & drop reference selection
   - Added `navPointName` and `hideFromNav` fields

2. **GROQ Queries** (`sanity/lib/queries.ts`)
   - Added `smartCarousel` projection to dereference `selectedCases`

3. **React Components**
   - `pg-SmartCarousel.tsx` - Updated to handle both modes
   - `data-InteractiveCarousel.tsx` - Uses pre-fetched cases for manual mode

**How to use:**
In Sanity Studio, the Smart Carousel now has:
- **Case Selection Mode** - Choose "Auto" or "Manual Selection"
- **Maximum Items** (Auto mode) - Limit for auto-populated cases
- **Selected Cases** (Manual mode) - Drag & drop to select and reorder cases

### ✅ Challenge & Solution Component Updates (2026-01-18)

Made the ChallengeAndSolution component more flexible with optional sections.

**New fields added:**

| Field | Type | Description |
|-------|------|-------------|
| `showContent` | boolean | Toggle to show/hide challenges or services list |
| `challengeDescription` | text | Editable description for the challenge section (falls back to translation) |
| `showSolution` | boolean | Toggle to show/hide the solution section |
| `solutionHeadline` | string | Editable headline for solution section (falls back to "Solution") |
| `showCta` | boolean | Toggle to show/hide the CTA mini component |

**Layout behavior:**
- When `showCta` is OFF, the list items expand to fill the available width
- All toggles default to `true` to maintain backward compatibility

**How to use:**
In Sanity Studio, the Challenge & Solution component now has:
- **Content Tab:** Toggles for content, solution, and editable headlines
- **CTA Tab:** Toggle for showing/hiding the CTA section
