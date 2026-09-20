# 1SP multisite frontend

One pnpm workspace powers the root 1SP website and the FLZR, MSM and Renaissance apps, with shared Sanity contracts and site-owned presentation.

Start with the [documentation index](docs/README.md). Repository rules live in [AGENTS.md](AGENTS.md).

## Local development

Use the Node version in `.nvmrc` and pnpm from `package.json`. Install with `pnpm install --frozen-lockfile`. Each app needs its own environment; root environment files do not automatically configure nested apps.

| Surface | Command from repository root | Local URL |
| --- | --- | --- |
| 1SP + embedded Studio | `pnpm dev` | `http://localhost:3000`, Studio at `/studio` |
| FLZR | `pnpm --filter @1sp/flzr-web exec next dev --turbopack -p 3001` | `http://localhost:3001` |
| MSM | `pnpm --filter @1sp/msm-web exec next dev --turbopack -p 3002` | `http://localhost:3002` |
| Renaissance | `pnpm dev:renaissance` | `http://localhost:3003` |

Confirm project, dataset, API version, channel and language before diagnosing missing content or making CMS changes. See [local Sanity debugging](docs/local-sanity-debugging.md). A dataset named `production` and a public frontend deployment are separate concerns; verify both explicitly.

## Build and verification

- 1SP/Studio: `pnpm build`
- FLZR: `pnpm build:flzr`
- MSM: `pnpm --filter @1sp/msm-web build`
- Renaissance: `pnpm build:renaissance`
- Dataset capacity: `pnpm doctor:sanity-capacity`

Use the relevant `test:*` scripts in [package.json](package.json) and focused tests under `scripts/`. A shared change needs verification in the affected apps as well as existing 1SP behavior.

## Where to work

- [Architecture and ownership](docs/ARCHITECTURE.md)
- [Studio filtering tutorial](<docs/studiocustomize -tut.md>)
- [Adding PageBuilder blocks](docs/PAGEBUILDER_COMPONENT_GUIDE.md)
- [Deployment verification](docs/DEPLOYMENT.md)
- [Deferred data structure recipe](docs/SANITY_DATA_STRUCTURE_RECIPE.md)

Component debug badges are off by default. Set `NEXT_PUBLIC_DEBUG_BADGES=true` in the relevant local environment and restart to enable them. Use `pnpm dev:diag` for the root CSS diagnostic mode.
