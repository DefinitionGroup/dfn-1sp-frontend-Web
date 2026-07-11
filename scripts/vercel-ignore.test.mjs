import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  changedFilesBetween,
  relevantFilesForSite,
} from "./vercel-ignore.mjs";

const sites = ["1sp", "msm", "flzr"];

function decisions(files) {
  return Object.fromEntries(
    sites.map((site) => [site, relevantFilesForSite(site, files).length > 0])
  );
}

test("app-only changes build only their owning project", () => {
  assert.deepEqual(decisions(["apps/flzr-web/app/page.tsx"]), {
    "1sp": false,
    msm: false,
    flzr: true,
  });
  assert.deepEqual(decisions(["apps/msm-web/app/page.tsx"]), {
    "1sp": false,
    msm: true,
    flzr: false,
  });
});

test("1SP-only root app changes do not build nested apps", () => {
  assert.deepEqual(decisions(["app/page.tsx"]), {
    "1sp": true,
    msm: false,
    flzr: false,
  });
});

test("hidden root dependencies build all three projects", () => {
  for (const file of [
    "components/CookiebotBanner.tsx",
    "data/globe.json",
    "hooks/use-example.ts",
    "lib/structured-data.tsx",
    "sanity/env.ts",
    "types/site.ts",
    "utils/example.ts",
    "tsconfig.json",
    "package.json",
  ]) {
    assert.deepEqual(decisions([file]), {
      "1sp": true,
      msm: true,
      flzr: true,
    });
  }
});

test("workspace packages follow the current dependency boundary", () => {
  assert.deepEqual(decisions(["packages/sanity-schema/src/index.ts"]), {
    "1sp": true,
    msm: false,
    flzr: false,
  });
  assert.deepEqual(decisions(["packages/utils/src/site-url.ts"]), {
    "1sp": true,
    msm: true,
    flzr: true,
  });
  assert.deepEqual(decisions(["packages/future-shared/src/index.ts"]), {
    "1sp": true,
    msm: true,
    flzr: true,
  });
});

test("lockfile changes conservatively build all projects", () => {
  assert.deepEqual(decisions(["pnpm-lock.yaml"]), {
    "1sp": true,
    msm: true,
    flzr: true,
  });
});

test("documentation, env templates, and deployment tests build no project", () => {
  assert.deepEqual(
    decisions([
      "deploymentplan.md",
      "docs/VERCEL_DEPLOYMENT.md",
      ".env.example",
      "apps/msm-web/.env.example",
      "scripts/deployment-tier.test.mjs",
      "scripts/vercel-ignore.test.mjs",
    ]),
    {
      "1sp": false,
      msm: false,
      flzr: false,
    }
  );
});

test("a move between app directories builds both owning projects", () => {
  assert.deepEqual(
    decisions([
      "apps/flzr-web/components/Moved.tsx",
      "apps/msm-web/components/Moved.tsx",
    ]),
    {
      "1sp": false,
      msm: true,
      flzr: true,
    }
  );
});

test("a move out of a shared root preserves builds for former consumers", () => {
  // The production diff command uses --no-renames, so both sides of the move
  // are classified instead of Git returning only the destination path.
  assert.deepEqual(
    decisions([
      "components/Moved.tsx",
      "apps/flzr-web/components/Moved.tsx",
    ]),
    {
      "1sp": true,
      msm: true,
      flzr: true,
    }
  );
});

test("the Git diff reports both sides of a detected rename", (t) => {
  const repository = mkdtempSync(join(tmpdir(), "vercel-ignore-test-"));
  t.after(() => rmSync(repository, { recursive: true, force: true }));

  const git = (...args) =>
    execFileSync("git", args, { cwd: repository, stdio: "ignore" });

  git("init", "--quiet");
  git("config", "user.email", "vercel-ignore-test@example.invalid");
  git("config", "user.name", "Vercel Ignore Test");
  mkdirSync(join(repository, "components"));
  mkdirSync(join(repository, "apps", "flzr-web"), { recursive: true });
  writeFileSync(join(repository, "components", "Moved.tsx"), "export {};\n");
  git("add", ".");
  git("commit", "--quiet", "-m", "initial");

  renameSync(
    join(repository, "components", "Moved.tsx"),
    join(repository, "apps", "flzr-web", "Moved.tsx"),
  );
  git("add", "--all");
  git("commit", "--quiet", "-m", "move shared file");

  assert.deepEqual(changedFilesBetween("HEAD^", "HEAD", repository).sort(), [
    "apps/flzr-web/Moved.tsx",
    "components/Moved.tsx",
  ]);
});
