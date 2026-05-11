export type WebsiteChannel = '1spWeb' | 'flizrWeb' | 'msmWeb' | 'studioco2Web'
export type LocaleCode = 'en' | 'de' | 'pl'

export type SiteConfig = {
  channel: WebsiteChannel
  name: string
  shortName: string
  defaultLocale: LocaleCode
  locales: LocaleCode[]
  domains: {
    production?: string
    preview?: string
    local?: string
  }
  seo: {
    defaultTitle: string
    defaultDescription: string
  }
  tracking: {
    vercelAnalytics: boolean
    googleAnalyticsId?: string
    googleTagManagerId?: string
  }
}

export const SITE_CONFIGS: Record<WebsiteChannel, SiteConfig> = {
  '1spWeb': {
    channel: '1spWeb',
    name: '1SP Agency',
    shortName: '1SP',
    defaultLocale: 'en',
    locales: ['en'],
    domains: {
      local: 'http://localhost:3000',
    },
    seo: {
      defaultTitle: '1SP Agency',
      defaultDescription:
        '1SP is a full-service agency specializing in brand engagement, experiential marketing, creative content, and talent management.',
    },
    tracking: {
      vercelAnalytics: true,
    },
  },
  flizrWeb: {
    channel: 'flizrWeb',
    name: 'FLZR',
    shortName: 'FLZR',
    defaultLocale: 'en',
    locales: ['en', 'de', 'pl'],
    domains: {},
    seo: {
      defaultTitle: 'FLZR',
      defaultDescription: 'FLZR website.',
    },
    tracking: {
      vercelAnalytics: true,
    },
  },
  msmWeb: {
    channel: 'msmWeb',
    name: 'MSM',
    shortName: 'MSM',
    defaultLocale: 'en',
    locales: ['en', 'de'],
    domains: {},
    seo: {
      defaultTitle: 'MSM',
      defaultDescription: 'MSM website.',
    },
    tracking: {
      vercelAnalytics: true,
    },
  },
  studioco2Web: {
    channel: 'studioco2Web',
    name: 'Studio CO2',
    shortName: 'Studio CO2',
    defaultLocale: 'en',
    locales: ['en', 'de'],
    domains: {},
    seo: {
      defaultTitle: 'Studio CO2',
      defaultDescription: 'Studio CO2 website.',
    },
    tracking: {
      vercelAnalytics: true,
    },
  },
}

export const WEBSITE_CHANNELS = Object.keys(SITE_CONFIGS) as WebsiteChannel[]

export function getSiteConfig(channel: string | undefined): SiteConfig {
  if (channel && channel in SITE_CONFIGS) {
    return SITE_CONFIGS[channel as WebsiteChannel]
  }

  return SITE_CONFIGS['1spWeb']
}
