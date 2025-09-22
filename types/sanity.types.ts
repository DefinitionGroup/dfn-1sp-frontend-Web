export type SanityID = string

export type Reference<T = any> = { _ref: SanityID; _type?: string }

export interface CloudinaryAsset {
    secure_url?: string
    url?: string
    public_id?: string
    width?: number
    height?: number
    metadata?: Record<string, any>
}

/* Global / Shared objects */
export interface Link {
    linkType?: 'internal' | 'external'
    page?: Reference<Page>
    externalUrl?: string
    displayName?: string
}

export interface CTA {
    text?: string
    link?: Link
    variant?: string
}

/* 1SP specific items/objects */
export interface BadgeModule {
    text?: string
    subtitle?: string
    numberEl?: string
    colSpan?: '' | 'col-span-2'
}

export interface GridElement {
    hasGrid?: boolean
    customAnimation?: boolean
    delay?: number
    staggerDelay?: number
}

export interface CardItem {
    title?: string
    description?: string
    logo?: CloudinaryAsset
    src?: CloudinaryAsset
    ctaButton?: CTA
    content?: string
}

export interface CarouselItem {
    title?: string
    subtitle?: string
    image?: CloudinaryAsset
    cta?: CTA
}

/* Objects */
export interface Cards {
    items?: CardItem[]
}

export interface Carousel {
    items?: CarouselItem[]
}

/* Gallery step types (union of specific step objects) */
export interface GalleryBase {
    badge?: BadgeModule
    headline?: string
    type?: string
}

export interface GalleryHeroStep extends GalleryBase {
    type: 'hero'
    typewriterText?: string
    description?: string[]
    backgroundVideo?: CloudinaryAsset
}

export interface GalleryCardsStep extends GalleryBase {
    type: 'cards'
    content?: {
        headline?: string
        /* ...other fields... */
    }
    backgroundVideo?: CloudinaryAsset
    media?: CloudinaryAsset
    grid?: GridElement
}

export interface GalleryListStep extends GalleryBase {
    type: 'list'
    items?: Array<{ text?: string; size?: string; fontWeight?: string; color?: 'black' | 'white' | 'gray' }>
}

export interface GalleryPeopleStep extends GalleryBase {
    type: 'people'
    header?: { superText?: string; mainHeadline?: string }
    media?: CloudinaryAsset
}

export interface GalleryScrollHighlightStep extends GalleryBase {
    type: 'highlight'
    highlightText?: string
}

export type GalleryStep =
    | GalleryHeroStep
    | GalleryCardsStep
    | GalleryListStep
    | GalleryPeopleStep
    | GalleryScrollHighlightStep

export interface ShowtimeGallery {
    steps?: GalleryStep[]
}

export interface HeroShowtime {
    heading?: string
    subheading?: string
    initialValue?: string
    paragraphs?: string[]
    additionalContent?: CTA[]
    backgroundImage?: CloudinaryAsset
    backgroundVideo?: CloudinaryAsset
    useVideo?: boolean
}

/* Documents */
export interface Page {
    _id?: SanityID
    _createdAt?: string
    _updatedAt?: string
    language?: string
    title?: string
    slug?: { current?: string }
    metadata?: {
        title?: string
        description?: string
        image?: CloudinaryAsset
        keywords?: string[]
    }
    channel?: '1spWeb' | 'msmWeb' | 'studioco2Web' | string

    // channel-specific content (kept generic)
    content1sp?: Array<any | ShowtimeGallery | HeroShowtime>
    contentMSM?: Array<any>
    contentStudioCO2?: Array<any>
}

export interface Menu {
    _id?: SanityID
    language?: string
    channel?: string
    title?: string
    menuType?: 'Navbar' | 'Footer' | string
    imageCloud?: CloudinaryAsset
    footerColumns?: Array<{
        title?: string
        links?: Array<{
            title?: string
            linkType?: 'internal' | 'external'
            page?: Reference<Page>
            externalUrl?: string
            displayName?: string
        }>
    }>
    socialProfiles?: Array<{ platform?: string; url?: string }>
    copyright?: string
}

export interface CaseStudy {
    _id?: SanityID
    language?: string
    title?: string
    slug?: { current?: string }
    publishedAt?: string
    isPublished?: boolean
    channel?: string[]
    /* other fields... */
}

export interface Unit {
    _id?: SanityID
    language?: string
    name?: string
    slug?: { current?: string }
    /* other fields... */
}

/* Root union of schema types (handy) */
export type SanityDocument = Page | Menu | CaseStudy | Unit

export type OneSPTypes =
    | BadgeModule
    | CardItem
    | Carousel
    | CarouselItem
    | GridElement
    | ShowtimeGallery
    | HeroShowtime
    | Cards
    | GalleryStep