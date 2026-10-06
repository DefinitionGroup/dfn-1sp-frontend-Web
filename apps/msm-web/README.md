# MSM Web

Independent frontend for `msmWeb`, using shared Sanity contracts and its own shell, rendering and visual language. Configured languages: EN and DE; [site-config](../../packages/site-config/src/index.ts) is authoritative.

## Run locally

From the repository root, after configuring this app's environment:

```sh
pnpm --filter @1sp/msm-web exec next dev --turbopack -p 3002
pnpm --filter @1sp/msm-web build
pnpm --filter @1sp/msm-web exec next start -p 3002
```

The start command requires a completed build. Local frontend: `http://localhost:3002`. The shared local Studio runs in the root app at `http://localhost:3000/studio`.

Use this app's `.env.example` as a starting point. Confirm `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `NEXT_PUBLIC_CHANNEL=msmWeb` and `NEXT_PUBLIC_SITE_URL=http://localhost:3002`. Root environment files do not automatically configure this app. Select the dataset for the task explicitly rather than copying an older deployment snapshot.

Run the root Sanity doctor with `--channel msmWeb --language en`, then compare its root environment with the app's loaded environment. See [local debugging](../../docs/local-sanity-debugging.md).

## Cookiebot

MSM owns its Cookiebot domain-group ID in `lib/cookiebot.ts`: `2c30619b-98e9-4d03-945d-095454bad8e5`. Its locale-root layout loads the synchronous automatic blocker before hydration. The existing deployment-tier guard suppresses both the banner and declaration on test/beta deployments. Google Analytics keeps the shared statistics-consent gate and requires `NEXT_PUBLIC_MSM_GOOGLE_MEASUREMENT_ID`.

In Studio, open **MSM → English/German → Pages → Privacy Policy → Content**. The **Cookie declaration / Cookie-Erklärung** Content Section has **Show Cookiebot declaration** enabled. Editors can change its title, reorder or remove the section, or disable the toggle. Use one declaration per page. The frontend executes the declaration script inside this section again after client-side navigation.

Deploy the MSM frontend and shared Studio together so the toggle is available to editors. The Cookiebot account must authorize the public MSM domains for this domain group; the declaration endpoint rejected both `msm.digital` and `www.msm.digital` during the 6 October 2026 check.

The declaration sections were appended to the two existing published privacy pages in `wu6i3y0h/production` (staging), preserving all prior sections and legal text. `scripts/msm-cookiebot-content.mjs` provides the idempotent dry-run/apply workflow. The revision-guarded transaction was `9xwYgO7OlTajAgagjwiSPN`; backups and the receipt are ignored under `EXPORT/msm-cookiebot-2026-10-06/`. Live 1SP's `dev-dataset` was not changed.

Verification on 6 October 2026: MSM and 1SP builds, focused ESLint, schema validation (no errors/warnings), deployment-tier tests (11/11), and diff checks passed. Browser checks confirmed one declaration script on each EN/DE privacy page, no declaration on the disclaimer, and a fresh declaration on client-side return. Desktop/mobile layout checks used a mocked report; real Cookiebot responses rejected localhost and both public MSM hostnames. Full acceptance/rejection/withdrawal and the live cookie report remain unverified until domain authorization. The existing Studio showed the section and Edit/Remove controls but still used the older schema, so the toggle needs the shared Studio release. No hosted deployment was performed.

## Ownership and references

For service editing and page relationships, use the shared [service content guide](../../docs/SERVICE_CONTENT.md) and [consolidation handoff](../../docs/SERVICE_CONTENT_HANDOFF.md). These separate current behavior from proposed migrations.

- App shell: [components/MsmSiteWrapper.tsx](components/MsmSiteWrapper.tsx).
- PageBuilder: [components/MsmPageBuilder.tsx](components/MsmPageBuilder.tsx).
- Global content remains channel/language scoped; pages use unified `content[]`.
- [Documentation index](../../docs/README.md) and [deployment verification](../../docs/DEPLOYMENT.md).
- [Product](PRODUCT.md), [design](DESIGN.md), [MSM context](CONTEXT.md) and [Unit relationship decision](docs/adr/0001-unit-owned-shared-content-attribution.md).
- [Content and design records](../../docs/records/README.md#msm). The app is implemented; earlier scaffold-only notes are historical.
