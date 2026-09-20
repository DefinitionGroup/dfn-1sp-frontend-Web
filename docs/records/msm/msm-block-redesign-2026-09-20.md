# MSM block redesign — 2026-09-20

Status: implemented locally; no CMS mutations or deployment. The preceding documentation work was committed separately as `a2c249f93` before this redesign.

## Scope

Applied apple-design interaction principles and Impeccable craft guidance within MSM's incumbent angular identity. Retained Aspekta Medium, mosaic logo/buttons, homepage hero, all editorial strings, page order, destinations and media assignments.

- `contentSection`: readable light text, 68ch measure, asymmetric heading/body layout, consistent rich-text hierarchy and links.
- `servicesHeroWithBadge`: bottom-aligned full-bleed media composition, compact responsive hierarchy, existing badge in normal layout flow.
- `intertitleCTA`: compact text/action band using the existing mosaic button.
- `casesIntro`: clearer primary/supporting hierarchy and shared container rhythm.
- `msmServiceDirectory`: direct linked rows with imagery, description and arrow; existing Unit and SelectionFrame grids retain their design.
- Contact form: dark angular fields, readable input/placeholder text, cyan focus/action, header clearance and status semantics. Existing fields, labels and API payload preserved.
- Motion: visible editorial content with a small non-bouncing spring settle; existing stagger helpers skip reduced-motion delays. Service media retains a stable SSR/client tree, immediate contrast scrim and pauses video/parallax for reduced motion.

The common presentation lives in `apps/msm-web/components/ui/EditorialBlocks.module.css` and `EditorialReveal.tsx`. No shared package or other website implementation changed.

## Verification

- `pnpm doctor:sanity --channel msmWeb --language en`: project `wu6i3y0h`, production, API `2025-09-16`; published homepage and scoped pages present.
- `pnpm --filter @1sp/msm-web exec tsc --noEmit`: passed.
- Targeted ESLint for all changed TSX files: passed.
- `pnpm --filter @1sp/msm-web build`: passed after the correction batch.
- `git diff --check`: passed.
- Browser: service detail, service directory, Contact and homepage introduction at 1440 × 1000 and 390 × 844; no horizontal overflow on inspected routes. Navigation from service detail to Services verified.
- Initial inspection found a conditional-video hydration mismatch and insufficient mobile contact header clearance. Both corrected; subsequent service navigation added no new hydration errors.
- Independent finish review opened nine block viewport captures and returned **ship** with no material findings at that scope.
- Impeccable detector: advisory type-ramp/error-color documentation findings; no blocking design findings. Intentional roles documented in the MSM design system.

Evidence: [block screenshots](../../../apps/msm-web/.impeccable/review/block-redesign). These are viewport crops, not complete page screenshots or certification of every CMS combination.

Limits: no real contact submission; no external delivery test; no OS reduced-motion preference toggle or full keyboard audit. Reduced-motion behavior was reviewed in source. Existing Cookiebot localhost authorization warnings remain outside this design change. This is a scoped block redesign, not a complete redesign of all case, people, Unit and legacy block variants.
