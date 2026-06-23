/**
 * PageBuilder core contract
 * ==========================
 *
 * The shared plumbing that lets each app render Sanity page-builder
 * content with its own component implementations.
 *
 * Three pieces:
 *
 * 1. `BlockRegistry<TBlockType>` — a typed map from Sanity `_type` strings
 *    to React components. Each app builds its own registry.
 *
 * 2. `renderBlocks(content, registry, options)` — iterates a Sanity
 *    `content[]` array and renders each block via the registry. Unknown
 *    blocks fall through silently (or render a fallback if provided).
 *
 * 3. `defineRegistry()` — convenience helper to define a registry with
 *    type inference and optional exhaustiveness checks.
 *
 * The point of this package is to ensure both apps consume the *same
 * data contract* (block types from `@1sp/sanity-types`) while remaining
 * free to render any block however they like. There is no shared UI here
 * — only the wiring.
 *
 * @example
 * ```tsx
 * // apps/site-1sp/components/PageBuilder.tsx
 * import { renderBlocks, defineRegistry } from "@1sp/pagebuilder-core";
 * import Hero from "./pagebuilder/Hero";
 * import Cta from "./pagebuilder/Cta";
 *
 * const registry = defineRegistry({
 *   heroShowTime: Hero,
 *   ctaIntertitle: Cta,
 *   // ...
 * });
 *
 * export function PageBuilder({ content }) {
 *   return <>{renderBlocks(content, registry)}</>;
 * }
 * ```
 */

import React, { type ComponentType, type ReactElement, type ReactNode } from "react";

/**
 * A block from Sanity. Carries an `_type` discriminator and an optional
 * `_key` for stable React keys.
 */
export type SanityBlock = {
  _type: string;
  _key?: string;
} & Record<string, unknown>;

/**
 * Map of block `_type` → React component. Each component receives the
 * matching block as its `data` prop.
 *
 * The default is a permissive `Partial` so apps can register a subset of
 * the schema's blocks. For an exhaustiveness check, use
 * `satisfies Required<BlockRegistry<KnownBlocks>>` at the call site, or
 * pass `{ exhaustive: true }` to `defineRegistry`.
 */
export type BlockRegistry<TBlockType extends string = string> = Partial<
  Record<TBlockType, ComponentType<{ data: any }>>
>;

/**
 * Options for `renderBlocks`.
 */
export interface RenderBlocksOptions {
  /**
   * Component rendered when a block's `_type` is not in the registry.
   * Receives the unknown block as `block`. Default: render nothing.
   *
   * Useful during development to surface missing registrations.
   */
  fallback?: ComponentType<{ block: SanityBlock }>;

  /**
   * Component wrapped around every rendered block. Use for error
   * boundaries, suspense fallbacks, or DOM instrumentation.
   *
   * Receives `children` and the block's `_type`.
   */
  wrapper?: ComponentType<{ children: ReactNode; blockType: string }>;
}

/**
 * Render an array of Sanity blocks using the provided registry.
 */
export function renderBlocks(
  content: SanityBlock[] | null | undefined,
  registry: BlockRegistry,
  options: RenderBlocksOptions = {},
): ReactElement[] {
  if (!content || content.length === 0) return [];

  const { fallback: Fallback, wrapper: Wrapper } = options;

  return content.map((block, index) => {
    const Component = registry[block._type];
    const key = block._key ?? `${block._type}-${index}`;

    let element: ReactNode = null;
    if (Component) {
      element = React.createElement(Component, { data: block });
    } else if (Fallback) {
      element = React.createElement(Fallback, { block });
    }

    if (Wrapper && element) {
      element = React.createElement(Wrapper, {
        blockType: block._type,
        children: element,
      });
    }

    return React.createElement(React.Fragment, { key, children: element }) as ReactElement;
  });
}

/**
 * Define a typed block registry.
 *
 * - Permissive form: `defineRegistry({ hero: HeroComponent })`
 *   Registry can be a subset of the schema's blocks.
 *
 * - Exhaustive form: pass a type parameter for the known block-type
 *   union, and TypeScript will require every value to be registered:
 *   ```ts
 *   type Blocks = "hero" | "cta" | "gallery";
 *   defineRegistry<Blocks>({ hero: H, cta: C, gallery: G });
 *   ```
 */
export function defineRegistry<TBlockType extends string = string>(
  registry: TBlockType extends string
    ? Record<TBlockType, ComponentType<{ data: any }>>
    : BlockRegistry,
): BlockRegistry<TBlockType> {
  return registry as BlockRegistry<TBlockType>;
}
