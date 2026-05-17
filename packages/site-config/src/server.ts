import "server-only";
import { cookies } from "next/headers";
import {
  DEFAULT_CHANNEL,
  type Channel,
  getChannelFromEnv,
  isKnownChannel,
} from "./index";

/**
 * Resolve the active channel for the current request.
 *
 * Resolution order (first match wins):
 *  1. `NEXT_PUBLIC_CHANNEL` env var — pins a deployment to a channel.
 *  2. `channel` cookie — set by middleware via host mapping, or manually for dev.
 *  3. `DEFAULT_CHANNEL` — preserves current 1sp-only behavior.
 *
 * Async because Next 15's `cookies()` returns a Promise. Safe to call from
 * server components and route handlers. NOT safe to call from
 * `generateStaticParams` or top-level module code — use `getChannelFromEnv()`
 * for those build-time contexts.
 */
export async function getChannel(): Promise<Channel> {
  const fromEnv = process.env.NEXT_PUBLIC_CHANNEL?.trim();
  if (isKnownChannel(fromEnv)) {
    return fromEnv;
  }

  try {
    const cookieStore = await cookies();
    const fromCookie = cookieStore.get("channel")?.value;
    if (isKnownChannel(fromCookie)) {
      return fromCookie;
    }
  } catch {
    // cookies() throws outside a request scope. Fall through to default.
  }

  return DEFAULT_CHANNEL;
}

export { getChannelFromEnv };
export type { Channel };
