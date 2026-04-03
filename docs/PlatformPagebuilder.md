# Platform PageBuilder: Component System Guide

> How to understand, use, and extend the PageBuilder component system — the engine that turns Sanity content blocks into interactive React pages.

---

## Table of Contents

1. [How the PageBuilder Works](#how-the-pagebuilder-works)
2. [Component Anatomy](#component-anatomy)
3. [The Block Registry](#the-block-registry)
4. [Component Categories](#component-categories)
5. [Server vs Client Components](#server-vs-client-components)
6. [Fragments: Shared Sub-Components](#fragments-shared-sub-components)
7. [Code Splitting & Dynamic Imports](#code-splitting--dynamic-imports)
8. [Error Handling](#error-handling)
9. [Adding a New Block (Step-by-Step)](#adding-a-new-block-step-by-step)
10. [Navigation Integration](#navigation-integration)
11. [Naming Conventions](#naming-conventions)
12. [Complete Block Reference](#complete-block-reference)

---

## How the PageBuilder Works

The PageBuilder is a **single orchestrator component** that receives an array of content blocks from Sanity and renders the correct React component for each one. It's the bridge between the CMS and the frontend.

### The lifecycle

```
SANITY STUDIO                    PAGE ROUTE                     PAGEBUILDER
─────────────                    ──────────                     ───────────
Editor arranges blocks     →     Page fetches content     →     Iterates content[]
in the page builder UI           from Sanity via GROQ           Maps _type → component
                                                                Renders with ErrorBoundary
```

### Conceptual model

```
Page Document in Sanity
└── content1sp: [                    ← Array of content blocks
      { _type: "oneSPHeader", ... }  ← Block 0 (hero)
      { _type: "contentSection", … } ← Block 1
      { _type: "smartCarousel", … }  ← Block 2
      { _type: "casesGallery…", … }  ← Block 3
      ...
    ]

                    ↓ passed as props

PageBuilder.tsx
├── Block 0: <OneSPHeaderStep />        ← Eager (rendered in initial HTML)
├── Block 1: <ContentSection />         ← Eager
└── <DeferredSection>                   ← Deferred (lazy-loaded on scroll)
    ├── Block 2: <SmartCarousel />
    └── Block 3: <CasesGalleryFiltered />
```

---

## Component Anatomy

Every PageBuilder block consists of up to **4 layers** across the codebase:

```
┌──────────────────────────────────────────────────────────┐
│  1. SANITY SCHEMA                                         │
│     sanity/schemaTypes/1SP/Components/myComponent.ts       │
│     → Defines fields, types, validation, Studio preview    │
├──────────────────────────────────────────────────────────┤
│  2. SCHEMA REGISTRY                                       │
│     sanity/schemaTypes/1spContent.ts                       │
│     → Registers the schema so Sanity knows it exists       │
│     sanity/schemaTypes/page.ts                             │
│     → Adds { type: 'myComponent' } to content1sp array    │
├──────────────────────────────────────────────────────────┤
│  3. REACT COMPONENT(S)                                    │
│     components/pagebuilder/pg-MyComponent.tsx               │
│     → "use client" — handles rendering & interactivity     │
│     components/pagebuilder/server/MyComponentBlock.tsx      │
│     → (optional) Server component for data fetching        │
├──────────────────────────────────────────────────────────┤
│  4. PAGEBUILDER REGISTRATION                              │
│     components/PageBuilder.tsx                             │
│     → dynamic import + switch case mapping                 │
└──────────────────────────────────────────────────────────┘
```

### Minimal example: ContentSection

**Layer 1 — Sanity Schema** (`sanity/schemaTypes/1SP/Components/contentSection.ts`):
```typescript
export default defineType({
  name: "contentSection",        // ← This becomes the _type
  title: "Content Section",
  type: "object",                // ← Always "object" for pagebuilder blocks
  icon: List,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "layout", title: "Layout & Style" },
    { name: "navigation", title: "Navigation" },
  ],
  fields: [
    defineField({ name: "title", type: "string", group: "content" }),
    defineField({ name: "content", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "columnSpan", type: "string", group: "layout" }),
    defineField({ name: "navPointName", type: "string", group: "navigation" }),
    // ...
  ],
  preview: { /* Studio preview config */ },
});
```

**Layer 2 — Registration** (`1spContent.ts` + `page.ts`):
```typescript
// 1spContent.ts — register the schema type
import contentSection from "./1SP/Components/contentSection";
const oneSPComponents = [contentSection, ...];
export const OneSPschemaTypes = [...oneSPComponents, ...];

// page.ts — allow it in the content array
defineField({
  name: 'content1sp',
  type: 'array',
  of: [
    { type: 'contentSection' },  // ← editors can add this block
    // ...
  ],
})
```

**Layer 3 — React Component** (`pg-ContentSection.tsx`):
```typescript
"use client";
import { PortableText } from "@portabletext/react";

type ContentSectionData = {
  title?: string;
  content?: PortableTextBlock[];
  columnSpan?: string;
  navPointName?: string;
  hideFromNav?: boolean;
};

function ContentSection({ data }: { data: ContentSectionData }) {
  const { title, content, columnSpan = "8" } = data || {};
  if (!content || content.length === 0) return null;

  return (
    <section id={sectionId} {...navPointDataAttr}>
      {title && <h2>{title}</h2>}
      <PortableText value={content} components={portableTextComponents} />
    </section>
  );
}
export default ContentSection;
```

**Layer 4 — PageBuilder switch case** (`PageBuilder.tsx`):
```typescript
// Import
const ContentSection = dynamic(
  () => import("./pagebuilder/pg-ContentSection"),
  { loading: () => <ComponentLoader />, ssr: true }
);

// Switch case
case "contentSection":
  return (
    <ErrorBoundary key={`error-${key}`}>
      <ContentSection key={key} data={block} />
    </ErrorBoundary>
  );
```

---

## The Block Registry

The **single source of truth** for which Sanity `_type` maps to which React component lives in the `switch` statement inside `PageBuilder.tsx`. The full mapping:

```typescript
switch (block._type) {
  // ═══════════════════════════════════════════════
  // HERO & HEADER COMPONENTS
  // ═══════════════════════════════════════════════
  case "oneSPHeader":        → OneSPHeaderStep       // pg-Header.tsx
  case "heroShowTime":       → HeroShowtime          // pg-HeroShowtime.tsx
  case "sublineComponent":   → SublineComponent      // pg-SublineComponent.tsx

  // ═══════════════════════════════════════════════
  // CONTENT SECTIONS
  // ═══════════════════════════════════════════════
  case "contentSection":     → ContentSection         // pg-ContentSection.tsx
  case "twoColContentSection": → TwoColContentSection // pg-2ColContentSection.tsx
  case "tabbedContentSection": → TabbedContentSection // pg-TabbedContentSection.tsx
  case "intertitleCTA":      → IntertitleCTA          // pg-IntertitleCTA.tsx
  case "headlineChallenge":  → HeadlineChallenge      // cases/pg-HeadlineChallenge.tsx

  // ═══════════════════════════════════════════════
  // GALLERY STEPS (standalone, composable)
  // ═══════════════════════════════════════════════
  case "galleryHeroStep":    → GalleryHeroStep        // pg-GalleryHeroStep.tsx
  case "galleryCardsStep":   → GalleryCardsStep       // pg-GalleryCardsStep.tsx
  case "galleryListStep":    → GalleryListStep        // pg-GalleryListStep.tsx
  case "galleryPeopleStep":  → GalleryPeopleStep      // pg-GalleryPeopleStep.tsx
  case "galleryScrollHighlightStep": → GalleryHighlightStep
  case "galleryRevealStep":  → GalleryRevealStep      // pg-GalleryRevealStep.tsx
  case "galleryOverview":    → GalleryOverviewStep    // pg-GalleryOverviewStep.tsx

  // ═══════════════════════════════════════════════
  // SHOWTIME (scroll-driven composite gallery)
  // ═══════════════════════════════════════════════
  case "showtimeGallery":    → ShowtimeGallery        // pg-ShowtimeGallery.tsx
                             // (deferred → DeferredShowtimeGalleryShell)

  // ═══════════════════════════════════════════════
  // SMART COMPONENTS (server → client pattern)
  // ═══════════════════════════════════════════════
  case "smartCarousel":      → SmartCarouselBlock     // server/SmartCarouselBlock.tsx
  case "smartPeople":        → SmartPeople            // data/data-SmartPeople.tsx
  case "smartUnitsGallery":  → SmartUnitsGallery      // data/data-UnitsExpandableCards.tsx
  case "smartUnitsGlobe":    → SmartUnitsGlobe        // data/data-SmartUnitsGlobe.tsx

  // ═══════════════════════════════════════════════
  // DATA-HEAVY COMPONENTS (server → client pattern)
  // ═══════════════════════════════════════════════
  case "casesGalleryFiltered":   → CasesGalleryFilteredBlock   // server/
  case "casesGalleryFilteredWithPagination": → ...Block         // server/
  case "servicesGalleryFiltered": → ServicesGalleryFilteredBlock // server/
  case "unitLogoGrid":       → UnitLogoGridBlock      // server/
  case "pageBuilderLogoFloat": → PageBuilderLogoFloatBlock // server/

  // ═══════════════════════════════════════════════
  // STANDALONE COMPONENTS
  // ═══════════════════════════════════════════════
  case "casesIntro":         → CasesIntro             // pg-CasesIntro.tsx
  case "carousel":           → InteractiveCarousel    // pg-InteractiveCarousel.tsx
  case "globeComponent":     → GlobeComponent         // pg-GlobeComponent.tsx
  case "servicesHeroWithBadge": → ServicesHeroWithBadge
  case "pageBuilderPersonioJobs": → PageBuilderPersonioJobs
}
```

---

## Component Categories

### Category 1: Pure Client Components

The most common pattern. The component receives all its data from the PageBuilder via props (which came from the Sanity page query). No additional data fetching needed.

```
Sanity Page Query → content[] → PageBuilder → props → "use client" component
```

**Examples:** `ContentSection`, `OneSPHeader`, `IntertitleCTA`, `GalleryHeroStep`

**When to use:** The component's data is entirely contained in the Sanity block object — no need to look up related documents.

---

### Category 2: Server → Client (data-fetching components)

For blocks that need data **beyond** what's in the content block — for example, resolving references to case studies, fetching unit logos, etc.

```
PageBuilder → ServerBlock (async, fetches data) → ClientComponent (renders UI)
```

**File structure:**
```
pagebuilder/
├── server/SmartCarouselBlock.tsx    ← Server: fetches data
└── pg-SmartCarousel.tsx             ← Client: renders UI
```

**Server component:**
```typescript
// server/SmartCarouselBlock.tsx — NO "use client"
export default async function SmartCarouselBlock({ language, channel, ... }) {
  const caseStudies = await getInteractiveCarouselCases(channel, language, maxItems);
  return <SmartCarouselClient caseStudies={caseStudies} {...props} />;
}
```

**Client component:**
```typescript
// pg-SmartCarousel.tsx
"use client";
export default function SmartCarouselClient({ caseStudies, ... }) {
  // Pure rendering + interactivity, no data fetching
  return <div>{caseStudies.map(...)}</div>;
}
```

**When to use:** The block references other Sanity documents (case studies, units, people) that need server-side GROQ queries to resolve.

**All server components:**
| Server file | Fetches | Renders |
|-------------|---------|---------|
| `CasesGalleryFilteredBlock` | Case studies (auto or manual selection) | `pg-CasesGalleryFiltered` |
| `CasesGalleryFilteredWithPaginationBlock` | Case studies with pagination | `pg-CasesGalleryFilteredWithPagination` |
| `SmartCarouselBlock` | Interactive carousel cases | `pg-SmartCarousel` |
| `PageBuilderLogoFloatBlock` | Unit logos (floating animation) | `pg-PageBuilderLogoFloat` |
| `UnitLogoGridBlock` | Unit logos (grid layout) | `pg-UnitLogoGrid` |
| `ServicesGalleryFilteredBlock` | Services data | `pg-ServicesGalleryFiltered` |

---

### Category 3: Deferred Components

Heavy components that are costly to render and always appear below the fold. They use additional deferral patterns beyond the PageBuilder's `deferAfter` split.

**Example: `DeferredShowtimeGalleryShell`**

```typescript
// client/DeferredShowtimeGalleryShell.tsx
"use client";

const ShowtimeGallery = dynamic(() => import("../pg-ShowtimeGallery"), {
  ssr: false,  // ← Don't even include in server HTML
});

export default function DeferredShowtimeGalleryShell({ data }) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // IntersectionObserver: only mount when scrolled into view
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setShouldRender(true);
        observer.disconnect();
      }
    });
    observer.observe(ref.current);
  }, []);

  return shouldRender
    ? <ShowtimeGallery data={data} />
    : <div style={{ minHeight: calculatedHeight }} />;
}
```

The PageBuilder chooses between eager and deferred versions based on position:

```typescript
case "showtimeGallery":
  return isDeferred
    ? <DeferredShowtimeGallery data={block} />   // Below fold: lazy
    : <ShowtimeGallery data={block} />;           // Above fold: immediate
```

---

## Fragments: Shared Sub-Components

The `components/pagebuilder/Fragments/` directory contains **reusable sub-components** shared across multiple PageBuilder blocks. They're not standalone blocks — they're building blocks used inside other blocks.

```
Fragments/
├── HeroVideoComp.tsx            ← Video player with poster-paint-gating (LCP)
├── pg-HeaderImageVideoComp2.tsx ← Image/video background with responsive variants
├── pg-InteractiveCarousel.tsx   ← Carousel rendering engine
├── pg-ExpandableCards.tsx       ← Expanding card grid
├── pg-PeopleShowcaseHero.tsx    ← People showcase with video/image
├── pg-CtaSplitHeader.tsx        ← Split-layout CTA header
└── pg-CtaMiniComponent.tsx      ← Compact CTA button/link
```

**Usage example:**
```typescript
// pg-Header.tsx uses HeroVideoComp as a sub-component
import HeroVideoComp from "./Fragments/HeroVideoComp";

function OneSPHeaderStep({ step }) {
  return (
    <section>
      <HeroVideoComp videoSrc={step.backgroundVideo} />
      <h1>{step.headline}</h1>
    </section>
  );
}
```

**Key difference from blocks:**
- Fragments are **never registered** in the PageBuilder switch case
- Fragments don't have their own Sanity schema
- Fragments are imported directly by parent block components
- All fragments are `"use client"` components

---

## Code Splitting & Dynamic Imports

Almost every component in the PageBuilder is loaded via `next/dynamic`:

```typescript
const ContentSection = dynamic(
  () => import("./pagebuilder/pg-ContentSection"),
  {
    loading: () => <ComponentLoader />,   // Shown while JS chunk loads
    ssr: true,                             // Still renders HTML on server
  }
);
```

### Import strategies by priority

| Strategy | Usage | Why |
|----------|-------|-----|
| **Static import** | `OneSPHeaderStep` (hero) | Critical path — must be in initial bundle for LCP |
| **Dynamic + ssr: true** | Most components | Code-split but HTML appears in server render |
| **Dynamic + ssr: false** | `DeferredShowtimeGallery`, `TypewriterRotator` | Heavy JS (motion libs) that shouldn't be in the server bundle at all |

### The `ComponentLoader` placeholder

While a dynamic chunk loads, the user sees a lightweight placeholder:

```typescript
function ComponentLoader({ height = "h-64", text = "Loading..." }) {
  return (
    <div className={`w-full ${height} flex items-center justify-center`}>
      <div className="text-gray-400">{text}</div>
    </div>
  );
}
```

---

## Error Handling

Every block is wrapped in an `ErrorBoundary`:

```typescript
case "contentSection":
  return (
    <ErrorBoundary key={`error-${key}`}>
      <ContentSection key={key} data={block} />
    </ErrorBoundary>
  );
```

If a single component crashes (bad data, runtime error), it shows a "Something went wrong" message with a "Try again" button. **The rest of the page continues to work.** This is critical because:

- CMS editors can accidentally create invalid data structures
- Third-party APIs (Personio, Cloudinary) can fail
- Client-side JS errors (browser compatibility) are isolated

---

## Adding a New Block (Step-by-Step)

### Example: Adding a "TestimonialCarousel" block

#### Step 1: Create the Sanity schema

```typescript
// sanity/schemaTypes/1SP/Components/testimonialCarousel.ts
import { defineType, defineField } from "sanity";
import { Quotes } from "@phosphor-icons/react";

export default defineType({
  name: "testimonialCarousel",           // ← This is the _type
  title: "Testimonial Carousel",
  type: "object",
  icon: Quotes,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "navigation", title: "Navigation" },
  ],
  fields: [
    // Navigation fields (standard)
    defineField({
      name: "navPointName",
      type: "string",
      group: "navigation",
    }),
    defineField({
      name: "hideFromNav",
      type: "boolean",
      initialValue: false,
      group: "navigation",
    }),
    // Content fields
    defineField({
      name: "headline",
      title: "Section Headline",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "quote", type: "text", rows: 4 }),
            defineField({ name: "author", type: "string" }),
            defineField({ name: "role", type: "string" }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { headline: "headline", testimonials: "testimonials" },
    prepare({ headline, testimonials }) {
      return {
        title: headline || "Testimonial Carousel",
        subtitle: `${testimonials?.length || 0} testimonials`,
        media: Quotes,
      };
    },
  },
});
```

#### Step 2: Register the schema

```typescript
// sanity/schemaTypes/1spContent.ts
import testimonialCarousel from "./1SP/Components/testimonialCarousel";

const oneSPComponents = [
  // ... existing components
  testimonialCarousel,   // ← Add here
];
```

```typescript
// sanity/schemaTypes/page.ts → content1sp array
defineField({
  name: 'content1sp',
  type: 'array',
  of: [
    // ... existing types
    { type: 'testimonialCarousel' },   // ← Add here
  ],
})
```

#### Step 3: Create the React component

**Option A: Client-only (if all data is inline)**

```typescript
// components/pagebuilder/pg-TestimonialCarousel.tsx
"use client";
import React, { useState } from "react";

type TestimonialCarouselData = {
  headline?: string;
  testimonials?: Array<{
    quote: string;
    author: string;
    role: string;
  }>;
  navPointName?: string;
  hideFromNav?: boolean;
};

export default function TestimonialCarousel({
  data,
}: {
  data: TestimonialCarouselData;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { headline, testimonials = [] } = data || {};

  if (testimonials.length === 0) return null;

  return (
    <section
      data-navpoint-name={data.navPointName}
      data-nav-hidden={data.hideFromNav ? "true" : undefined}
    >
      {headline && <h2>{headline}</h2>}
      <blockquote>{testimonials[activeIndex].quote}</blockquote>
      <p>{testimonials[activeIndex].author}</p>
      {/* Navigation dots / arrows */}
    </section>
  );
}
```

**Option B: Server → Client (if you need to resolve references)**

```typescript
// components/pagebuilder/server/TestimonialCarouselBlock.tsx
import { getTestimonials } from "@/lib/sanity/queries";
import TestimonialCarouselClient from "../pg-TestimonialCarousel";

export default async function TestimonialCarouselBlock({ language, ... }) {
  const testimonials = await getTestimonials(language);
  return <TestimonialCarouselClient testimonials={testimonials} {...props} />;
}
```

#### Step 4: Register in PageBuilder.tsx

```typescript
// Import (at top of file)
const TestimonialCarousel = dynamic(
  () => import("./pagebuilder/pg-TestimonialCarousel"),
  // Or for server variant:
  // () => import("./pagebuilder/server/TestimonialCarouselBlock"),
  {
    loading: () => <ComponentLoader />,
    ssr: true,
  }
);

// Switch case (inside renderBlock function)
case "testimonialCarousel":
  return (
    <ErrorBoundary key={`error-${key}`}>
      <TestimonialCarousel key={key} data={block} />
    </ErrorBoundary>
  );
```

#### Step 5: Generate TypeScript types (optional but recommended)

After adding the schema, run the Sanity type generation:
```bash
pnpm sanity typegen generate
```

This updates `types/sanity.types.ts` with the new block type, which you can use for type-safe props.

#### Checklist

- [ ] Schema created in `sanity/schemaTypes/1SP/Components/`
- [ ] Schema registered in `1spContent.ts`
- [ ] Type added to `content1sp` array in `page.ts`
- [ ] React component created in `components/pagebuilder/`
- [ ] Dynamic import added to `PageBuilder.tsx`
- [ ] Switch case added to `renderBlock()` in `PageBuilder.tsx`
- [ ] ErrorBoundary wraps the component in the switch case
- [ ] Navigation fields (`navPointName`, `hideFromNav`) included if relevant
- [ ] TypeScript types generated via `pnpm sanity typegen generate`

---

## Navigation Integration

Most PageBuilder blocks support the **vertical navigation minimap** via two standard fields:

```typescript
// Shared field definitions: sanity/schemaTypes/shared/navigationFields.ts
export const navigationFields = [
  defineField({
    name: "navPointName",
    type: "string",
    description: "Custom name in the vertical navigation minimap",
  }),
  defineField({
    name: "hideFromNav",
    type: "boolean",
    initialValue: false,
    description: "Hide this section from the navigation minimap",
  }),
];
```

**In the React component**, expose these as data attributes:

```typescript
<section
  id={sectionId}
  data-navpoint-name={navPointName}    // ← Custom display name
  data-nav-hidden={hideFromNav ? "true" : undefined}  // ← Opt-out
>
```

The navigation system reads these attributes to build the minimap automatically.

---

## Naming Conventions

### Files

| Location | Pattern | Example |
|----------|---------|---------|
| Sanity schema | `camelCase.ts` | `contentSection.ts` |
| Client component | `pg-PascalCase.tsx` | `pg-ContentSection.tsx` |
| Server component | `PascalCaseBlock.tsx` | `SmartCarouselBlock.tsx` |
| Fragment | `pg-PascalCase.tsx` or `PascalCase.tsx` | `HeroVideoComp.tsx` |
| Data component | `data-PascalCase.tsx` | `data-SmartPeople.tsx` |

### Sanity type names

| Convention | Example |
|------------|---------|
| Schema `name` | `"contentSection"` (camelCase) |
| Schema `title` | `"Content Section"` (Title Case) |
| PageBuilder `_type` | Same as schema `name`: `"contentSection"` |

### Variables in PageBuilder

| Pattern | Example |
|---------|---------|
| Dynamic import const | `const ContentSection = dynamic(...)` (PascalCase) |
| Switch case | `case "contentSection":` (matches Sanity `_type`) |
| Props key | `key={block._key ?? block._type-${i}}` |

---

## Complete Block Reference

### Blocks available in the `content1sp` array

| Sanity `_type` | Sanity Title | Component | Pattern | Description |
|----------------|-------------|-----------|---------|-------------|
| `oneSPHeader` | Header | `pg-Header.tsx` | Client | Hero section with video, typewriter, poster |
| `heroShowTime` | Hero Showtime | `pg-HeroShowtime.tsx` | Client | Animated hero section |
| `sublineComponent` | Subline | `pg-SublineComponent.tsx` | Client | Text subline with animation |
| `contentSection` | Content Section | `pg-ContentSection.tsx` | Client | Rich text with PortableText |
| `twoColContentSection` | 2-Col Content | `pg-2ColContentSection.tsx` | Client | Two-column layout |
| `tabbedContentSection` | Tabbed Content | `pg-TabbedContentSection.tsx` | Client | Tabbed interface |
| `intertitleCTA` | Intertitle CTA | `pg-IntertitleCTA.tsx` | Client | CTA banner between sections |
| `headlineChallenge` | Headline | `cases/pg-HeadlineChallenge.tsx` | Client | Challenge/solution headline |
| `casesIntro` | Cases Intro | `pg-CasesIntro.tsx` | Client | Case studies introduction |
| `casesGalleryFiltered` | Cases Gallery | `server/CasesGalleryFilteredBlock.tsx` | Server→Client | Filterable case grid |
| `casesGalleryFilteredWithPagination` | Cases + Pagination | `server/CasesGalleryFiltered…Block.tsx` | Server→Client | Paginated case grid |
| `servicesGalleryFiltered` | Services Gallery | `server/ServicesGalleryFilteredBlock.tsx` | Server→Client | Services listing |
| `servicesHeroWithBadge` | Services Hero | `pg-ServicesHeroWithBadge.tsx` | Client | Services hero with badge |
| `galleryHeroStep` | Gallery Hero | `pg-GalleryHeroStep.tsx` | Client | Standalone gallery hero |
| `galleryCardsStep` | Gallery Cards | `pg-GalleryCardsStep.tsx` | Client | Standalone card grid |
| `galleryListStep` | Gallery List | `pg-GalleryListStep.tsx` | Client | Standalone list view |
| `galleryPeopleStep` | Gallery People | `pg-GalleryPeopleStep.tsx` | Client | People showcase grid |
| `galleryScrollHighlightStep` | Scroll Highlight | `pg-GalleryHighlightStep.tsx` | Client | Scroll-driven highlight |
| `galleryRevealStep` | Gallery Reveal | `pg-GalleryRevealStep.tsx` | Client | Reveal animation step |
| `galleryOverview` | Gallery Overview | `pg-GalleryOverviewStep.tsx` | Client | Overview grid |
| `showtimeGallery` | Showtime Gallery | `pg-ShowtimeGallery.tsx` | Deferred Client | Full scroll-driven gallery |
| `carousel` | Carousel | `pg-InteractiveCarousel.tsx` | Client | Image/content carousel |
| `smartCarousel` | Smart Carousel | `server/SmartCarouselBlock.tsx` | Server→Client | Auto-populated case carousel |
| `smartPeople` | Smart People | `data/data-SmartPeople.tsx` | Client + fetch | Auto-populated people grid |
| `smartUnitsGallery` | Units Gallery | `data/data-UnitsExpandableCards.tsx` | Client + fetch | Expandable unit cards |
| `smartUnitsGlobe` | Units Globe | `data/data-SmartUnitsGlobe.tsx` | Client + fetch | 3D globe with units |
| `globeComponent` | Globe | `pg-GlobeComponent.tsx` | Client | Standalone globe |
| `unitLogoGrid` | Unit Logo Grid | `server/UnitLogoGridBlock.tsx` | Server→Client | Grid of unit logos |
| `pageBuilderLogoFloat` | Logo Float | `server/PageBuilderLogoFloatBlock.tsx` | Server→Client | Floating logo animation |
| `pageBuilderPersonioJobs` | Personio Jobs | `pg-PageBuilderPersonioJobs.tsx` | Client | Job listings from Personio |

---

## Directory Map

```
components/
├── PageBuilder.tsx                    ← Orchestrator (import, map, render)
├── ErrorBoundary.tsx                  ← Crash isolation per block
└── pagebuilder/
    ├── pg-Header.tsx                  ← Client components (the majority)
    ├── pg-ContentSection.tsx
    ├── pg-IntertitleCTA.tsx
    ├── ...
    ├── server/                        ← Server components (data fetching)
    │   ├── CasesGalleryFilteredBlock.tsx
    │   ├── SmartCarouselBlock.tsx
    │   └── ...
    ├── client/                        ← Special client wrappers
    │   └── DeferredShowtimeGalleryShell.tsx
    ├── Fragments/                     ← Shared sub-components
    │   ├── HeroVideoComp.tsx
    │   ├── pg-HeaderImageVideoComp2.tsx
    │   └── ...
    ├── cases/                         ← Case-study-specific blocks
    │   ├── pg-HeadlineChallenge.tsx
    │   └── ...
    └── ShowtimeGallerySteps/          ← Steps used inside ShowtimeGallery
        ├── pg-HeroStep.tsx
        ├── pg-CardsStep.tsx
        └── ...

sanity/schemaTypes/
├── index.ts                           ← Master registry
├── page.ts                            ← Page document (content1sp array)
├── 1spContent.ts                      ← All 1SP block schemas
└── 1SP/
    ├── Components/                    ← Block schema definitions
    │   ├── contentSection.ts
    │   ├── smartCarousel.ts
    │   └── ...
    ├── Items/                         ← Nested item types
    │   ├── cardItem.ts
    │   └── ...
    └── Objects/                       ← Reusable field groups
        ├── CtaMiniComponent.ts
        └── ...
```
