# Renaissance Design System — Working Guide

This folder turns the visual direction in [../DESIGN.md](../DESIGN.md) into a repeatable product workflow. It is not a new component library and it does not replace the existing `RenaissancePageBuilder`. Runtime components and CSS tokens remain the implementation source of truth; these documents define which patterns are approved, how they compose and what must be verified before release.

## Sources of truth

1. **Product boundary:** [../PRODUCT.md](../PRODUCT.md)
2. **Visual foundations and tokens:** [../DESIGN.md](../DESIGN.md)
3. **Approved components and Pagebuilder contracts:** [COMPONENTS.md](./COMPONENTS.md)
4. **Release acceptance criteria:** [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md)
5. **Current evidence and priorities:** [../DESIGN-AUDIT.md](../DESIGN-AUDIT.md)

When code and documentation disagree, do not silently choose one. Verify the current browser result, update the implementation or record a design decision, then update the affected document in the same change.

## Current radius contract

As of 2026-08-12, Renaissance uses a compact 2–6px radius system: 2px indicators, 4px controls/cards and 6px large media/statement shells. Rectangular controls never use pill geometry. True circles are limited to intrinsically circular status or decorative geometry. The semantic values live in `app/globals.css`; the role definitions and decision record live in `DESIGN.md`.

## How to build a Renaissance page

1. Start with the page's single user job and one primary conversion.
2. Select blocks from the **Core** tier in `COMPONENTS.md` before considering a conditional block.
3. Use semantic roles from `DESIGN.md`; do not introduce raw brand colors, one-off radii or a new display font.
4. Give every major section one purpose, one semantic heading and at most one short support statement.
5. Use real game, people or place imagery as the visual anchor. Decorative diagonals remain supporting atmosphere.
6. Keep the first viewport to brand, headline, short support, CTA group and one dominant media plane.
7. Add `navPointName` only when the destination exists in the initial document shell and remains stable across locales.
8. Verify the complete page with `RELEASE-CHECKLIST.md` before publishing.

## Change protocol

### New token

A new token is allowed only when an existing semantic role cannot express a repeated need in at least three places. Add the role to `DESIGN.md`, map it once in `globals.css`, migrate call sites, then add a contrast or visual-regression check where relevant.

### New variant

A variant must represent a different context or behavior, not a one-off color. Document its purpose, allowed surfaces, hover/focus/disabled/reduced-motion states and CMS label before exposing it to editors.

### New Pagebuilder block

Prefer adapting an existing registered block. If a new block is unavoidable, define its job, content limits, heading behavior, empty/failure state, responsive layout, accessibility contract and analytics event before implementation.

### Exception

An exception must name the page, reason, owner and expiration condition. “It looked better in this section” is not a system exception.

## Ownership

- **Design:** foundations, visual roles, component intent, responsive behavior and exception review.
- **Frontend:** semantic implementation, state coverage, performance, accessibility and visual regression.
- **Content:** factual accuracy, content limits, alt text, link intent and approved metrics.
- **CMS:** allowed block lists, validation, preview parity and channel/language scoping.

## Definition of system maturity

The system is working when an editor can compose a new Renaissance page from approved blocks without introducing a new visual language, and the resulting page passes the same accessibility, responsive, performance and content checks as the homepage.
