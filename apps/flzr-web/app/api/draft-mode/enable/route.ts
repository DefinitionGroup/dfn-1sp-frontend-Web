import { client } from '@1sp/sanity-queries/client'
import { requireViewerToken } from '@1sp/sanity-queries/token'
import { defineEnableDraftMode } from 'next-sanity/draft-mode'

export const { GET } = defineEnableDraftMode({
    client: client.withConfig({ token: requireViewerToken() }),
})
