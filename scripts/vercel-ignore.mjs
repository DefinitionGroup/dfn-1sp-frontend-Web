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
 * Compares against VERCEL_GIT_PREVIOUS_SHA (the commit of the last successful
 * deployment for this project and branch) when Vercel provides it, so pushes
 * with multiple commits are diffed correctly. The first allowed Git deployment
 * always builds. Local runs fall back to HEAD^. When in doubt (bad args or Git
 * error) an allowed branch builds.
 */
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const BUILD = 1;
const SKIP = 0;
const TEST_BRANCH = "multisite/test";
const REPOSITORY_ROOT = fileURLToPath(new URL("..", import.meta.url));

const APP_DIRS = {
  msm: "apps/msm-web",
  flzr: "apps/flzr-web",
};

// Paths that affect every site. The nested apps currently import/compile
// several root directories directly, so those directories are shared inputs
// even though they are not represented in the pnpm workspace dependency graph.
const SHARED_PATHS = [
  "components/",
  "data/",
  "hooks/",
  "lib/",
  "sanity/",
  "types/",
  "utils/",
  "packages/pagebuilder-core/",
  "packages/sanity-queries/",
  "packages/sanity-types/",
  "packages/site-config/",
  "packages/utils/",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.json",
  ".npmrc",
  ".nvmrc",
  "scripts/vercel-ignore.mjs",
];

// The root 1SP app uses this package, but MSM and FLZR do not.
const ONE_SP_ONLY_PATHS = ["packages/sanity-schema/"];

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
const isEnvironmentTemplate = (file) => {
  const basename = file.slice(file.lastIndexOf("/") + 1);
  return basename.startsWith(".env") && basename.endsWith(".example");
};
const isDeploymentTestFile = (file) =>
  file.startsWith("scripts/") && file.endsWith(".test.mjs");
const isIgnoredEverywhere = (file) =>
  file.endsWith(".md") ||
  file.endsWith(".MD") ||
  isEnvironmentTemplate(file) ||
  isDeploymentTestFile(file) ||
  IGNORED_EVERYWHERE.some((path) =>
    path.endsWith("/") ? file.startsWith(path) : file === path
  );

const site = process.argv[2];

const matchesPath = (file, path) =>
  path.endsWith("/") ? file.startsWith(path) : file === path;

const isShared = (file) =>
  SHARED_PATHS.some((path) => matchesPath(file, path)) ||
  (file.startsWith("packages/") &&
    !ONE_SP_ONLY_PATHS.some((path) => matchesPath(file, path)));

const inApp = (file, directory) => file.startsWith(directory + "/");

export function relevantFilesForSite(targetSite, files) {
  if (targetSite === "1sp") {
    // The 1SP site is the repo root: everything is relevant EXCEPT files
    // that live inside another app's directory (and aren't shared).
    return files.filter(
      (file) =>
        isShared(file) ||
        (!isIgnoredEverywhere(file) &&
          !Object.values(APP_DIRS).some((directory) => inApp(file, directory)))
    );
  }

  const directory = APP_DIRS[targetSite];
  if (!directory) return files;

  return files.filter(
    (file) => (isShared(file) || inApp(file, directory)) && !isIgnoredEverywhere(file)
  );
}

export function changedFilesBetween(base, head = "HEAD", cwd = REPOSITORY_ROOT) {
  // Disable rename detection so Git emits both the removed and added paths.
  // Otherwise a move from a shared root directory into one app can be shown
  // only as the destination path and former consumers could be skipped.
  // NUL delimiters also preserve every valid Git filename.
  return execFileSync(
    "git",
    ["diff", "--name-only", "--no-renames", "-z", base, head],
    {
      cwd,
      encoding: "utf8",
    },
  )
    .split("\0")
    .filter(Boolean);
}

function decide() {
  const gitRef = process.env.VERCEL_GIT_COMMIT_REF?.trim();
  const isMonorepoTestProject =
    process.env.MONOREPO_TEST_PROJECT?.trim().toLowerCase() === "true";

  // The same Git repository is connected to both the existing projects and
  // three dedicated monorepo test projects. Keep those deployment lanes
  // isolated without changing the existing projects' normal preview rules:
  //
  // - test projects only build their Production Branch (`multisite/test`)
  // - existing projects never build the dedicated test branch
  //
  // MONOREPO_TEST_PROJECT must be set for both Production and Preview in the
  // three new projects. VERCEL_GIT_COMMIT_REF is a Vercel system variable.
  if (isMonorepoTestProject && gitRef !== TEST_BRANCH) {
    console.error(
      `vercel-ignore[${site}]: dedicated test project ignores branch ` +
        `"${gitRef || "(unset)"}" — only "${TEST_BRANCH}" may build.`
    );
    return SKIP;
  }

  if (!isMonorepoTestProject && gitRef === TEST_BRANCH) {
    console.error(
      `vercel-ignore[${site}]: existing project ignores dedicated test branch "${TEST_BRANCH}".`
    );
    return SKIP;
  }

  if (!site || !["1sp", ...Object.keys(APP_DIRS)].includes(site)) {
    console.error(`vercel-ignore: unknown site "${site}" — building to be safe.`);
    return BUILD;
  }

  const previousSha = process.env.VERCEL_GIT_PREVIOUS_SHA?.trim();
  if (gitRef && !previousSha) {
    console.error(
      `vercel-ignore[${site}]: no previous successful deployment for branch "${gitRef}" — building initial deployment.`
    );
    return BUILD;
  }

  const base = previousSha || "HEAD^";
  let files;
  try {
    files = changedFilesBetween(base);
  } catch {
    console.error(`vercel-ignore: git diff against ${base} failed — building to be safe.`);
    return BUILD;
  }

  if (files.length === 0) {
    console.error("vercel-ignore: empty diff (forced redeploy?) — building.");
    return BUILD;
  }

  const relevant = relevantFilesForSite(site, files);

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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(decide());
}
