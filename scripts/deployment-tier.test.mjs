import assert from "node:assert/strict";
import test from "node:test";
import {
  getDeploymentHeaders,
  getRobotsMetadata,
  isTestDeployment,
  shouldLoadProductionTracking,
} from "../packages/utils/src/deployment-tier.ts";

const MANAGED_ENVIRONMENT_KEYS = [
  "DEPLOYMENT_TIER",
  "MONOREPO_TEST_PROJECT",
  "MONOREPO_TEST_SITE",
  "NEXT_PUBLIC_CHANNEL",
  "NEXT_PUBLIC_SANITY_DATASET",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL",
  "SITE_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
];

function withEnvironment(values, assertion) {
  const previous = Object.fromEntries(
    MANAGED_ENVIRONMENT_KEYS.map((key) => [key, process.env[key]]),
  );

  try {
    for (const key of MANAGED_ENVIRONMENT_KEYS) delete process.env[key];
    Object.assign(process.env, values);
    return assertion();
  } finally {
    for (const key of MANAGED_ENVIRONMENT_KEYS) {
      const value = previous[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

const validTestEnvironment = {
  DEPLOYMENT_TIER: "test",
  MONOREPO_TEST_PROJECT: "true",
  MONOREPO_TEST_SITE: "1sp",
  NEXT_PUBLIC_CHANNEL: "1spWeb",
  NEXT_PUBLIC_SANITY_DATASET: "dev-dataset",
  NEXT_PUBLIC_SANITY_PROJECT_ID: "wu6i3y0h",
  NEXT_PUBLIC_SITE_URL: "https://1sp-monorepo-test.vercel.app",
  VERCEL_PROJECT_PRODUCTION_URL: "1sp-monorepo-test.vercel.app",
};

test("a valid dedicated test project disables indexing and production tracking", () => {
  withEnvironment(validTestEnvironment, () => {
    assert.equal(isTestDeployment(), true);
    assert.equal(shouldLoadProductionTracking(), false);
    assert.deepEqual(getRobotsMetadata(), {
      index: false,
      follow: false,
      nocache: true,
      noarchive: true,
      nosnippet: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        noarchive: true,
        nosnippet: true,
      },
    });
    assert.match(
      getDeploymentHeaders()[0].headers[0].value,
      /noindex, nofollow, noarchive, nosnippet/,
    );
  });
});

test("dedicated test projects fail closed on dataset and site identity", () => {
  for (const [key, value, message] of [
    ["NEXT_PUBLIC_SANITY_DATASET", "production", /dev-dataset/],
    ["NEXT_PUBLIC_SANITY_PROJECT_ID", "wrong-project", /wu6i3y0h/],
    ["MONOREPO_TEST_SITE", "msm", /msmWeb/],
    ["NEXT_PUBLIC_CHANNEL", "msmWeb", /1spWeb/],
  ]) {
    withEnvironment({ ...validTestEnvironment, [key]: value }, () => {
      assert.throws(() => isTestDeployment(), message);
    });
  }
});

test("dedicated test projects require the test tier, site identity, and a URL", () => {
  for (const [key, message] of [
    ["DEPLOYMENT_TIER", /DEPLOYMENT_TIER=test/],
    ["MONOREPO_TEST_SITE", /MONOREPO_TEST_SITE/],
    ["NEXT_PUBLIC_SITE_URL", /explicit test site URL/],
  ]) {
    const environment = { ...validTestEnvironment };
    delete environment[key];
    if (key === "NEXT_PUBLIC_SITE_URL") {
      delete environment.VERCEL_PROJECT_PRODUCTION_URL;
    }

    withEnvironment(environment, () => {
      assert.throws(() => isTestDeployment(), message);
    });
  }
});

test("the test tier cannot bypass dedicated-project validation", () => {
  withEnvironment(
    {
      DEPLOYMENT_TIER: "test",
      NEXT_PUBLIC_SANITY_DATASET: "production",
      NEXT_PUBLIC_SITE_URL: "https://www.1sp.agency",
    },
    () => {
      assert.throws(() => isTestDeployment(), /MONOREPO_TEST_PROJECT=true/);
    },
  );
});

test("MSM and FLZR site identities accept only their matching channels", () => {
  for (const [site, channel, hostname] of [
    ["msm", "msmWeb", "msm-monorepo-test.vercel.app"],
    ["flzr", "flizrWeb", "flzr-monorepo-test.vercel.app"],
  ]) {
    withEnvironment(
      {
        ...validTestEnvironment,
        MONOREPO_TEST_SITE: site,
        NEXT_PUBLIC_CHANNEL: channel,
        NEXT_PUBLIC_SITE_URL: `https://${hostname}`,
        VERCEL_PROJECT_PRODUCTION_URL: hostname,
      },
      () => assert.equal(isTestDeployment(), true),
    );
  }
});

test("each application rejects another application's otherwise valid identity", () => {
  withEnvironment(validTestEnvironment, () => {
    assert.throws(
      () => getDeploymentHeaders("msm"),
      /requires MONOREPO_TEST_SITE=msm/,
    );
  });
});

test("dedicated test projects reject production, custom, and mismatched URLs", () => {
  for (const [values, message] of [
    [
      { NEXT_PUBLIC_SITE_URL: "https://www.1sp.agency" },
      /https:\/\/\*\.vercel\.app/,
    ],
    [
      { NEXT_PUBLIC_SITE_URL: "http://1sp-monorepo-test.vercel.app" },
      /https:\/\/\*\.vercel\.app/,
    ],
    [
      { NEXT_PUBLIC_SITE_URL: "https://1sp-monorepo-test.vercel.app/path" },
      /origin-only/,
    ],
    [
      {
        NEXT_PUBLIC_SITE_URL: "https://different-project.vercel.app",
        VERCEL_PROJECT_PRODUCTION_URL: "1sp-monorepo-test.vercel.app",
      },
      /exactly match/,
    ],
  ]) {
    withEnvironment({ ...validTestEnvironment, ...values }, () => {
      assert.throws(() => isTestDeployment(), message);
    });
  }
});

test("ordinary production behavior remains unchanged without the test marker", () => {
  withEnvironment({}, () => {
    assert.equal(isTestDeployment(), false);
    assert.equal(shouldLoadProductionTracking(), true);
    assert.deepEqual(getRobotsMetadata(), { index: true, follow: true });
    assert.deepEqual(getDeploymentHeaders(), []);
  });
});
