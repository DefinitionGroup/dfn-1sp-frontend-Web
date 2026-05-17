# `@1sp/pagebuilder-core`

Shared plumbing for rendering Sanity page-builder content per site.

This package does **not** ship UI. It defines the contract every app's
PageBuilder follows. Each app builds its own registry mapping Sanity
`_type` strings to its own React components.

## Usage

```tsx
// apps/site-1sp/components/PageBuilder.tsx
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

To require every block in a known union to be registered:

```ts
type SupportedBlocks = "hero" | "cta" | "gallery";

const registry = defineRegistry<SupportedBlocks>({
  hero: Hero,
  cta: Cta,
  gallery: Gallery,
  // omitting any of these is a compile error
});
```

## Options

```ts
renderBlocks(content, registry, {
  fallback: UnknownBlock,    // rendered when _type not in registry
  wrapper: ErrorBoundary,    // wraps every block; receives `blockType`
});
```

## Migration from existing PageBuilders

Both `components/PageBuilder.tsx` (root 1SP) and
`apps/flzr-web/components/FlzrPageBuilder.tsx` (FLZR) are currently
hand-written switch statements. They will be migrated to use
`renderBlocks` incrementally — there is no need to convert both at
once. The contract is now available; conversions happen when the
PageBuilders are next touched.
