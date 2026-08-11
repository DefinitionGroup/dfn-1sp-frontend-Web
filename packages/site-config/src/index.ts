/**
 * Site & channel configuration
 * =============================
 *
 * Single source of truth for per-channel and per-deployment configuration.
 * Designed so that a single codebase can be built into multiple Vercel
 * deployments by setting `NEXT_PUBLIC_CHANNEL` — the deployment then reads
 * its brand, locale, SEO defaults, logo paths, and tracking config from the
 * `SITE_CONFIGS` map below.
 *
 * Resolution order for the active channel:
 *  1. `NEXT_PUBLIC_CHANNEL` env var — pins a deployment to a channel.
 *  2. `channel` cookie — set by middleware via host mapping (multi-host
 *     deployments) or manually for local development.
 *  3. `DEFAULT_CHANNEL` (`1spWeb`) — preserves current 1SP-only behavior.
 *
 * IMPORTANT: This module is pure (no `next/headers`) so it can be imported
 * safely from middleware and the edge runtime. Cookie-based resolution lives
 * in `@1sp/site-config/server`.
 */

// =============================================================================
// TYPES
// =============================================================================

export type WebsiteChannel =
  | "1spWeb"
  | "flizrWeb"
  | "msmWeb"
  | "studioco2Web"
  | "renaissanceWeb";
export type LocaleCode = "en" | "de" | "pl";

export type LanguageDefinition = {
  id: LocaleCode;
  title: string;
};

/** Back-compat alias — prefer `WebsiteChannel` in new code. */
export type Channel = WebsiteChannel;

export type SiteConfig = {
  channel: WebsiteChannel;
  name: string;
  shortName: string;
  defaultLocale: LocaleCode;
  locales: LocaleCode[];
  domains: {
    production?: string;
    preview?: string;
    local?: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    googleSiteVerification?: string;
  };
  tracking: {
    vercelAnalytics: boolean;
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
  };
  logo: {
    light: string;
    dark: string;
    alt: string;
  };
};

// =============================================================================
// PER-CHANNEL CONFIG MAP
// =============================================================================

export const SITE_CONFIGS: Record<WebsiteChannel, SiteConfig> = {
  "1spWeb": {
    channel: "1spWeb",
    name: "1SP Agency",
    shortName: "1SP",
    defaultLocale: "en",
    locales: ["en"],
    domains: {
      local: "http://localhost:3000",
    },
    seo: {
      defaultTitle: "1SP Agency | People-Powered Brand Engagement",
      defaultDescription:
        "1SP is a full-service agency specializing in brand engagement, experiential marketing, creative content, and talent management.",
      googleSiteVerification: "23_GTe316ns0X3IPPdTvXNPW1KYRji5n9GdrvFLBoWE",
    },
    tracking: {
      vercelAnalytics: true,
      googleAnalyticsId: "G-JTERFZC7J4",
    },
    logo: {
      light: "/ci/1sp-fulllogotype.svg",
      dark: "/ci/1sp-fulllogotype-blk.svg",
      alt: "1SP Logo",
    },
  },
  flizrWeb: {
    channel: "flizrWeb",
    name: "FLZR",
    shortName: "FLZR",
    defaultLocale: "en",
    locales: ["en", "de", "pl"],
    domains: {},
    seo: {
      defaultTitle: "FLZR",
      defaultDescription: "FLZR website.",
    },
    tracking: {
      vercelAnalytics: true,
    },
    logo: {
      light: "/ci/1sp-fulllogotype.svg",
      dark: "/ci/1sp-fulllogotype-blk.svg",
      alt: "FLZR Logo",
    },
  },
  msmWeb: {
    channel: "msmWeb",
    name: "MSM",
    shortName: "MSM",
    defaultLocale: "en",
    locales: ["en", "de"],
    domains: {
      production: "https://www.msm.digital",
    },
    seo: {
      // TODO(MSM): replace with final brand-approved title/description copy.
      defaultTitle: "MSM",
      defaultDescription: "MSM website.",
    },
    tracking: {
      vercelAnalytics: true,
    },
    logo: {
      // Single colour cube mark (works on dark). Swap to light/dark variants if produced.
      light: "/ci/msm-logo.svg",
      dark: "/ci/msm-logo.svg",
      alt: "MSM Logo",
    },
  },
  studioco2Web: {
    channel: "studioco2Web",
    name: "Studio CO2",
    shortName: "Studio CO2",
    defaultLocale: "en",
    locales: ["en", "de"],
    domains: {},
    seo: {
      defaultTitle: "Studio CO2",
      defaultDescription: "Studio CO2 website.",
    },
    tracking: {
      vercelAnalytics: true,
    },
    logo: {
      light: "/ci/1sp-fulllogotype.svg",
      dark: "/ci/1sp-fulllogotype-blk.svg",
      alt: "Studio CO2 Logo",
    },
  },
  renaissanceWeb: {
    channel: "renaissanceWeb",
    name: "Renaissance",
    shortName: "Renaissance",
    defaultLocale: "en",
    locales: ["en"],
    domains: {
      preview: "https://renaissance-monorepo-test.vercel.app",
      local: "http://localhost:3003",
    },
    seo: {
      defaultTitle: "Renaissance",
      defaultDescription: "Renaissance website.",
    },
    tracking: {
      vercelAnalytics: true,
    },
    logo: {
      light: "/units/RENAISSANCE/renaissance-horz_logo.svg",
      dark: "/logos/renaissance-horz_logo.svg",
      alt: "Renaissance Logo",
    },
  },
};

// =============================================================================
// LOCALIZATION & TRANSLATION POLICY
// =============================================================================

/**
 * Shared language labels for Studio, translation tooling, and frontend code.
 * Per-channel availability remains defined by SITE_CONFIGS[*].locales.
 */
export const SUPPORTED_LANGUAGES: readonly LanguageDefinition[] = [
  { id: "en", title: "English" },
  { id: "de", title: "German" },
  { id: "pl", title: "Polish" },
];

/** Global reusable content is authored from English. */
export const GLOBAL_CONTENT_SOURCE_LOCALE: LocaleCode = "en";

/** Every locale currently used by at least one website channel. */
export const ALL_PLATFORM_LOCALES: readonly LocaleCode[] =
  SUPPORTED_LANGUAGES.map((language) => language.id).filter((locale) =>
    Object.values(SITE_CONFIGS).some((site) => site.locales.includes(locale)),
  );

/** Website-owned documents use the locale matrix of their assigned channel. */
export const SITE_SPECIFIC_TRANSLATION_TYPES = ["page", "menu"] as const;

/** Reusable documents currently share the global English/German policy. */
export const GLOBAL_TRANSLATION_TYPES = [
  "caseStudy",
  "unit",
  "client",
  "person",
  "services",
  "serviceGroup",
  "oneSpComponentGroup",
] as const;

export const TRANSLATABLE_SCHEMA_TYPES = [
  ...SITE_SPECIFIC_TRANSLATION_TYPES,
  ...GLOBAL_TRANSLATION_TYPES,
] as const;

export type TranslatableSchemaType =
  (typeof TRANSLATABLE_SCHEMA_TYPES)[number];

export function getLanguageDefinition(
  locale: LocaleCode,
): LanguageDefinition {
  const language = SUPPORTED_LANGUAGES.find((item) => item.id === locale);

  if (!language) {
    throw new Error(`Missing language definition for locale '${locale}'.`);
  }

  return language;
}

export function getChannelLanguageDefinitions(
  channel: WebsiteChannel,
): LanguageDefinition[] {
  return SITE_CONFIGS[channel].locales.map(getLanguageDefinition);
}

export function getGlobalLanguageDefinitions(): LanguageDefinition[] {
  return ALL_PLATFORM_LOCALES.map(getLanguageDefinition);
}

/**
 * A global document needs the union of locales from its assigned channels.
 * Unassigned globals are treated as available platform-wide and need all
 * platform locales.
 */
export function getRequiredGlobalDocumentLocales(
  channels: readonly WebsiteChannel[],
): LocaleCode[] {
  const assignedChannels = channels.filter((channel) =>
    WEBSITE_CHANNELS.includes(channel),
  );

  if (assignedChannels.length === 0) {
    return [...ALL_PLATFORM_LOCALES];
  }

  const requiredLocales = new Set(
    assignedChannels.flatMap((channel) => SITE_CONFIGS[channel].locales),
  );

  return ALL_PLATFORM_LOCALES.filter((locale) => requiredLocales.has(locale));
}

// =============================================================================
// CHANNEL CONSTANTS & PREDICATES
// =============================================================================

const DEFAULT_CHANNEL: WebsiteChannel = "1spWeb";

export const WEBSITE_CHANNELS = Object.keys(
  SITE_CONFIGS,
) as WebsiteChannel[];

/** Back-compat alias — same array, different name. Prefer `WEBSITE_CHANNELS`. */
export const KNOWN_CHANNELS = WEBSITE_CHANNELS;

export function isKnownChannel(value: unknown): value is WebsiteChannel {
  return typeof value === "string" && value in SITE_CONFIGS;
}

// =============================================================================
// CHANNEL RESOLUTION
// =============================================================================

/**
 * Synchronous channel resolution from build-time env only.
 *
 * Use this in contexts that can't await cookies — `generateStaticParams`,
 * top-level module init, middleware. For request-scoped resolution that also
 * respects the channel cookie, use `getChannel()` from `@1sp/site-config/server`.
 */
export function getChannelFromEnv(): WebsiteChannel {
  const fromEnv = process.env.NEXT_PUBLIC_CHANNEL?.trim();
  return isKnownChannel(fromEnv) ? fromEnv : DEFAULT_CHANNEL;
}

/**
 * Look up the full SiteConfig for a channel. Falls back to `1spWeb` when an
 * unknown channel is passed in — call sites can rely on always getting a
 * concrete config.
 */
export function getSiteConfig(channel: string | undefined): SiteConfig {
  if (channel && channel in SITE_CONFIGS) {
    return SITE_CONFIGS[channel as WebsiteChannel];
  }
  return SITE_CONFIGS[DEFAULT_CHANNEL];
}

// =============================================================================
// HOST → CHANNEL MAPPING (for multi-host deployments)
// =============================================================================

/**
 * Per-deployment host → channel mapping.
 *
 * Empty by default — middleware becomes a no-op pass-through. Populate by
 * setting `NEXT_PUBLIC_HOST_CHANNEL_MAP` to a comma-separated list:
 *
 *   NEXT_PUBLIC_HOST_CHANNEL_MAP="msm.com:msmWeb,studioco2.com:studioco2Web"
 *
 * Hosts match case-insensitively; ports are stripped before lookup. Only
 * needed when one deployment serves multiple hosts. Single-channel
 * deployments should pin via `NEXT_PUBLIC_CHANNEL` and leave this empty.
 */
const HOST_CHANNEL_MAP: Readonly<Record<string, WebsiteChannel>> =
  parseHostChannelMap(process.env.NEXT_PUBLIC_HOST_CHANNEL_MAP);

function parseHostChannelMap(
  raw: string | undefined,
): Readonly<Record<string, WebsiteChannel>> {
  if (!raw) return Object.freeze({});
  const out: Record<string, WebsiteChannel> = {};
  for (const entry of raw.split(",")) {
    const [hostRaw, channelRaw] = entry.split(":");
    const host = hostRaw?.trim().toLowerCase();
    const channel = channelRaw?.trim();
    if (host && isKnownChannel(channel)) {
      out[host] = channel;
    }
  }
  return Object.freeze(out);
}

export function resolveChannelFromHost(
  host: string | null | undefined,
): WebsiteChannel | null {
  if (!host) return null;
  const normalized = host.toLowerCase().split(":")[0];
  return HOST_CHANNEL_MAP[normalized] ?? null;
}

export function hasHostChannelMapping(): boolean {
  return Object.keys(HOST_CHANNEL_MAP).length > 0;
}

// =============================================================================
// ACTIVE-DEPLOYMENT BRAND (convenience)
// =============================================================================

/**
 * Convenience constant for "this deployment's brand config." Resolved at
 * build time from `NEXT_PUBLIC_CHANNEL`. Prefer `getSiteConfig(channel)` for
 * request-scoped lookups (e.g. when channel comes from a cookie or query).
 */
export const SITE_BRAND: SiteConfig = getSiteConfig(getChannelFromEnv());

export { DEFAULT_CHANNEL };
