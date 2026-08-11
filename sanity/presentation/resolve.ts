import { defineDocuments, defineLocations } from 'sanity/presentation'
import { SITE_CONFIGS, type WebsiteChannel } from '@1sp/site-config'

type PageLocationDocument = {
  title?: string
  slug?: string
  language?: string
  channel?: WebsiteChannel
  isHomepage?: boolean
}

type CaseLocationDocument = {
  title?: string
  slug?: string
  language?: string
  channel?: WebsiteChannel[]
}

const HOME_SLUGS = new Set(['', 'home', 'index'])

function getPublicPath(
  channel: WebsiteChannel,
  language: string | undefined,
  path: string,
) {
  const site = SITE_CONFIGS[channel]
  const locale = language || site.defaultLocale
  const localePrefix = locale === site.defaultLocale ? '' : `/${locale}`
  const normalizedPath = path === '/' ? '' : `/${path.replace(/^\/+/, '')}`

  return `${localePrefix}${normalizedPath}` || '/'
}

function isHomepage(document: PageLocationDocument) {
  return document.isHomepage || HOME_SLUGS.has(document.slug || '')
}

export function createPresentationResolvers(channel: WebsiteChannel) {
  const site = SITE_CONFIGS[channel]
  const pageFilter = `
    _type == "page" &&
    channel == $channel &&
    language == $language
  `
  const homepageFilter = `
    ${pageFilter} &&
    (isHomepage == true || !defined(slug.current) || slug.current in ["", "home", "index"])
  `

  const locations = {
    page: defineLocations({
      select: {
        title: 'title',
        slug: 'slug.current',
        language: 'language',
        channel: 'channel',
        isHomepage: 'isHomepage',
      },
      resolve: (document) => {
        const page = document as PageLocationDocument | null

        if (!page || page.channel !== channel) {
          return { locations: [] }
        }

        const href = isHomepage(page)
          ? getPublicPath(channel, page.language, '/')
          : getPublicPath(channel, page.language, page.slug || '/')

        return {
          locations: [{ title: page.title || page.slug || 'Home', href }],
        }
      },
    }),
    caseStudy: defineLocations({
      select: {
        title: 'title',
        slug: 'slug.current',
        language: 'language',
        channel: 'channel',
      },
      resolve: (document) => {
        const caseStudy = document as CaseLocationDocument | null

        if (!caseStudy?.slug || !caseStudy.channel?.includes(channel)) {
          return { locations: [] }
        }

        return {
          locations: [
            {
              title: caseStudy.title || caseStudy.slug,
              href: getPublicPath(
                channel,
                caseStudy.language,
                `/cases/${caseStudy.slug}`,
              ),
            },
          ],
        }
      },
    }),
  }

  const mainDocuments = defineDocuments([
    {
      route: '/',
      filter: homepageFilter,
      params: {
        channel,
        language: site.defaultLocale,
      },
    },
    {
      route: '/cases/:slug',
      filter: `
        _type == "caseStudy" &&
        $channel in channel &&
        language == $language &&
        slug.current == $slug
      `,
      params: ({ params }) => ({
        channel,
        language: site.defaultLocale,
        slug: params.slug,
      }),
    },
    {
      route: '/:locale/cases/:slug',
      filter: `
        _type == "caseStudy" &&
        $channel in channel &&
        language == $language &&
        slug.current == $slug
      `,
      params: ({ params }) => ({
        channel,
        language: params.locale,
        slug: params.slug,
      }),
    },
    {
      route: '/:segment',
      resolve: ({ params }) => {
        const segment = params.segment
        const isLocaleHomepage = site.locales.some(
          (locale) => locale === segment,
        )

        if (isLocaleHomepage) {
          return {
            filter: homepageFilter,
            params: { channel, language: segment } as Record<string, string>,
          }
        }

        return {
          filter: `${pageFilter} && slug.current == $slug`,
          params: {
            channel,
            language: site.defaultLocale,
            slug: segment,
          } as Record<string, string>,
        }
      },
    },
    {
      route: '/:locale/:slug',
      filter: `${pageFilter} && slug.current == $slug`,
      params: ({ params }) => ({
        channel,
        language: params.locale,
        slug: params.slug,
      }),
    },
  ])

  return { locations, mainDocuments }
}
