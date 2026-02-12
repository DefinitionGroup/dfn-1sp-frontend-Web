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

export const CANONICAL_URL = "https://1sp.agency";
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
      "@id": `${CANONICAL_URL}/${locale}`,
      url: `${CANONICAL_URL}/${locale}`,
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

  const pageUrl = `${CANONICAL_URL}/${locale}/cases/${slug}`;

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
  const pageUrl = `${CANONICAL_URL}/${locale}/${slug}`;

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
