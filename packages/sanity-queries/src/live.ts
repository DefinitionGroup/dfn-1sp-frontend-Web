import { defineLive } from 'next-sanity/live'
import { client } from './client'
import { viewerToken } from './token'

// next-sanity v13 removed `fetchOptions` from defineLive — per-fetch
// revalidation is handled by live events + tags. The TTL fallback lives in
// `cache-policy.ts` and is applied by `sanityFetch`.
export const { SanityLive } = defineLive({
  client,
  serverToken: viewerToken,
  browserToken: viewerToken,
})
