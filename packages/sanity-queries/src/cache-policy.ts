/**
 * Sanity API budget policy shared by every frontend.
 *
 * Published content stays cached until the Sanity webhook calls
 * `/api/revalidate`. The timer below is only a fallback for a missed webhook:
 * long on real production deployments, which have a webhook, and shorter on
 * beta, test and preview deployments, which do not. A short timer makes every
 * visit after a quiet minute rebuild the page and query Sanity again.
 *
 * `SANITY_REVALIDATE_SECONDS` overrides the fallback per deployment; `false`
 * disables it so only the webhook refreshes content.
 */
type Env = Record<string, string | undefined>;

export const PRODUCTION_FALLBACK_SECONDS = 86_400;
export const NON_PRODUCTION_FALLBACK_SECONDS = 3_600;

/**
 * Beta and test projects are Vercel "production" deployments too, so their
 * DEPLOYMENT_TIER takes precedence over VERCEL_ENV.
 */
function deploymentLane(env: Env): string {
  const tier = env.DEPLOYMENT_TIER?.trim().toLowerCase();
  if (tier) return tier;
  return env.VERCEL_ENV?.trim().toLowerCase() || "local";
}

export function resolveRevalidateSeconds(env: Env = process.env): number | false {
  const override = env.SANITY_REVALIDATE_SECONDS?.trim().toLowerCase();
  if (override === "false") return false;
  // Zero would turn caching off entirely, so only positive values override.
  if (override && /^\d+$/.test(override) && Number(override) > 0) {
    return Number(override);
  }

  return deploymentLane(env) === "production"
    ? PRODUCTION_FALLBACK_SECONDS
    : NON_PRODUCTION_FALLBACK_SECONDS;
}

/** Sanity accepts letters, digits, `_`, `-` and `.`, up to 75 characters. */
export function toRequestTag(value: string | undefined): string | undefined {
  const tag = value?.replace(/[^a-zA-Z0-9_.-]+/g, "-").replace(/^[.-]+|[.-]+$/g, "");
  return tag ? tag.slice(0, 75) : undefined;
}

/**
 * Prefix for Sanity request logs, e.g. `msmWeb.production.pages`, so usage
 * can be attributed to a site and deployment lane.
 */
export function resolveRequestTagPrefix(env: Env = process.env): string {
  const channel = env.NEXT_PUBLIC_CHANNEL?.trim() || "web";
  return toRequestTag(`${channel}.${deploymentLane(env)}`) ?? "web";
}
