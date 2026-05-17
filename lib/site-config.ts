/**
 * Site & channel configuration
 * =============================
 *
 * Single source of truth for per-deployment configuration. Designed so that a
 * single codebase can be built into multiple Vercel deployments (one per
 * brand/site) by setting environment variables — without touching code.
 *
 * Resolution order for the active channel:
 *  1. `NEXT_PUBLIC_CHANNEL` env var — pins a deployment to a channel.
 *  2. `channel` cookie — per-request override (legacy + dev).
 *  3. `DEFAULT_CHANNEL` — preserves current 1sp-only behavior on `main`.
 *
 * IMPORTANT: This module is pure (no `next/headers` import) so it can be
 * imported safely from middleware and the edge runtime. Cookie-based
 * resolution lives in `lib/server-channel.ts`.
 */

const DEFAULT_CHANNEL = "1spWeb" as const;

export const KNOWN_CHANNELS = [
  "1spWeb",
  "msmWeb",
  "studioco2Web",
  "flizrWeb",
] as const;

export type Channel = (typeof KNOWN_CHANNELS)[number];

export function isKnownChannel(value: unknown): value is Channel {
  return (
    typeof value === "string" &&
    (KNOWN_CHANNELS as readonly string[]).includes(value)
  );
}

/**
 * Synchronous channel resolution from build-time env only.
 *
 * Use this in contexts that can't await cookies — `generateStaticParams`,
 * top-level module init, middleware. For request-scoped resolution that also
 * respects the channel cookie, use `getChannel()` from `lib/server-channel.ts`.
 */
export function getChannelFromEnv(): Channel {
  const fromEnv = process.env.NEXT_PUBLIC_CHANNEL?.trim();
  return isKnownChannel(fromEnv) ? fromEnv : DEFAULT_CHANNEL;
}

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
const HOST_CHANNEL_MAP: Readonly<Record<string, Channel>> = parseHostChannelMap(
  process.env.NEXT_PUBLIC_HOST_CHANNEL_MAP,
);

function parseHostChannelMap(
  raw: string | undefined,
): Readonly<Record<string, Channel>> {
  if (!raw) return Object.freeze({});
  const out: Record<string, Channel> = {};
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
): Channel | null {
  if (!host) return null;
  const normalized = host.toLowerCase().split(":")[0];
  return HOST_CHANNEL_MAP[normalized] ?? null;
}

export function hasHostChannelMapping(): boolean {
  return Object.keys(HOST_CHANNEL_MAP).length > 0;
}

/**
 * Brand-level configuration. Env-overridable with the current 1SP values as
 * defaults so existing deployments are unchanged. New sites override these in
 * their Vercel project env.
 *
 * For per-site assets that editors should be able to change without a
 * redeploy (logos, contact email, social links), prefer Sanity globals over
 * env vars. These are for build-time concerns only.
 */
export const SITE_BRAND = {
  channel: getChannelFromEnv(),
  name: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "1SP Agency",
  shortName: process.env.NEXT_PUBLIC_SITE_SHORT_NAME?.trim() || "1SP",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
    "1SP is a full-service agency specializing in brand engagement, experiential marketing, creative content, and talent management.",
  defaultTitle:
    process.env.NEXT_PUBLIC_SITE_DEFAULT_TITLE?.trim() ||
    "1SP Agency | People-Powered Brand Engagement",
  gaMeasurementId:
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-JTERFZC7J4",
  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
    "23_GTe316ns0X3IPPdTvXNPW1KYRji5n9GdrvFLBoWE",
  logo: {
    light:
      process.env.NEXT_PUBLIC_LOGO_LIGHT?.trim() ||
      "/ci/1sp-fulllogotype.svg",
    dark:
      process.env.NEXT_PUBLIC_LOGO_DARK?.trim() ||
      "/ci/1sp-fulllogotype-blk.svg",
  },
  logoAlt: process.env.NEXT_PUBLIC_LOGO_ALT?.trim() || "1SP Logo",
} as const;

export { DEFAULT_CHANNEL };
