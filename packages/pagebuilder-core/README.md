# `@1sp/pagebuilder-core`

Shared plumbing for rendering Sanity page-builder content per site.

This package does **not** ship UI. It provides optional typed registry and rendering helpers. The current root, FLZR, MSM and Renaissance PageBuilders still dispatch through their own implementations; they do not call `renderBlocks`. See the [current entry points](../../docs/PAGEBUILDER_COMPONENT_GUIDE.md#renderer-entry-points).

## Usage

```tsx
// Illustrative component; not an existing app path.
import { renderBlocks, defineRegistry } from "@1sp/pagebuilder-core";
import Hero from "./pagebuilder/Hero";
import Cta from "./pagebuilder/Cta";

const registry = defineRegistry({
  heroShowTime: Hero,
  ctaIntertitle: Cta,
});

export function PageBuilder({ content }: { content: Block[] }) {
  return <>{renderBlocks(content, registry)}</>;
}
```

## Exhaustiveness

By default the registry is permissive — apps can register a subset of
the schema's blocks.

To require every block in a known union to be registered, explicitly validate the object with `satisfies Required<BlockRegistry<...>>`. The current generic argument to `defineRegistry` alone does not reject every incomplete registry:

```ts
import type { BlockRegistry } from "@1sp/pagebuilder-core";

type SupportedBlocks = "hero" | "cta" | "gallery";

const registry = {
  hero: Hero,
  cta: Cta,
  gallery: Gallery,
  // omitting any of these is a compile error
} satisfies Required<BlockRegistry<SupportedBlocks>>;
```

## Options

```ts
renderBlocks(content, registry, {
  fallback: UnknownBlock,    // rendered when _type not in registry
  wrapper: ErrorBoundary,    // wraps every block; receives `blockType`
});
```

## Adoption status

The helpers are available for deliberate adoption. Converting an existing builder is a separate implementation decision, not a required side effect of editing a block. Preserve server/client boundaries, projections, unknown-block handling and app-specific rendering if a conversion is proposed.
