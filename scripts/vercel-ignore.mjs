#!/usr/bin/env node
/**
 * Vercel "Ignored Build Step" for the multisite monorepo.
 *
 * Usage: node scripts/vercel-ignore.mjs <1sp|msm|flzr>
 *
 * Exit codes (Vercel convention):
 *   1 = changes are relevant, proceed with the build
 *   0 = nothing relevant changed, skip the build
 *
 * Compares against VERCEL_GIT_PREVIOUS_SHA (the commit of the previous
 * deployment attempt on this branch) when Vercel provides it, so pushes
 * with multiple commits and previously-skipped builds are diffed
 * correctly. Falls back to HEAD^. When in doubt (no parent commit, bad
 * args, git error) it always builds.
 */
import { execSync } from "node:child_process";

const BUILD = 1;
const SKIP = 0;

const APP_DIRS = {
  msm: "apps/msm-web",
  flzr: "apps/flzr-web",
};

// Paths that affect every site: any change here rebuilds all 3 projects.
const SHARED_PATHS = [
  "packages/",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  ".npmrc",
  ".nvmrc",
  "scripts/vercel-ignore.mjs",
];

// Repo metadata that never affects a build, for any site.
const IGNORED_EVERYWHERE = [
  "docs/",
  ".claude/",
  ".vscode/",
  ".github/",
  "backups/",
  "EXPORT/",
  "tmp/",
  ".gitignore",
];
const isIgnoredEverywhere = (f) =>
  f.endsWith(".md") ||
  f.endsWith(".MD") ||
  IGNORED_EVERYWHERE.some((p) => (p.endsWith("/") ? f.startsWith(p) : f === p));

const site = process.argv[2];

function decide() {
  if (!site || !["1sp", ...Object.keys(APP_DIRS)].includes(site)) {
    console.error(`vercel-ignore: unknown site "${site}" — building to be safe.`);
    return BUILD;
  }

  const base = process.env.VERCEL_GIT_PREVIOUS_SHA || "HEAD^";
  let files;
  try {
    files = execSync(`git diff --name-only ${base} HEAD`, {
      cwd: new URL("..", import.meta.url).pathname,
      encoding: "utf8",
    })
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    console.error(`vercel-ignore: git diff against ${base} failed — building to be safe.`);
    return BUILD;
  }

  if (files.length === 0) {
    console.error("vercel-ignore: empty diff (forced redeploy?) — building.");
    return BUILD;
  }

  const isShared = (f) => SHARED_PATHS.some((p) => (p.endsWith("/") ? f.startsWith(p) : f === p));
  const inApp = (f, dir) => f.startsWith(dir + "/");

  let relevant;
  if (site === "1sp") {
    // The 1SP site is the repo root: everything is relevant EXCEPT files
    // that live inside another app's directory (and aren't shared).
    relevant = files.filter(
      (f) =>
        isShared(f) ||
        (!isIgnoredEverywhere(f) && !Object.values(APP_DIRS).some((dir) => inApp(f, dir)))
    );
  } else {
    const dir = APP_DIRS[site];
    relevant = files.filter((f) => (isShared(f) || inApp(f, dir)) && !isIgnoredEverywhere(f));
  }

  if (relevant.length > 0) {
    console.error(
      `vercel-ignore[${site}]: ${relevant.length}/${files.length} changed file(s) relevant — building.\n` +
        relevant.slice(0, 20).map((f) => `  ${f}`).join("\n")
    );
    return BUILD;
  }

  console.error(`vercel-ignore[${site}]: no relevant changes in ${files.length} file(s) — skipping build.`);
  return SKIP;
}

process.exit(decide());
