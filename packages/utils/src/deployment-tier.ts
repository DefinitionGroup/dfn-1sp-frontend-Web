const TEST_DEPLOYMENT_TIER = "test";
const TEST_ROBOTS_HEADER_VALUE = "noindex, nofollow, noarchive, nosnippet";
const TEST_SANITY_PROJECT_ID = "wu6i3y0h";
const TEST_SANITY_DATASET = "dev-dataset";
const TEST_SITE_CHANNELS = {
  "1sp": "1spWeb",
  msm: "msmWeb",
  flzr: "flizrWeb",
  renaissance: "renaissanceWeb",
} as const;
type TestSite = keyof typeof TEST_SITE_CHANNELS;

function environmentValue(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

function normalizedEnv(name: string): string | undefined {
  return environmentValue(name)?.toLowerCase();
}

function configuredSiteUrl(): string | undefined {
  return (
    environmentValue("NEXT_PUBLIC_SITE_URL") ||
    environmentValue("SITE_URL") ||
    environmentValue("VERCEL_PROJECT_PRODUCTION_URL") ||
    environmentValue("NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL")
  );
}

function parseSiteUrl(value: string): URL {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return new URL(withProtocol);
}

function assertSafeTestConfiguration(
  tier: string | undefined,
  expectedSite?: TestSite,
): void {
  const isMonorepoTestProject = normalizedEnv("MONOREPO_TEST_PROJECT") === "true";
  const siteUrl = configuredSiteUrl();

  if (isMonorepoTestProject && tier !== TEST_DEPLOYMENT_TIER) {
    throw new Error(
      'MONOREPO_TEST_PROJECT=true requires DEPLOYMENT_TIER=test so public test projects cannot enable production indexing or tracking.',
    );
  }

  if (tier === TEST_DEPLOYMENT_TIER && !isMonorepoTestProject) {
    throw new Error(
      "DEPLOYMENT_TIER=test requires MONOREPO_TEST_PROJECT=true so dataset and site identity checks cannot be bypassed.",
    );
  }

  if (tier === TEST_DEPLOYMENT_TIER && !siteUrl) {
    throw new Error(
      "DEPLOYMENT_TIER=test requires an explicit test site URL or Vercel project production URL for canonical metadata.",
    );
  }

  if (!isMonorepoTestProject) return;

  if (environmentValue("NEXT_PUBLIC_SANITY_PROJECT_ID") !== TEST_SANITY_PROJECT_ID) {
    throw new Error(
      `MONOREPO_TEST_PROJECT=true requires NEXT_PUBLIC_SANITY_PROJECT_ID=${TEST_SANITY_PROJECT_ID}.`,
    );
  }

  if (environmentValue("NEXT_PUBLIC_SANITY_DATASET") !== TEST_SANITY_DATASET) {
    throw new Error(
      `MONOREPO_TEST_PROJECT=true requires NEXT_PUBLIC_SANITY_DATASET=${TEST_SANITY_DATASET}; production is prohibited.`,
    );
  }

  const site = normalizedEnv("MONOREPO_TEST_SITE");
  const expectedChannel =
    site && site in TEST_SITE_CHANNELS
      ? TEST_SITE_CHANNELS[site as keyof typeof TEST_SITE_CHANNELS]
      : undefined;

  if (!expectedChannel) {
    throw new Error(
      "MONOREPO_TEST_PROJECT=true requires MONOREPO_TEST_SITE=1sp, msm, flizr, or renaissance.",
    );
  }

  if (expectedSite && site !== expectedSite) {
    throw new Error(
      `This application requires MONOREPO_TEST_SITE=${expectedSite}; received ${site}.`,
    );
  }

  if (environmentValue("NEXT_PUBLIC_CHANNEL") !== expectedChannel) {
    throw new Error(
      `MONOREPO_TEST_SITE=${site} requires NEXT_PUBLIC_CHANNEL=${expectedChannel}.`,
    );
  }

  let parsedSiteUrl: URL;
  try {
    parsedSiteUrl = parseSiteUrl(siteUrl!);
  } catch {
    throw new Error(
      "MONOREPO_TEST_PROJECT=true requires a valid generated Vercel project URL.",
    );
  }

  if (
    parsedSiteUrl.protocol !== "https:" ||
    !parsedSiteUrl.hostname.endsWith(".vercel.app") ||
    parsedSiteUrl.hostname === "vercel.app" ||
    parsedSiteUrl.port ||
    parsedSiteUrl.username ||
    parsedSiteUrl.password ||
    parsedSiteUrl.pathname !== "/" ||
    parsedSiteUrl.search ||
    parsedSiteUrl.hash
  ) {
    throw new Error(
      "MONOREPO_TEST_PROJECT=true requires an origin-only https://*.vercel.app site URL; production and custom domains are prohibited in this phase.",
    );
  }

  const vercelProductionUrl =
    environmentValue("VERCEL_PROJECT_PRODUCTION_URL") ||
    environmentValue("NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL");

  if (
    vercelProductionUrl &&
    parsedSiteUrl.origin !== parseSiteUrl(vercelProductionUrl).origin
  ) {
    throw new Error(
      "The configured test site URL must exactly match VERCEL_PROJECT_PRODUCTION_URL.",
    );
  }
}

/**
 * Vercel calls the selected branch of every project "production", including
 * the three public monorepo test projects. DEPLOYMENT_TIER distinguishes those
 * test projects from real production without relying on VERCEL_ENV.
 */
export function isTestDeployment(expectedSite?: TestSite): boolean {
  const tier = normalizedEnv("DEPLOYMENT_TIER");
  assertSafeTestConfiguration(tier, expectedSite);
  return tier === TEST_DEPLOYMENT_TIER;
}

export function shouldAllowIndexing(): boolean {
  return !isTestDeployment();
}

export function shouldLoadProductionTracking(): boolean {
  return !isTestDeployment();
}

export function getRobotsMetadata() {
  if (shouldAllowIndexing()) {
    return { index: true, follow: true };
  }

  return {
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
  };
}

export function getRobotsRoute(sitemapUrl: string) {
  if (!shouldAllowIndexing()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/studio/", "/api/"],
      },
    ],
    sitemap: sitemapUrl,
  };
}

export function getDeploymentHeaders(expectedSite?: TestSite) {
  if (!isTestDeployment(expectedSite)) return [];

  return [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-Robots-Tag",
          value: TEST_ROBOTS_HEADER_VALUE,
        },
      ],
    },
  ];
}
