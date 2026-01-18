# PageBuilder Component Creation Guide

This guide explains how to create a new PageBuilder component and integrate it into the Sanity CMS and Next.js frontend.

---

## Overview

Creating a new PageBuilder component requires **4 files** to be created/modified:

1. **Sanity Schema** - Define the CMS structure
2. **React Component** - Build the frontend component
3. **Schema Registration** - Register the schema type
4. **PageBuilder Integration** - Add to the page builder switch

---

## Step 1: Create the Sanity Schema

**Location:** `sanity/schemaTypes/1SP/Components/[componentName].ts`

### Template Structure

```typescript
import { defineType, defineField } from "sanity";
import { FiIcon } from "react-icons/fi"; // Choose appropriate icon

type MediaParent = { useVideo?: boolean }; // If using media toggle

export default defineType({
  name: "componentName", // camelCase, used in _type
  title: "Component Display Name",
  type: "object",
  icon: FiIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Media" },
    { name: "layout", title: "Layout & Style" },
    { name: "navigation", title: "Navigation" },
  ],
  fields: [
    // NAVIGATION (optional but recommended)
    defineField({
      name: "navPointName",
      title: "Navigation Point Name",
      type: "string",
      description: "Optional custom name for the vertical navigation minimap.",
      group: "navigation",
    }),
    defineField({
      name: "hideFromNav",
      title: "Hide from Navigation",
      type: "boolean",
      description: "If enabled, this section will not appear in the vertical navigation minimap.",
      initialValue: false,
      group: "navigation",
    }),

    // CONTENT FIELDS
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
    }),
    
    // Rich text content
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      group: "content",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "H5", value: "h5" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  { name: "href", type: "url", title: "URL" },
                  { name: "blank", type: "boolean", title: "Open in new tab", initialValue: true },
                ],
              },
            ],
          },
        },
      ],
    }),

    // MEDIA FIELDS (if needed)
    defineField({
      name: "useVideo",
      title: "Use video instead of image",
      type: "boolean",
      initialValue: false,
      group: "media",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "cloudinary.asset",
      group: "media",
      hidden: ({ parent }) => (parent as MediaParent)?.useVideo === true,
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "cloudinary.asset",
      group: "media",
      hidden: ({ parent }) => (parent as MediaParent)?.useVideo !== true,
    }),

    // LAYOUT FIELDS
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      group: "layout",
      options: {
        list: [
          { title: "White", value: "white" },
          { title: "Very Light Gray (neutral-100)", value: "neutral-100" },
          { title: "Light Gray (neutral-400)", value: "neutral-400" },
          { title: "Dark Gray (neutral-700)", value: "neutral-700" },
          { title: "Black", value: "black" },
        ],
        layout: "dropdown",
      },
      initialValue: "white",
    }),
    defineField({
      name: "showGridBackground",
      title: "Show Grid Background",
      type: "boolean",
      initialValue: true,
      group: "layout",
    }),
    defineField({
      name: "paddingY",
      title: "Vertical Padding",
      type: "string",
      group: "layout",
      options: {
        list: [
          { title: "Small (py-8)", value: "8" },
          { title: "Medium (py-16)", value: "16" },
          { title: "Large (py-24)", value: "24" },
          { title: "Extra Large (py-32)", value: "32" },
        ],
        layout: "radio",
      },
      initialValue: "16",
    }),
  ],
  preview: {
    select: {
      title: "title",
      backgroundColor: "backgroundColor",
    },
    prepare({ title, backgroundColor }) {
      return {
        title: title || "Component Name",
        subtitle: `${backgroundColor || "white"} background`,
      };
    },
  },
});
```

---

## Step 2: Create the React Component

**Location:** `components/pagebuilder/pg-[ComponentName].tsx`

### Template Structure

```tsx
"use client";

import React from "react";
import GridBackground from "@/components/ui/GridBackground";
import StaggeredFadeIn from "@/components/ui/StaggeredFadeIn";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { Link } from "next-view-transitions";
import { assetUrl } from "@/utils/utils";
import type { CloudinaryAsset } from "@/types/sanity.types";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

// Type definition matching Sanity schema
type ComponentNameData = {
  title?: string;
  content?: PortableTextBlock[];
  contentSize?: string;
  useVideo?: boolean;
  image?: CloudinaryAsset;
  video?: CloudinaryAsset;
  backgroundColor?: "white" | "neutral-100" | "neutral-400" | "neutral-700" | "black";
  showGridBackground?: boolean;
  paddingY?: string;
  navPointName?: string;
  hideFromNav?: boolean;
};

// Helper for video detection
function isVideoUrl(url?: string) {
  return !!url && (/\/video\//.test(url) || /\.(mp4|webm|ogg)$/i.test(url));
}

function ComponentName({ data }: { data: ComponentNameData }) {
  const {
    title,
    content,
    contentSize = "lg",
    useVideo = false,
    image,
    video,
    backgroundColor = "white",
    showGridBackground = true,
    paddingY = "16",
    navPointName,
    hideFromNav = false,
  } = data || {};

  // Early return if no content
  if (!content || content.length === 0) return null;

  // Get media URL
  const mediaAsset = useVideo ? video : image;
  const mediaUrl = assetUrl(mediaAsset);

  // Generate section ID from title
  const sectionId = title
    ? title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-").toLowerCase()
    : "component-section";

  // Navigation point data attributes (including hideFromNav)
  const navPointDataAttr = {
    ...(navPointName ? { "data-navpoint-name": navPointName } : {}),
    ...(hideFromNav ? { "data-nav-hidden": "true" } : {}),
  };

  // Background color classes
  const bgColorMap: Record<string, string> = {
    white: "bg-white",
    "neutral-100": "bg-neutral-100",
    "neutral-400": "bg-neutral-400",
    "neutral-700": "bg-neutral-700",
    black: "bg-black",
  };

  // Text color based on background (dark bg = light text)
  const textColorMap: Record<string, { primary: string; secondary: string }> = {
    white: { primary: "text-neutral-900", secondary: "text-neutral-700" },
    "neutral-100": { primary: "text-neutral-900", secondary: "text-neutral-700" },
    "neutral-400": { primary: "text-neutral-900", secondary: "text-neutral-800" },
    "neutral-700": { primary: "text-white", secondary: "text-neutral-200" },
    black: { primary: "text-white", secondary: "text-neutral-300" },
  };

  // Padding Y classes
  const paddingYMap: Record<string, string> = {
    "8": "py-8",
    "16": "py-16",
    "24": "py-24",
    "32": "py-32",
  };

  const bgClass = bgColorMap[backgroundColor] || "bg-white";
  const textColors = textColorMap[backgroundColor] || textColorMap.white;
  const paddingClass = paddingYMap[paddingY] || "py-16";

  // PortableText components with dynamic text colors
  const portableTextComponents = {
    block: {
      normal: ({ children }: any) => (
        <p className={`text-lg ${textColors.secondary} mb-4`}>{children}</p>
      ),
      h2: ({ children }: any) => (
        <h2 className={`text-4xl md:text-5xl font-semibold ${textColors.primary} mt-8 mb-4`}>
          {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3 className={`text-3xl md:text-4xl font-semibold ${textColors.primary} mt-8 mb-4`}>
          {children}
        </h3>
      ),
      // ... add other block types as needed
    },
    marks: {
      strong: ({ children }: any) => (
        <strong className={`font-bold ${textColors.primary}`}>{children}</strong>
      ),
      link: ({ value, children }: any) => (
        <Link
          href={value?.href}
          target={value?.blank ? "_blank" : undefined}
          rel={value?.blank ? "noopener noreferrer" : undefined}
          className="text-blue-600 hover:text-blue-800 underline transition-colors"
        >
          {children}
        </Link>
      ),
    },
  };

  return (
    <section
      id={sectionId}
      className={`relative ${bgClass} ${paddingClass} overflow-hidden`}
      {...navPointDataAttr}
    >
      <div className="relative mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="grid grid-cols-12 gap-6 md:gap-12">
          {/* Grid Background */}
          {showGridBackground && (
            <GridBackground className="absolute inset-0" columns={12} />
          )}

          {/* Your content here */}
          <div className="col-span-12">
            <StaggeredSlideUp>
              <PortableText value={content} components={portableTextComponents} />
            </StaggeredSlideUp>
          </div>
        </div>
      </div>
    </section>
  );
}

// Export with debug badge wrapper
export default withDebugBadge(ComponentName, "componentName");
```

---

## Step 3: Register the Schema

**File:** `sanity/schemaTypes/1spContent.ts`

### Add Import

```typescript
import componentName from "./1SP/Components/componentName";
```

### Add to Array

```typescript
const oneSPComponents = [
    showtimeGallery,
    heroShowtime,
    // ... existing components
    componentName, // Add your new component
];
```

---

## Step 4: Add to PageBuilder

**File:** `components/PageBuilder.tsx`

### Add Dynamic Import

```typescript
const ComponentName = dynamic(
  () => import("./pagebuilder/pg-ComponentName"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    ),
    ssr: true,
  }
);
```

### Add Switch Case

```typescript
case "componentName":
  return (
    <ErrorBoundary key={`error-${key}`}>
      <ComponentName key={key} data={block} />
    </ErrorBoundary>
  );
```

---

## Step 5: Add to Page Schema

**File:** `sanity/schemaTypes/page.ts`

Add to the `content1sp` array:

```typescript
defineField({
    name: 'content1sp',
    title: 'Content 1SP',
    type: 'array',
    group: 'content',
    of: [
        // ... existing types
        { type: 'componentName' },
    ],
}),
```

---

## Common Patterns & Utilities

### Media Handling

```typescript
import { assetUrl } from "@/utils/utils";
import type { CloudinaryAsset } from "@/types/sanity.types";

const mediaUrl = assetUrl(mediaAsset as CloudinaryAsset | undefined);
const isVideo = /\/video\//.test(mediaUrl) || /\.(mp4|webm|ogg)$/i.test(mediaUrl);
```

### Video/Image Conditional Rendering

```tsx
{isVideo && mediaUrl ? (
  <video src={mediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
) : mediaUrl ? (
  <img src={mediaUrl} alt={alt} className="w-full h-full object-cover" />
) : null}
```

### Animation Components

- `StaggeredFadeIn` - Fade in with stagger effect
- `StaggeredSlideUp` - Slide up with stagger effect
- `GridBackground` - Animated grid lines background

### Debug Badge

Always wrap export with `withDebugBadge` for dev mode visibility:

```typescript
export default withDebugBadge(ComponentName, "componentName");
```

---

## Checklist

- [ ] Create Sanity schema in `sanity/schemaTypes/1SP/Components/`
- [ ] Create React component in `components/pagebuilder/`
- [ ] Import schema in `sanity/schemaTypes/1spContent.ts`
- [ ] Add to `oneSPComponents` array
- [ ] Add dynamic import in `components/PageBuilder.tsx`
- [ ] Add switch case in `PageBuilder.tsx`
- [ ] Add to `content1sp` array in `sanity/schemaTypes/page.ts`
- [ ] Test in Sanity Studio
- [ ] Test frontend rendering

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Schema | `camelCase.ts` | `twoColContentSection.ts` |
| Component | `pg-PascalCase.tsx` | `pg-2ColContentSection.tsx` |
| Schema name | `camelCase` | `twoColContentSection` |
| Component function | `PascalCase` | `TwoColContentSection` |

---

## Icons Reference

Common icons from `react-icons/fi`:

- `FiColumns` - Multi-column layouts
- `FiList` - Content sections
- `FiImage` - Image components
- `FiVideo` - Video components
- `FiGrid` - Grid layouts
- `FiLayout` - General layouts
- `FiType` - Text components
- `FiBox` - Container components
