import { defineLive } from 'next-sanity/live'
import { client } from './client'

const token = process.env.SANITY_VIEWER_TOKEN

// Disable live mode in development to avoid rate limits
const isDevelopment = process.env.NODE_ENV === 'development'

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: isDevelopment ? undefined : token,
  browserToken: isDevelopment ? undefined : token,
})
