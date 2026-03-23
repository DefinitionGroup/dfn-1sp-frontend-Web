/**
 * Contact Page
 * ============
 *
 * Displays the contact page with PageBuilder content and contact form.
 *
 * ## SEO (March 2026)
 *
 * - Full generateMetadata with title, description, OG image, keywords
 * - ContactPage JSON-LD + BreadcrumbList structured data
 * - Hero video poster preload for LCP optimization
 */
import { cookies } from "next/headers";
import { PageBuilder } from "@/components/PageBuilder";
import SiteWrapper from "@/components/SiteWrapper";
import NotFound from "@/components/ui/not-found";
import ContactForm from "@/components/ui/ContactForm";
import { getPageBySlug } from "@/lib/sanity/queries";
import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";
import { urlFor } from "@/sanity/lib/image";
import type { Metadata } from "next";
import { getHeroPreloadData, HeroPreloadLinks } from "@/lib/hero-utils";
import {
  JsonLdScript,
  generateContactPageJsonLd,
  generateBreadcrumbJsonLd,
  extractPeopleFromContent,
  generatePeopleListJsonLd,
  extractUnitsFromContent,
  generateUnitsListJsonLd,
  getBreadcrumbLabel,
  CANONICAL_URL,
} from "@/lib/structured-data";

export const revalidate = 60;
const SUPPORTED_LOCALES = ["en"];

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const { locale } = await params;
  const language = locale || "en";

  const page = await getPageBySlug("contact", channel, language);

  if (!page) {
    return { title: "Contact" };
  }

  const title = page.metadata?.title || page.title || "Contact";
  const description = page.metadata?.description;

  const ogImages = page.metadata?.image
    ? [
      {
        url: urlFor(page.metadata.image).width(1200).height(630).url(),
        width: 1200,
        height: 630,
        alt: title,
      },
    ]
    : [];

  return {
    title,
    description,
    keywords: page.metadata?.keywords ?? undefined,
    alternates: {
      canonical: "/contact",
    },
    openGraph: {
      title,
      description: description || undefined,
      locale: language,
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || undefined,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const language = locale || "en";

  // Uses cached fetch from centralized data layer
  const page = await getPageBySlug("contact", channel, language);

  if (!page) {
    return (
      <SiteWrapper channel={channel} language={language} navColor="light">
        <NotFound />
      </SiteWrapper>
    );
  }

  const navbarVariant = page?.navbarVariant || "light";

  // LCP optimization: preload hero poster image
  const heroPreload = getHeroPreloadData(page?.content1sp as any[] | undefined);

  // Extract people and units from page builder content for JSON-LD
  const people = extractPeopleFromContent(page.content1sp as any[] | undefined);
  const units = extractUnitsFromContent(page.content1sp as any[] | undefined);

  return (
    <SiteWrapper channel={channel} language={language} navColor={navbarVariant}>
      {/* Structured Data (JSON-LD) */}
      <JsonLdScript
        data={generateContactPageJsonLd({
          locale: language,
          title: page.metadata?.title || page.title || "Contact",
          description: page.metadata?.description,
        })}
      />
      <JsonLdScript
        data={generateBreadcrumbJsonLd([
          {
            name: getBreadcrumbLabel(language, "home"),
            url: CANONICAL_URL,
          },
          {
            name: getBreadcrumbLabel(language, "contact"),
            url: `${CANONICAL_URL}/contact`,
          },
        ])}
      />
      {people.length > 0 && (
        <JsonLdScript data={generatePeopleListJsonLd({ people })} />
      )}
      {units.length > 0 && (
        <JsonLdScript data={generateUnitsListJsonLd({ units })} />
      )}

      {/* Preload the hero poster for fast LCP */}
      <HeroPreloadLinks {...heroPreload} />

      <HamburgerGradientMenu />
      <div className="min-h-screen">
        <div className="min-h-screen px-1 md:px-2">
          {page.content1sp?.length ? (
            <PageBuilder
              content={page.content1sp}
              language={language}
              deferAfter={2}
            />
          ) : null}
          <ContactForm
            language={language}
            channel={channel}
            settings={page.contactForm}
          />
        </div>
      </div>
    </SiteWrapper>
  );
}
