import {JsonLdScript, CANONICAL_URL} from '@msm/lib/structured-data';
import {buildMsmMetadata} from '@msm/lib/metadata';
import {msmPath} from "@msm/lib/editorial";
/**
 * Contact Page
 * ============
 *
 * Displays the MSM hero, source-backed company details and contact people.
 *
 * ## SEO (March 2026)
 *
 * - Full generateMetadata with title, description, OG image, keywords
 * - ContactPage JSON-LD + BreadcrumbList structured data
 * - Hero video poster preload for LCP optimization
 */
import MsmPageBuilder from "@msm/components/MsmPageBuilder";
import MsmSiteWrapper from "@msm/components/MsmSiteWrapper";
import NotFound from "@msm/components/ui/not-found";
import MsmContactDetailsBlock from '@msm/components/contact/MsmContactDetailsBlock';
import MsmContactPeopleBlock from '@msm/components/contact/MsmContactPeopleBlock';
import {getContactCompanies, getContactChannels} from '@msm/lib/contact-content';
import {getMsmContactPeople} from '@msm/lib/contact-data';
import { getAllCases, getAllServicesForChannel, getHomePage, getPageBySlug } from "@1sp/sanity-queries";
import { resolveImageUrl } from "@1sp/sanity-queries/image";
import { getChannelFromEnv, getSiteConfig } from "@1sp/site-config";
import type { Metadata } from "next";
import { getHeroPreloadData, HeroPreloadLinks } from "@/lib/hero-utils";
import {
  generateContactPageJsonLd,
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  hasAutoCaseListingBlocks,
  hasServicesGalleryBlock,
  mapCasesToItemList,
  mapServicesToCatalogItems,
  generateServiceCatalogJsonLd,
  extractCaseItemsFromContent,
  extractPeopleFromContent,
  generatePeopleListJsonLd,
  extractUnitsFromContent,
  generateUnitsListJsonLd,
  getBreadcrumbLabel,
} from "@/lib/structured-data";

export const revalidate = 60;
const CHANNEL = "msmWeb";
const SUPPORTED_LOCALES = getSiteConfig(getChannelFromEnv()).locales;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const language = locale || "en";

  const page = await getPageBySlug('contact', CHANNEL, language);

  if (!page) {
    return { title: "Contact" };
  }

  return buildMsmMetadata({locale: language, path: 'contact', title: page.title || 'Contact', metadata: page.metadata});
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const language = locale || "en";

  // Source documents are independent; React cache deduplicates metadata reads.
  const [page, disclaimer, homepage, contactPeople] = await Promise.all([
    getPageBySlug('contact', CHANNEL, language),
    getPageBySlug('disclaimer', CHANNEL, language),
    getHomePage(CHANNEL, language),
    getMsmContactPeople(language),
  ]);

  if (!page) {
    return (
      <MsmSiteWrapper language={language} navColor="light">
        <NotFound />
      </MsmSiteWrapper>
    );
  }

  const navbarVariant = page?.navbarVariant || "light";
  const authoredBlocks = (page.content || []) as any[];
  const companies = getContactCompanies(disclaimer?.content as any[] | undefined);
  const channels = getContactChannels(authoredBlocks);
  const mainEmail = companies[0]?.details.flatMap(block => block.markDefs || []).find(mark => typeof mark.href === 'string' && mark.href.startsWith('mailto:'))?.href as string | undefined;
  const authoredHero = authoredBlocks.find(block => ['oneSPHeader', 'servicesHeroWithBadge'].includes(block._type));
  const hero = authoredHero || {
    _type: 'oneSPHeader', _key: 'contact-hero', headlineMode: 'headlineReveal', eyebrow: '',
    headline: page.contactForm?.headline || (language === 'de' ? 'Kontaktiere uns' : 'Get in touch'),
    paragraphs: page.contactForm?.subheadline ? [{_type: 'block', _key: 'contact-intro', style: 'normal', markDefs: [], children: [{_type: 'span', _key: 'text', marks: [], text: page.contactForm.subheadline}]}] : [],
    media: homepage?.content?.find((block: any) => block._type === 'oneSPHeader')?.media,
    ...(mainEmail ? {cta: {text: mainEmail.replace('mailto:', ''), link: {linkType: 'external', externalUrl: mainEmail}}} : {}),
  };
  const supplementaryBlocks = authoredBlocks.filter(block => !['contact-links', 'social-links'].includes(block._key) && !['oneSPHeader', 'servicesHeroWithBadge', 'galleryPeopleStep'].includes(block._type));
  const contentBlocks = [hero, ...supplementaryBlocks];
  const needsAllCases = hasAutoCaseListingBlocks(contentBlocks);
  const hasServicesGallery = hasServicesGalleryBlock(contentBlocks);

  const [allCasesRaw, allServicesRaw] = await Promise.all([
    needsAllCases ? getAllCases(CHANNEL, language) : Promise.resolve([]),
    hasServicesGallery ? getAllServicesForChannel(CHANNEL, language) : Promise.resolve([]),
  ]);

  // LCP optimization: preload hero poster image
  const heroPreload = getHeroPreloadData(contentBlocks);

  // Extract structured data from page builder content
  const caseItems = extractCaseItemsFromContent(contentBlocks, mapCasesToItemList(allCasesRaw));
  const services = mapServicesToCatalogItems(allServicesRaw);
  const people = extractPeopleFromContent([...contentBlocks, {_type: 'galleryPeopleStep', teamMembers: contactPeople}]);
  const units = extractUnitsFromContent(contentBlocks);

  return (
    <MsmSiteWrapper language={language} navColor={navbarVariant}>
      {/* Structured Data (JSON-LD) */}
      <JsonLdScript locale={language}
        data={generateContactPageJsonLd({
          locale: language,
          title: page.metadata?.title || page.title || "Contact",
          description: page.metadata?.description,
        })}
      />
      <JsonLdScript locale={language}
        data={generateBreadcrumbJsonLd([
          {
            name: getBreadcrumbLabel(language, "home"),
            url: CANONICAL_URL,
          },
          {
            name: getBreadcrumbLabel(language, "contact"),
            url: `${CANONICAL_URL}${msmPath(language, "contact")}`,
          },
        ])}
      />
      {caseItems.length > 0 && (
        <JsonLdScript locale={language}
          data={generateItemListJsonLd({
            items: caseItems,
            locale: language,
            listName: "Case Studies",
          })}
        />
      )}
      {services.length > 0 && (
        <JsonLdScript locale={language}
          data={generateServiceCatalogJsonLd({
            services,
            locale: language,
            id: `${CANONICAL_URL}/contact#service-catalog`,
            name: "Services",
            url: `${CANONICAL_URL}${msmPath(language, "contact")}`,
          })}
        />
      )}
      {people.length > 0 && (
        <JsonLdScript locale={language} data={generatePeopleListJsonLd({ people })} />
      )}
      {units.length > 0 && (
        <JsonLdScript locale={language} data={generateUnitsListJsonLd({ units })} />
      )}

      {/* Preload the hero poster for fast LCP */}
      <HeroPreloadLinks {...heroPreload} />

      <div className="min-h-screen">
        <div className="min-h-screen px-1 md:px-2">
          <MsmPageBuilder content={[hero]} language={language} channel={CHANNEL} />
          <MsmContactDetailsBlock companies={companies} channels={channels} language={language} />
          <MsmContactPeopleBlock people={contactPeople} language={language} />
          {supplementaryBlocks.length ? (
            <MsmPageBuilder
              content={supplementaryBlocks}
              language={language}
              channel={CHANNEL}
              deferAfter={2}
            />
          ) : null}
        </div>
      </div>
    </MsmSiteWrapper>
  );
}
