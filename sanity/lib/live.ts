import { defineLive } from 'next-sanity/live'
import { draftMode } from 'next/headers'
import { client } from './client'

const token = process.env.SANITY_VIEWER_TOKEN

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: async () => {
    const { isEnabled } = await draftMode()
    return isEnabled ? token : undefined
  },
})
