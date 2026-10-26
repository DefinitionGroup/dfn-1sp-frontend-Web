import { defineQuery } from 'next-sanity'
import { casePresentationFields, CASE_BODY_PROJECTION } from '@1sp/sanity-queries/case-presentation'
import { sanityFetch } from '@1sp/sanity-queries/fetch'
import { SITE_CONFIGS } from '@1sp/site-config'
import type { CaseDetail, ContactSettings, Studioco2Page, StackCase } from './types'

export const CHANNEL = SITE_CONFIGS.studioco2Web.channel

const ASSET = `{ secure_url, resource_type, format, width, height }`

// Card copy and media resolve through the case’s Studio CO2 version.
const STACK_CASE = `
  _id,
  "slug": slug.current,
  sector,
  "discipline": siteContent[channel == $channel][0].discipline,
  "client": client->name,
  ${casePresentationFields()}
`

const CONTENT = `
  content[]{
    _key,
    _type,
    _type == "studioco2Hero" => {
      headline, text, primaryLabel, primaryHref, reelLabel, fullFilmUrl, darkness,
      "video": video${ASSET}, "mobileVideo": mobileVideo${ASSET}, "poster": poster${ASSET}
    },
    _type == "studioco2Specimen" => { anchor, label, headline, description, "inlineImage": inlineImage${ASSET} },
    _type == "studioco2Capabilities" => { items[]{ _key, title, text, alt, "image": image${ASSET} } },
    _type == "studioco2CasesStack" => {
      anchor, label, hint, headline, text, showFilters,
      "cases": cards[
        $channel in case->channel && case->language == $language && case->isPublished == true && defined(case->slug.current)
      ].case->{ ${STACK_CASE} }
    }
  }
`

const PAGE_FIELDS = `_id, title, "slug": slug.current, "seo": metadata{ title, description }, ${CONTENT}`

export const HOME_QUERY = defineQuery(`*[_type == "page" && isHomepage == true && channel == $channel && language == $language][0]{ ${PAGE_FIELDS} }`)
export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug && channel == $channel && language == $language][0]{ ${PAGE_FIELDS} }`)
export const PAGE_SLUGS_QUERY = defineQuery(`*[_type == "page" && channel == $channel && language == $language && isHomepage != true && defined(slug.current)].slug.current`)

export const CASE_QUERY = defineQuery(`*[_type == "caseStudy" && slug.current == $slug && $channel in channel && language == $language && isPublished == true][0]{
  ${STACK_CASE},
  "services": services[]->name,
  ${CASE_BODY_PROJECTION}
}`)
export const CASE_SLUGS_QUERY = defineQuery(`*[_type == "caseStudy" && $channel in channel && language == $language && isPublished == true && defined(slug.current)].slug.current`)

// The homepage stack sets the reading order for “Next case”.
export const CASE_ORDER_QUERY = defineQuery(`*[_type == "page" && isHomepage == true && channel == $channel && language == $language][0]
  .content[_type == "studioco2CasesStack"][0].cards[$channel in case->channel && case->isPublished == true].case->{ "slug": slug.current, ${casePresentationFields()} }`)

export const CONTACT_QUERY = defineQuery(`*[_type == "siteSettings" && channel == $channel && language == $language][0].studioco2Contact`)

const params = (language: string, extra: Record<string, string> = {}) => ({ channel: CHANNEL, language, ...extra })

export async function getHomePage(language: string) {
  const { data } = await sanityFetch<Studioco2Page | null>({ query: HOME_QUERY, params: params(language), tags: ['pages', 'cases'] })
  return data
}

export async function getPage(slug: string, language: string) {
  const { data } = await sanityFetch<Studioco2Page | null>({ query: PAGE_QUERY, params: params(language, { slug }), tags: ['pages', `page:${slug}`, 'cases'] })
  return data
}

export async function getPageSlugs(language: string) {
  const { data } = await sanityFetch<string[] | null>({ query: PAGE_SLUGS_QUERY, params: params(language), tags: ['pages'], perspective: 'published', stega: false })
  return data ?? []
}

export async function getCase(slug: string, language: string) {
  const { data } = await sanityFetch<CaseDetail | null>({ query: CASE_QUERY, params: params(language, { slug }), tags: ['cases', `case:${slug}`] })
  return data
}

export async function getCaseSlugs(language: string) {
  const { data } = await sanityFetch<string[] | null>({ query: CASE_SLUGS_QUERY, params: params(language), tags: ['cases'], perspective: 'published', stega: false })
  return data ?? []
}

export async function getCaseOrder(language: string) {
  const { data } = await sanityFetch<Pick<StackCase, 'slug' | 'title'>[] | null>({ query: CASE_ORDER_QUERY, params: params(language), tags: ['pages', 'cases'] })
  return data ?? []
}

export async function getContact(language: string) {
  const { data } = await sanityFetch<ContactSettings | null>({ query: CONTACT_QUERY, params: params(language), tags: ['global'] })
  return data
}
