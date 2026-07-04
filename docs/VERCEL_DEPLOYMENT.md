# Vercel Multi-Project Deployment

One GitHub repo (`DefinitionGroup/dfn-1sp-frontend-Web`) drives **three independent Vercel projects**. Every push builds only the site(s) whose files actually changed.

## How it works

Each project points at the same repo but has a different **Root Directory**. Path filtering is done by [`scripts/vercel-ignore.mjs`](../scripts/vercel-ignore.mjs), wired in as `ignoreCommand` in each site's `vercel.json` (repo config overrides dashboard settings, so nothing needs to be pasted into the dashboard for this).

| Project | Root Directory | Production branch | `multisite/monorepo` deploys as | Builds when the push touches… |
|---|---|---|---|---|
| `dfn-1sp-frontend-web` (1SP, existing) | *(repo root)* | `main` (unchanged!) | **Preview** | anything **outside** `apps/`, or shared paths |
| `msm-web` (new) | `apps/msm-web` | `multisite/monorepo` | Production | `apps/msm-web/**`, or shared paths |
| `flzr-web` (new) | `apps/flzr-web` | `multisite/monorepo` | Production | `apps/flzr-web/**`, or shared paths |

The 1SP live site keeps deploying exclusively from `main`, exactly as today — nothing on `main` changes (it has no `apps/`, and its `vercel.json` there is untouched). Pushes to `multisite/monorepo` give 1SP a preview deployment at a stable branch URL (`dfn-1sp-frontend-web-git-multisite-monorepo-<team>.vercel.app`). The ignore script runs on preview builds too, so msm/flzr-only commits don't even build a 1SP preview.

**Shared paths** (rebuild all three): `packages/**`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`, `.nvmrc`, the ignore script itself.

**Never trigger any build**: `docs/`, `*.md`, `.claude/`, `.vscode/`, `.github/`, `backups/`, `EXPORT/`, `tmp/`, `.gitignore`.

The script diffs against `VERCEL_GIT_PREVIOUS_SHA` (Vercel's last deployment attempt on that branch) so multi-commit pushes are handled correctly, and it **fails open**: any git error, missing parent commit, or bad argument results in a build, never a silent skip.

A skipped build shows up in the Vercel dashboard as **"Canceled — Ignored Build Step"**. That is the expected state, not an error.

## Dashboard checklist

### A. Existing project `dfn-1sp-frontend-web` (1SP)

1. **Production Branch: do NOT change it.** It stays `main`; the live site is untouched. `multisite/monorepo` deploys as a preview automatically.
2. **Settings → Environment Variables**: confirm the variables the app needs are enabled for the **Preview** environment (not just Production), otherwise the branch preview builds without them.
3. **Settings → Build & Development Settings**: leave "Ignored Build Step" on **Automatic** — the repo's `vercel.json` `ignoreCommand` (on `multisite/monorepo`) takes precedence for that branch. `main` has no `ignoreCommand`, so `main` behaves exactly as before.
4. **Settings → General → Node.js Version**: `22.x` (matches `.nvmrc`).
5. Nothing else changes — Root Directory stays empty (repo root).

### B. New project `msm-web`

1. Vercel Dashboard → **Add New… → Project** → import `DefinitionGroup/dfn-1sp-frontend-Web` (yes, the same repo again).
2. Project name: `msm-web`.
3. **Root Directory**: `apps/msm-web`. Make sure **"Include source files outside of the Root Directory in the Build Step"** is **enabled** (it must see `packages/` and the root lockfile).
4. Framework preset: Next.js (auto-detected; install/build/ignore commands come from `apps/msm-web/vercel.json`).
5. **Environment Variables** — per `apps/msm-web/.env.example`:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` = `wu6i3y0h`
   - `NEXT_PUBLIC_SANITY_DATASET` = `production`
   - `NEXT_PUBLIC_SANITY_API_VERSION` = `2025-09-16`
   - `NEXT_PUBLIC_CHANNEL` = `msmWeb`
   - `NEXT_PUBLIC_SITE_URL` = production URL of the MSM site
   - plus any server-side secrets the app uses (Sanity tokens, revalidate secret) — copy values from the 1SP project.
6. **Settings → Git → Production Branch**: `multisite/monorepo`.
7. **Settings → General → Node.js Version**: `22.x`.
8. Deploy once manually to verify, then assign the real domain.

### C. New project `flzr-web`

Same as B with: name `flzr-web`, Root Directory `apps/flzr-web`, `NEXT_PUBLIC_CHANNEL` = `flizrWeb`, env per `apps/flzr-web/.env.example`.

## Verifying the wiring

Test the filter locally against any commit range:

```bash
node scripts/vercel-ignore.mjs msm            # diffs HEAD^..HEAD
VERCEL_GIT_PREVIOUS_SHA=HEAD~4 node scripts/vercel-ignore.mjs 1sp
echo $?   # 1 = would build, 0 = would skip
```

Then push three probe commits to `multisite/monorepo` and watch the dashboard:

1. Touch a file in `apps/msm-web/` → only `msm-web` builds (production); the other two show "Canceled — Ignored Build Step".
2. Touch a root file (e.g. `components/…`) → only `dfn-1sp-frontend-web` builds, as a **preview** on the branch URL. The live 1SP domain is not affected.
3. Touch a file in `packages/` → all three build (msm/flzr to production, 1SP as preview).

## Gotchas

- `git push` of several commits: Vercel builds only the head commit, and the script diffs the **whole push range** via `VERCEL_GIT_PREVIOUS_SHA` — an msm change buried in commit 2 of 3 still triggers `msm-web`.
- 1SP goes to production from this branch only when you decide to: merge `multisite/monorepo` → `main`. At that moment also flip msm-web/flzr-web Production Branch to `main` so all three share one production branch.
- Branch previews may be protected by Vercel Deployment Protection (SSO auth) depending on team settings — if the preview URL asks for login and you want it public, disable protection for previews in project settings.
- If you add a fourth site later: add its dir to `APP_DIRS` in `scripts/vercel-ignore.mjs`, give it a `vercel.json` with an `ignoreCommand`, and create the Vercel project with the matching Root Directory.
- The root project's ignore rule is inverted (build on anything *not* in `apps/`), so a new top-level directory automatically counts as 1SP-relevant — safe by default.
