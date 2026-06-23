import { CANONICAL_SITE_URL } from "@1sp/utils/site-url";

/**
 * Structured Data (JSON-LD) Generators
 * =====================================
 *
 * Generates Schema.org structured data for SEO rich results.
 *
 * ## Supported Types
 *
 * - **Organization**: Company identity (knowledge panel, brand SERP)
 * - **WebSite**: Site-level info (sitelinks)
 * - **Article**: Case study pages (article rich results)
 * - **WebPage**: Generic pages
 * - **BreadcrumbList**: Navigation breadcrumbs (all pages)
 * - **Person**: Team members (for pages displaying people)
 * - **Organization (sub)**: Business units
 *
 * ## Usage
 *
 * ```tsx
 * import { JsonLdScript, generateHomepageJsonLd } from '@/lib/structured-data';
 *
 * export default function Page() {
 *   return (
 *     <>
 *       <JsonLdScript data={generateHomepageJsonLd({ locale: 'en' })} />
 *       {/* page content *​/}
 *     </>
 *   );
 * }
 * ```
 */

// =============================================================================
// CONSTANTS
// =============================================================================

export const CANONICAL_URL = CANONICAL_SITE_URL;
const SITE_NAME = "1SP Agency";
const SITE_DESCRIPTION =
  "1SP is a full-service agency specializing in brand engagement, experiential marketing, creative content, and talent management.";

// Localized breadcrumb labels
const BREADCRUMB_LABELS: Record<string, Record<string, string>> = {
  en: { home: "Home", cases: "Cases", services: "Services", contact: "Contact" },
  de: { home: "Startseite", cases: "Projekte", services: "Leistungen", contact: "Kontakt" },
  es: { home: "Inicio", cases: "Casos", services: "Servicios", contact: "Contacto" },
};

// =============================================================================
// TYPES
// =============================================================================

type JsonLdEntity = Record<string, unknown>;

interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ServiceForCatalog {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  groupNames?: string[];
}

interface LocationForSchema {
  name?: string | null;
  address?: string | null;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Renders a `<script type="application/ld+json">` tag.
 * Google reads JSON-LD from anywhere on the page (head or body).
 */
export function JsonLdScript({ data }: { data: JsonLdEntity | JsonLdEntity[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get a localized breadcrumb label.
 */
export function getBreadcrumbLabel(locale: string, key: string): string {
  return BREADCRUMB_LABELS[locale]?.[key] || BREADCRUMB_LABELS.en[key] || key;
}

function toSchemaFragment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

// =============================================================================
// GENERATORS
// =============================================================================

/**
 * Organization + WebSite + WebPage graph for the homepage.
 *
 * Uses `@graph` to establish entity relationships via `@id` references.
 * This is the richest structured data block on the site.
 *
 * SEO Impact: Knowledge Panel, Brand SERP, Sitelinks
 */
export function generateHomepageJsonLd(options: {
  locale: string;
  logoUrl?: string | null;
  socialLinks?: Array<{ name: string; url: string }>;
}): JsonLdEntity {
  const { locale, logoUrl, socialLinks } = options;

  const graph: JsonLdEntity[] = [
    {
      "@type": "Organization",
      "@id": `${CANONICAL_URL}/#organization`,
      name: SITE_NAME,
      url: CANONICAL_URL,
      description: SITE_DESCRIPTION,
      ...(logoUrl && {
        logo: {
          "@type": "ImageObject",
          "@id": `${CANONICAL_URL}/#logo`,
          url: logoUrl,
          contentUrl: logoUrl,
          caption: SITE_NAME,
        },
        image: { "@id": `${CANONICAL_URL}/#logo` },
      }),
      ...(socialLinks?.length && {
        sameAs: socialLinks.map((l) => l.url),
      }),
    },
    {
      "@type": "WebSite",
      "@id": `${CANONICAL_URL}/#website`,
      name: SITE_NAME,
      url: CANONICAL_URL,
      publisher: { "@id": `${CANONICAL_URL}/#organization` },
      inLanguage: locale,
    },
    {
      "@type": "WebPage",
      "@id": CANONICAL_URL,
      url: CANONICAL_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      isPartOf: { "@id": `${CANONICAL_URL}/#website` },
      about: { "@id": `${CANONICAL_URL}/#organization` },
      inLanguage: locale,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/**
 * BreadcrumbList structured data.
 *
 * SEO Impact: Breadcrumb rich results in Google Search
 */
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdEntity {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Article structured data for Case Study pages.
 *
 * Google supports Article rich results — headline, image, datePublished,
 * author, and publisher are the key fields.
 *
 * SEO Impact: Article rich results, image carousels
 */
export function generateCaseStudyJsonLd(options: {
  title: string;
  slug: string;
  description?: string | null;
  locale: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  clientName?: string | null;
  services?: Array<{ name: string }> | null;
  units?: Array<{ name: string }> | null;
}): JsonLdEntity {
  const {
    title, slug, description, locale,
    imageUrl, publishedAt, clientName, services, units,
  } = options;

  const pageUrl = `${CANONICAL_URL}/cases/${slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    headline: title,
    ...(description && { description }),
    url: pageUrl,
    inLanguage: locale,
    ...(imageUrl && {
      image: { "@type": "ImageObject", url: imageUrl },
    }),
    ...(publishedAt && { datePublished: publishedAt }),
    author: { "@type": "Organization", "@id": `${CANONICAL_URL}/#organization`, name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      "@id": `${CANONICAL_URL}/#organization`,
      name: SITE_NAME,
    },
    isPartOf: { "@id": `${CANONICAL_URL}/#website` },
    ...(clientName && {
      mentions: { "@type": "Organization", name: clientName },
    }),
    ...(services?.length && {
      about: services.map((s) => ({ "@type": "Service", name: s.name })),
    }),
    ...(units?.length && {
      sourceOrganization: units.map((u) => ({
        "@type": "Organization",
        name: u.name,
        parentOrganization: { "@id": `${CANONICAL_URL}/#organization` },
      })),
    }),
  };
}

/**
 * WebPage structured data for generic/dynamic pages.
 *
 * SEO Impact: Page-level understanding for search engines
 */
export function generateWebPageJsonLd(options: {
  title: string;
  slug: string;
  description?: string | null;
  locale: string;
  imageUrl?: string | null;
}): JsonLdEntity {
  const { title, slug, description, locale, imageUrl } = options;
  const pageUrl = `${CANONICAL_URL}/${slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": pageUrl,
    name: title,
    ...(description && { description }),
    url: pageUrl,
    inLanguage: locale,
    isPartOf: { "@id": `${CANONICAL_URL}/#website` },
    ...(imageUrl && {
      primaryImageOfPage: { "@type": "ImageObject", url: imageUrl },
    }),
  };
}

/**
 * CollectionPage structured data for archive/listing pages.
 *
 * Use this for pages whose main purpose is to surface a browsable set of
 * entities, such as the cases archive. It gives search engines a stronger
 * page-level signal than a generic WebPage.
 */
export function generateCollectionPageJsonLd(options: {
  title: string;
  slug: string;
  description?: string | null;
  locale: string;
  imageUrl?: string | null;
  mainEntityId?: string;
}): JsonLdEntity {
  const { title, slug, description, locale, imageUrl, mainEntityId } = options;
  const pageUrl = `${CANONICAL_URL}/${slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": pageUrl,
    name: title,
    ...(description && { description }),
    url: pageUrl,
    inLanguage: locale,
    isPartOf: { "@id": `${CANONICAL_URL}/#website` },
    ...(imageUrl && {
      primaryImageOfPage: { "@type": "ImageObject", url: imageUrl },
    }),
    ...(mainEntityId && {
      mainEntity: { "@id": mainEntityId },
    }),
  };
}

/**
 * OfferCatalog structured data for service listing pages.
 *
 * Use this when a page renders the services gallery. Service detail pages do not
 * exist in the app, so the catalog embeds Service entities directly instead of
 * pointing to per-service URLs.
 */
export function generateServiceCatalogJsonLd(options: {
  services: ServiceForCatalog[];
  locale: string;
  id?: string;
  name?: string;
  url?: string;
}): JsonLdEntity {
  const {
    services,
    locale,
    id,
    name = "Services",
    url = `${CANONICAL_URL}/services`,
  } = options;

  const catalogId = id || `${url}#service-catalog`;
  const serviceIds = services.map((service, index) =>
    `${catalogId}-service-${index + 1}-${toSchemaFragment(service.name)}`
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OfferCatalog",
        "@id": catalogId,
        name,
        url,
        inLanguage: locale,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: services.length,
        itemListElement: services.map((service, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@id": serviceIds[index],
          },
        })),
      },
      ...services.map((service, index) => ({
        "@type": "Service",
        "@id": serviceIds[index],
        name: service.name,
        url,
        ...(service.description && { description: service.description }),
        ...(service.imageUrl && { image: service.imageUrl }),
        ...(service.groupNames?.length && { category: service.groupNames }),
        provider: { "@id": `${CANONICAL_URL}/#organization` },
      })),
    ],
  };
}

export function generateLocalBusinessJsonLd(options: {
  locations?: LocationForSchema[] | null;
  socialLinks?: Array<{ url: string }> | null;
}): JsonLdEntity {
  const locations = options.locations?.filter(
    (location) => location?.name || location?.address
  ) || [];

  const baseBusiness = {
    "@type": ["LocalBusiness", "ProfessionalService", "MarketingAgency"],
    name: SITE_NAME,
    url: CANONICAL_URL,
    parentOrganization: { "@id": `${CANONICAL_URL}/#organization` },
    ...(options.socialLinks?.length && {
      sameAs: options.socialLinks.map((link) => link.url),
    }),
  };

  if (locations.length === 0) {
    return {
      "@context": "https://schema.org",
      "@id": `${CANONICAL_URL}/#local-business`,
      ...baseBusiness,
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": locations.map((location, index) => ({
      "@id": `${CANONICAL_URL}/#local-business-${index + 1}-${toSchemaFragment(
        location.name || location.address || "location"
      )}`,
      ...baseBusiness,
      ...(location.name && { branchOf: { "@id": `${CANONICAL_URL}/#organization` } }),
      ...(location.name && { name: `${SITE_NAME} ${location.name}` }),
      ...(location.address && {
        address: {
          "@type": "PostalAddress",
          streetAddress: location.address,
        },
      }),
    })),
  };
}

/**
 * Person structured data for team member profiles.
 *
 * Use this when rendering People on a page (gallery, team sections).
 * Since People don't have dedicated URLs, embed these in the page's
 * structured data rather than as standalone entities.
 *
 * SEO Impact: People knowledge panels, entity understanding
 */
export function generatePersonJsonLd(options: {
  name: string;
  position?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  profileUrl?: string | null;
  unitName?: string | null;
}): JsonLdEntity {
  const { name, position, email, imageUrl, profileUrl, unitName } = options;

  return {
    "@type": "Person",
    name,
    ...(position && { jobTitle: position }),
    ...(email && { email: `mailto:${email}` }),
    ...(imageUrl && { image: imageUrl }),
    ...(profileUrl && { sameAs: [profileUrl] }),
    worksFor: unitName
      ? { "@type": "Organization", name: unitName }
      : { "@id": `${CANONICAL_URL}/#organization` },
  };
}

/**
 * Organization structured data for Business Units (sub-organizations).
 *
 * Use this when rendering Business Unit cards/galleries on a page.
 *
 * SEO Impact: Local search, knowledge panels for sub-brands
 */
export function generateBusinessUnitJsonLd(options: {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  address?: {
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  } | null;
  phone?: string | null;
  email?: string | null;
  coordinates?: { lat: number; lon: number } | null;
}): JsonLdEntity {
  const { name, description, logoUrl, address, phone, email, coordinates } = options;

  return {
    "@type": "Organization",
    name,
    ...(description && { description }),
    ...(logoUrl && { logo: logoUrl }),
    parentOrganization: { "@id": `${CANONICAL_URL}/#organization` },
    ...(address && (address.street || address.city) && {
      address: {
        "@type": "PostalAddress",
        ...(address.street && { streetAddress: address.street }),
        ...(address.postalCode && { postalCode: address.postalCode }),
        ...(address.city && { addressLocality: address.city }),
        ...(address.country && { addressCountry: address.country }),
      },
    }),
    ...(phone && { telephone: phone }),
    ...(email && { email }),
    ...(coordinates && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: coordinates.lat,
        longitude: coordinates.lon,
      },
    }),
  };
}

/**
 * ContactPage structured data.
 *
 * Schema.org `ContactPage` type signals to search engines that this page
 * contains contact information for the organization.
 *
 * SEO Impact: Page-level understanding, Organization contact info
 */
export function generateContactPageJsonLd(options: {
  locale: string;
  title?: string;
  description?: string | null;
}): JsonLdEntity {
  const pageUrl = `${CANONICAL_URL}/contact`;
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": pageUrl,
    name: options.title || "Contact",
    ...(options.description && { description: options.description }),
    url: pageUrl,
    inLanguage: options.locale,
    isPartOf: { "@id": `${CANONICAL_URL}/#website` },
    mainEntity: { "@id": `${CANONICAL_URL}/#organization` },
  };
}

// =============================================================================
// ITEM LIST / CAROUSEL
// =============================================================================

/**
 * A single case study item extracted from page builder content blocks.
 */
export interface CaseItemForList {
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

/**
 * ItemList structured data for case study carousels and galleries.
 *
 * Google's ItemList type can generate a **scrollable carousel** in search
 * results when the page contains a list of items with individual URLs.
 * Each ListItem points to a case study detail page (which already has
 * full Article structured data).
 *
 * SEO Impact: Carousel rich results in Google Search
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/carousel
 */
export function generateItemListJsonLd(options: {
  items: CaseItemForList[];
  locale: string;
  listName?: string;
  id?: string;
}): JsonLdEntity {
  const { items, locale, listName, id } = options;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    ...(id && { "@id": id }),
    ...(listName && { name: listName }),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${CANONICAL_URL}/cases/${item.slug}`,
      name: item.title,
      ...(item.description && { description: item.description }),
      ...(item.imageUrl && {
        image: { "@type": "ImageObject", url: item.imageUrl },
      }),
    })),
  };
}

/**
 * Extract case study items from page builder content blocks for ItemList
 * structured data. Scans blocks of type `smartCarousel`,
 * `casesGalleryFiltered`, and `casesGalleryFilteredWithPagination`.
 *
 * ## Data Sources
 *
 * - **smartCarousel** (manual mode): `selectedCases` are dereferenced in GROQ
 *   with full data (title, slug, description, image, client, services).
 *
 * - **casesGalleryFiltered** / **casesGalleryFilteredWithPagination**:
 *   `selectedCases` are dereferenced via GROQ projection with title + slug
 *   (lightweight). Auto-mode galleries use `allCases` fallback data.
 *
 * @param contentBlocks - The page builder content array from Sanity
 * @param allCases - Optional fallback: all published cases (for auto-mode galleries)
 * @returns Deduplicated array of case items ready for `generateItemListJsonLd()`
 */
export function extractCaseItemsFromContent(
  contentBlocks: any[] | null | undefined,
  allCases?: CaseItemForList[],
): CaseItemForList[] {
  if (!contentBlocks || !Array.isArray(contentBlocks)) return [];

  const seen = new Set<string>();
  const items: CaseItemForList[] = [];

  const addItem = (item: CaseItemForList) => {
    if (seen.has(item.slug)) return;
    seen.add(item.slug);
    items.push(item);
  };

  for (const block of contentBlocks) {
    if (!block?._type) continue;

    switch (block._type) {
      // SmartCarousel: selectedCases are fully dereferenced in GROQ
      case "smartCarousel": {
        if (block.selectionMode === "manual" && Array.isArray(block.selectedCases)) {
          for (const cs of block.selectedCases) {
            if (!cs?.title || !cs?.slug?.current) continue;
            addItem({
              title: cs.title,
              slug: cs.slug.current,
              description: cs.description || null,
              imageUrl: cs.mainImage?.secure_url || null,
            });
          }
        } else if (allCases) {
          // Auto mode: use the fallback list
          for (const cs of allCases) addItem(cs);
        }
        break;
      }

      // CasesGalleryFiltered / WithPagination: selectedCases dereferenced via GROQ projection
      case "casesGalleryFiltered":
      case "casesGalleryFilteredWithPagination": {
        if (block.selectionMode === "manual" && Array.isArray(block.selectedCases)) {
          for (const cs of block.selectedCases) {
            // Dereferenced via GROQ: { _id, title, slug: { current }, description, mainImageUrl }
            if (!cs?.title || !cs?.slug?.current) continue;
            addItem({
              title: cs.title,
              slug: cs.slug.current,
              description: cs.description || null,
              imageUrl: cs.mainImageUrl || cs.mainImage?.secure_url || null,
            });
          }
        } else if (allCases) {
          // Auto mode: use the fallback list
          for (const cs of allCases) addItem(cs);
        }
        break;
      }
    }
  }

  return items;
}

/**
 * True when the page contains case blocks that need the `allCases` fallback for
 * auto-mode JSON-LD generation.
 */
export function hasAutoCaseListingBlocks(
  contentBlocks: any[] | null | undefined,
): boolean {
  if (!contentBlocks || !Array.isArray(contentBlocks)) return false;

  return contentBlocks.some((block) => {
    if (!block?._type) return false;

    return (
      (block._type === "smartCarousel" ||
        block._type === "casesGalleryFiltered" ||
        block._type === "casesGalleryFilteredWithPagination") &&
      block.selectionMode !== "manual"
    );
  });
}

/**
 * True when the page contains the services gallery block.
 */
export function hasServicesGalleryBlock(
  contentBlocks: any[] | null | undefined,
): boolean {
  if (!contentBlocks || !Array.isArray(contentBlocks)) return false;

  return contentBlocks.some((block) => block?._type === "servicesGalleryFiltered");
}

/**
 * Normalize raw service documents into JSON-LD catalog items.
 */
export function mapServicesToCatalogItems(
  services: any[] | null | undefined,
): ServiceForCatalog[] {
  if (!services || !Array.isArray(services)) return [];

  return services
    .filter((service) => service?.name)
    .map((service) => ({
      name: service.name,
      description: service.serviceDescription || null,
      imageUrl:
        service.serviceBackground?.asset?.secure_url ||
        service.serviceBackground?.asset?.url ||
        service.iconUrl ||
        service.serviceicon?.asset?.secure_url ||
        service.serviceicon?.asset?.url ||
        null,
      groupNames: Array.isArray(service.servicegrouprel)
        ? service.servicegrouprel
          .map((group: any) => group?.name)
          .filter(Boolean)
        : [],
    }));
}

/**
 * Normalize raw case documents into ItemList-ready entries.
 */
export function mapCasesToItemList(
  cases: any[] | null | undefined,
): CaseItemForList[] {
  if (!cases || !Array.isArray(cases)) return [];

  return cases
    .filter((cs) => cs?.title && cs?.slug?.current)
    .map((cs) => ({
      title: cs.title,
      slug: cs.slug.current,
      description: cs.description || null,
      imageUrl: cs.mainImageUrl || cs.mainImage?.secure_url || null,
    }));
}

// =============================================================================
// PERSON EXTRACTION FROM PAGE BUILDER CONTENT
// =============================================================================

/**
 * Person data extracted from page builder blocks for JSON-LD.
 */
export interface PersonForJsonLd {
  name: string;
  position?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  profileUrl?: string | null;
  unitName?: string | null;
}

/**
 * Extract people from page builder content blocks for Person JSON-LD.
 *
 * Scans for:
 * - `galleryPeopleStep` blocks → `teamMembers[]`
 * - `showtimeGallery` blocks → nested `steps[].teamMembers[]`
 *
 * @param contentBlocks - The page builder content array from Sanity
 * @returns Deduplicated array of person data ready for JSON-LD
 */
export function extractPeopleFromContent(
  contentBlocks: any[] | null | undefined,
): PersonForJsonLd[] {
  if (!contentBlocks || !Array.isArray(contentBlocks)) return [];

  const seen = new Set<string>();
  const people: PersonForJsonLd[] = [];

  const addPerson = (member: any) => {
    if (!member?.name) return;
    const key = member._id || member.name;
    if (seen.has(key)) return;
    seen.add(key);
    people.push({
      name: member.fullname || member.name,
      position: member.position || null,
      email: member.email || null,
      imageUrl: member.image?.secure_url || member.image?.url || null,
      profileUrl: member.profileUrl || null,
      unitName: member.unit?.name || null,
    });
  };

  const extractFromBlock = (block: any) => {
    if (block?._type === "galleryPeopleStep" && Array.isArray(block.teamMembers)) {
      for (const member of block.teamMembers) addPerson(member);
    }
  };

  for (const block of contentBlocks) {
    if (!block?._type) continue;

    // Direct galleryPeopleStep blocks
    extractFromBlock(block);

    // Nested inside showtimeGallery steps
    if (block._type === "showtimeGallery" && Array.isArray(block.steps)) {
      for (const step of block.steps) extractFromBlock(step);
    }
  }

  return people;
}

/**
 * Generate a JSON-LD `@graph` containing Person entities.
 *
 * Use when a page displays team members (people galleries, team sections).
 */
export function generatePeopleListJsonLd(options: {
  people: PersonForJsonLd[];
}): JsonLdEntity {
  return {
    "@context": "https://schema.org",
    "@graph": options.people.map((person) => generatePersonJsonLd(person)),
  };
}

// =============================================================================
// BUSINESS UNIT EXTRACTION FROM PAGE BUILDER CONTENT
// =============================================================================

/**
 * Unit data extracted from page builder blocks for JSON-LD.
 */
export interface UnitForJsonLd {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
}

/**
 * Extract business units from page builder content blocks for JSON-LD.
 *
 * Scans for:
 * - `unitLogoGrid` blocks → `selectedUnits[]`
 * - `pageBuilderLogoFloat` blocks → `selectedUnits[]`
 *
 * @param contentBlocks - The page builder content array from Sanity
 * @returns Deduplicated array of unit data ready for JSON-LD
 */
export function extractUnitsFromContent(
  contentBlocks: any[] | null | undefined,
): UnitForJsonLd[] {
  if (!contentBlocks || !Array.isArray(contentBlocks)) return [];

  const seen = new Set<string>();
  const units: UnitForJsonLd[] = [];

  const addUnit = (unit: any) => {
    if (!unit?.name) return;
    const key = unit._id || unit.name;
    if (seen.has(key)) return;
    seen.add(key);
    units.push({
      name: unit.name,
      description: unit.description || unit.tagline || null,
      logoUrl: unit.logo?.secure_url || unit.logoUrl || null,
    });
  };

  for (const block of contentBlocks) {
    if (!block?._type) continue;

    if (
      (block._type === "unitLogoGrid" || block._type === "pageBuilderLogoFloat") &&
      Array.isArray(block.selectedUnits)
    ) {
      for (const unit of block.selectedUnits) addUnit(unit);
    }
  }

  return units;
}

/**
 * Generate a JSON-LD `@graph` containing Organization (sub-unit) entities.
 *
 * Use when a page displays business unit logos or cards.
 */
export function generateUnitsListJsonLd(options: {
  units: UnitForJsonLd[];
}): JsonLdEntity {
  return {
    "@context": "https://schema.org",
    "@graph": options.units.map((unit) => generateBusinessUnitJsonLd(unit)),
  };
}
