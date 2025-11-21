export type SanityID = string;

export type Reference<T = any> = { _ref: SanityID; _type?: string };

export interface CloudinaryAsset {
    secure_url?: string;
    url?: string;
    public_id?: string;
    width?: number;
    height?: number;
    metadata?: Record<string, any>;
}

/* Global / Shared objects */
export interface Link {
    linkType?: "internal" | "external";
    page?: Reference<Page>;
    externalUrl?: string;
    displayName?: string;
}

export interface CTA {
    text?: string;
    link?: Link;
    variant?: string;
}

/* 1SP specific items/objects */
export interface BadgeModule {
    text?: string;
    subtitle?: string;
    numberEl?: string;
    colSpan?: "" | "col-span-2";
}

export interface GridElement {
    hasGrid?: boolean;
    customAnimation?: boolean;
    delay?: number;
    staggerDelay?: number;
}

export interface CardItem {
    title?: string;
    description?: string;
    logo?: CloudinaryAsset;
    src?: CloudinaryAsset;
    ctaButton?: CTA;
    content?: string;
}

export interface CarouselItem {
    title?: string;
    subtitle?: string;
    image?: CloudinaryAsset;
    cta?: CTA;
}

/* Objects */
export interface Cards {
    items?: CardItem[];
}

export interface Carousel {
    items?: CarouselItem[];
}

/* Gallery step types (union of specific step objects) */
export interface GalleryBase {
    badge?: BadgeModule;
    headline?: string;
    type?: string;
    navPointName?: string;
}

export interface GalleryHeroStep extends GalleryBase {
    type: "hero";
    typewriterText?: string;
    description?: string[];
    backgroundVideo?: CloudinaryAsset;
}

export interface GalleryCardsStep extends GalleryBase {
    type: "cards";
    content?: {
        headline?: string;
        /* ...other fields... */
    };
    backgroundVideo?: CloudinaryAsset;
    media?: CloudinaryAsset;
    grid?: GridElement;
}

/** Mini CTA block used inside ListStep.additionalContent */
export type ButtonVariant = "default" | "black" | "lime" | "limesmall";
export type MiniCtaAlignment = "left" | "right" | "center" | "default";

export interface CtaMiniComponent {
    heading?: string;
    paragraph?: string;
    buttonText?: string;
    link?: Link;
    variant?: ButtonVariant;
    alignment?: MiniCtaAlignment;
}

export interface GalleryListStep extends GalleryBase {
    type: "list";

    /** Regular header (hidden when staggeredSlideUp is true) */
    header?: {
        superText?: string;
        mainHeadline?: string;
        subHeadline?: string;
    };

    /** Toggle + data for the staggered variant */
    staggeredSlideUp?: boolean;
    staggeredHeader?: {
        title?: string;
        /** New: array of lines with per-line font size; supports legacy string items */
        paragraphs?: Array<
            | string
            | {
                text?: string;
                fontSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
            }
        >;
    };

    /** Primary list field (new schema) */
    listItems?: Array<{
        text?: string;
        size?: "small" | "medium" | "large" | string;
        fontWeight?: "normal" | "bold" | string;
        color?: "black" | "white" | "gray" | string;
    }>;

    /** Back-compat: legacy list field */
    items?: Array<{
        text?: string;
        size?: string;
        fontWeight?: string;
        color?: "black" | "white" | "gray";
    }>;

    /** Media + grid from the new schema */
    media?: CloudinaryAsset;
    grid?: GridElement;

    /** Additional content supports cta, cards, and ctaMiniComponent */
    additionalContent?: Array<
        | (CTA & { _type?: "cta" })
        | (Cards & { _type?: "cards" })
        | (CtaMiniComponent & { _type?: "ctaMiniComponent" })
        | (CtaSplitHeader & { _type?: 'ctaSplitHeader' })
    >;
}

export interface GalleryRevealStep extends GalleryBase {
    type: "reveal";
    items?: Array<{
        label?: string;
        image?: CloudinaryAsset;
        number?: number;
    }>;
    media?: CloudinaryAsset;
    grid?: GridElement;
}

export interface GalleryPeopleStep extends GalleryBase {
    type: "people";
    header?: { superText?: string; mainHeadline?: string };
    media?: CloudinaryAsset;
}

export interface GalleryScrollHighlightStep extends GalleryBase {
    type: "highlight";
    highlightText?: string;
}
export interface CtaSplitHeader {
    cta?: CtaMiniComponent;
    heading?: string;
    subheading?: string;
    paragraph?: string;
}

export interface GalleryOverview extends GalleryBase {
    type: "overview";
    eyebrow?: string;
    headline?: string;
    highlight?: string;
    subhead?: string;
    kicker?: string;
    align?: "left" | "center" | "right";
    size?: "sm" | "md" | "lg" | "xl";
    grid?: GridElement; // uses hasGrid/customAnimation/delay/staggerDelay
}

export type GalleryStep =
    | GalleryHeroStep
    | GalleryCardsStep
    | GalleryListStep
    | GalleryPeopleStep
    | GalleryScrollHighlightStep
    | GalleryRevealStep
    | GalleryOverview;

export interface ShowtimeGallery {
    steps?: GalleryStep[];
}

export interface HeroShowtime {
    heading?: string;
    subheading?: string;
    initialValue?: string;
    paragraphs?: string[];
    additionalContent?: CTA[];
    backgroundImage?: CloudinaryAsset;
    backgroundVideo?: CloudinaryAsset;
    useVideo?: boolean;
    navPointName?: string;
}

/** Subline component */
export interface SublineComponent {
    description?: string;
    showGridBackground?: boolean;
    additionalContent?: CTA[];
    sectionTitle?: string;
    navPointName?: string;
}

/** Content Section component */
export interface ContentSection {
    title?: string;
    introHeading?: string;
    introSubheading?: string;
    content?: any[]; // PortableText blocks
    contentSize?: string;
    columnSpan?: string;
    showGridBackground?: boolean;
    paddingY?: string;
    navPointName?: string;
}

/* Documents */
export interface Page {
    _id?: SanityID;
    _createdAt?: string;
    _updatedAt?: string;
    language?: string;
    title?: string;
    slug?: { current?: string };
    metadata?: {
        title?: string;
        description?: string;
        image?: CloudinaryAsset;
        keywords?: string[];
    };
    channel?: "1spWeb" | "msmWeb" | "studioco2Web" | string;
    navbarVariant?: "light" | "dark";

    // channel-specific content (kept generic)
    content1sp?: Array<any | ShowtimeGallery | HeroShowtime | SublineComponent | OneSPHeader>;
    contentMSM?: Array<any>;
    contentStudioCO2?: Array<any>;
}

export interface Menu {
    _id?: SanityID;
    language?: string;
    channel?: string;
    title?: string;
    menuType?: "Navbar" | "Footer" | string;
    imageCloud?: CloudinaryAsset;
    footerColumns?: Array<{
        title?: string;
        links?: Array<{
            title?: string;
            linkType?: "internal" | "external";
            slug?: string;
            pageTitle?: string;
            page?: Reference<Page>;
            externalUrl?: string;
            displayName?: string;
        }>;
    }>;
    socialProfiles?: Array<{ platform?: string; url?: string }>;
    // Some queries project `socialLinks` instead of `socialProfiles` — accept both
    socialLinks?: Array<{ _key?: string; platform?: string; url?: string }>;
    copyright?: string;
}

export interface CaseStudy {
    _id?: SanityID;
    language?: string;
    title?: string;
    slug?: { current?: string };
    publishedAt?: string;
    isPublished?: boolean;
    channel?: string[];
    services?: Reference<Services>[];
    /* other fields... */
}

export interface Unit {
    _id?: SanityID;
    language?: string;
    name?: string;
    slug?: { current?: string };
    services?: Reference<Services>[];
    /* other fields... */
}

/* Root union of schema types (handy) */
export type SanityDocument = Page | Menu | CaseStudy | Unit;

export type OneSPTypes =
    | BadgeModule
    | CardItem
    | Carousel
    | CarouselItem
    | GridElement
    | ShowtimeGallery
    | HeroShowtime
    | SublineComponent
    | CtaMiniComponent
    | Cards
    | GalleryStep;


/* Font sizes used by paragraph lines */
export type FontSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | string;

/** Matches the `size` object you defined in Studio (with a `size` string) */
export interface SizeObject {
    size?: FontSize;
}

/** Matches your `paragraphLine` object (text + fontSize of type `size`) */
export interface ParagraphLine {
    text?: string;
    /** In Studio this is an object of type `size`; accept string fallback too */
    fontSize?: FontSize | SizeObject;
}

/** New header object (schema: oneSPHeader) */
export interface OneSPHeader {
    /** Sanity _type will be "oneSPHeader" */
    _type?: "oneSPHeader";
    media?: CloudinaryAsset;
    enableParallax?: boolean;

    // content
    eyebrow?: string;
    rotatingText?: string[];
    paragraphs?: ParagraphLine[];
    highlight?: string;

    // decoration
    cornerLeftText?: string;
    cornerRightText?: string;

    // navigation
    navPointName?: string;
}

/* Service Management Types */
export interface Services {
    _id?: SanityID;
    _type?: "services";
    language?: string;
    name?: string;
    taglabel?: string;
    serviceicon?: CloudinaryAsset;
    unitsrel?: Reference<Unit>[];
    servicegrouprel?: Reference<ServiceGroup>[];
}

export interface ServiceGroup {
    _id?: SanityID;
    _type?: "serviceGroup";
    language?: string;
    name?: string;
    taglabel?: string;
    servicegroupicon?: CloudinaryAsset;
    services?: Reference<Services>[];
}

export interface CaseStudyData {
    _id: string;
    title: string;
    subtitle?: string;
    slug: { current: string };
    description?: string;
    services?: { _id: string; name: string }[];
    mainImage?: CloudinaryAsset;
    isVerticalVideo?: boolean;
    mainVideo?: CloudinaryAsset;
    mainImageUrl?: string;
    mainVideoUrl?: string;
    websiteUrl?: string;
    websiteUrlText?: string;
    units?: Array<{
        _id: string;
        name: string;
        slug: { current: string };
        tagline?: string;
        logoUrl?: string;
    }>;
    client?: {
        _id: string;
        name: string;
        slug: { current: string };
        logoUrl?: string;
    };
    casesPageBuilder?: Array<
        | HeadlineChallengeComponent
        | ChallengeAndSolutionComponent
        | ApproachSectionComponent
        | ResultsMetricsComponent
    >;
    publishedAt?: string;
}

export interface HeadlineChallengeComponent {
    _type: "headlineChallenge";
    _key: string;
    headline?: string;
    title: string;
    description?: string;
    navPointName?: string;
    showGridBackground?: boolean;
    paddingY?: string;
}

export interface ChallengeAndSolutionComponent {
    _type: "challengeAndSolution";
    _key: string;
    title: string;
    description?: string;
    badgeText?: string;
    badgeSubtitle?: string;
    badgeNumber?: string;
    contentType?: "challenges" | "services";
    challenges?: string[];
    services?: { _id: string; name: string }[];
    ctaHeading?: string;
    ctaParagraph?: string;
    showButton?: boolean;
    solution?: string;
    navPointName?: string;
    showGridBackground?: boolean;
    backgroundColor?: string;
    paddingY?: string;
}

export interface ApproachSectionComponent {
    _type: "approachSection";
    _key: string;
    mainHeadline: string;
    subHeadline?: string;
    description?: string;
    approachDetails?: string[];
    badgeText?: string;
    badgeSubtitle?: string;
    badgeNumber?: string;
    mediaType?: "image" | "video";
    backgroundImage?: CloudinaryAsset;
    backgroundVideo?: CloudinaryAsset;
    enableParallax?: boolean;
    navPointName?: string;
    paddingY?: string;
}

export interface ResultsMetricsComponent {
    _type: "resultsMetrics";
    _key: string;
    title: string;
    description?: string;
    badgeText?: string;
    badgeSubtitle?: string;
    badgeNumber?: string;
    metrics?: Array<{
        type: "vertical" | "horizontal" | "posNeg";
        label: string;
        value: number;
    }>;
    backgroundImage?: CloudinaryAsset;
    backgroundOpacity?: number;
    enableParallax?: boolean;
    navPointName?: string;
    paddingY?: string;
}

export interface Service {
    _id: string;
    name: string;
    taglabel?: string;
    iconUrl?: string;
    serviceicon?: any;
    serviceBackground?: any;
    serviceDescription?: string;
    servicegrouprel?: { _id: string; name: string; taglabel?: string }[];
    unitsrel?: { _id: string; name: string; slug: { current: string } }[];
}