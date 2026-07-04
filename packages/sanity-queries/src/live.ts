import { defineLive } from 'next-sanity/live'
import { client } from './client'

const token = process.env.SANITY_VIEWER_TOKEN

// next-sanity v13 removed `fetchOptions` from defineLive — per-fetch
// revalidation is handled by live events + tags. The TTL fallback lives on
// the pages themselves (`export const revalidate = 60`).
export const { SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
})
