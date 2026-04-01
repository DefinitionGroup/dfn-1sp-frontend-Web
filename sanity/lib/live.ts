import { defineLive } from 'next-sanity/live'
import { client } from './client'

const token = process.env.SANITY_VIEWER_TOKEN

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
  fetchOptions: {
    // Keep tag-based invalidation, but also give production a TTL fallback so
    // referenced Sanity content recovers even if a webhook/manual revalidate is missed.
    revalidate: 60,
  },
})
