// Shapes returned by lib/queries.ts. Every CMS value can be null.

export type CloudinaryAsset = {
  secure_url?: string | null
  resource_type?: string | null
  format?: string | null
  width?: number | null
  height?: number | null
} | null

export type HeroBlock = {
  _type: 'studioco2Hero'
  _key: string
  headline?: string | null
  text?: string | null
  primaryLabel?: string | null
  primaryHref?: string | null
  reelLabel?: string | null
  fullFilmUrl?: string | null
  darkness?: number | null
  video?: CloudinaryAsset
  mobileVideo?: CloudinaryAsset
  poster?: CloudinaryAsset
}

export type SpecimenBlock = {
  _type: 'studioco2Specimen'
  _key: string
  anchor?: string | null
  label?: string | null
  headline?: string | null
  description?: string | null
  inlineImage?: CloudinaryAsset
}

export type CapabilityItem = { _key: string; title?: string | null; text?: string | null; alt?: string | null; image?: CloudinaryAsset }

export type CapabilitiesBlock = {
  _type: 'studioco2Capabilities'
  _key: string
  items?: CapabilityItem[] | null
}

/** A case on the stack card, resolved through its Studio CO2 version. */
export type StackCase = {
  _id: string
  slug?: string | null
  title?: string | null
  description?: string | null
  subtitle?: string | null
  sector?: string | null
  discipline?: string | null
  client?: string | null
  mainImageUrl?: string | null
  mainVideoUrl?: string | null
  /** Fallback projects only: image description and dialog focus line. */
  alt?: string | null
  focus?: string | null
}

export type CasesStackBlock = {
  _type: 'studioco2CasesStack'
  _key: string
  anchor?: string | null
  label?: string | null
  hint?: string | null
  headline?: string | null
  text?: string | null
  showFilters?: boolean | null
  cases?: (StackCase | null)[] | null
}

export type UnknownBlock = { _type: string; _key: string }

export type Studioco2Block = HeroBlock | SpecimenBlock | CapabilitiesBlock | CasesStackBlock

export type Studioco2Page = {
  _id: string
  title?: string | null
  slug?: string | null
  seo?: { title?: string | null; description?: string | null } | null
  content?: (Studioco2Block | UnknownBlock)[] | null
}

export type CaseBodyBlock = { _type: string; _key: string; [field: string]: unknown }

export type CaseDetail = StackCase & {
  services?: (string | null)[] | null
  seo?: { title?: string | null; description?: string | null } | null
  casesPageBuilder?: CaseBodyBlock[] | null
}

export type ContactSettings = {
  email?: string | null
  phone?: string | null
  address?: string | null
  invitation?: string | null
  ctaLabel?: string | null
  familyLabel?: string | null
  familyUrl?: string | null
}
